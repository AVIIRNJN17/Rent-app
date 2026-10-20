/**
 * AVHII Rent App — Vercel Gemini Live WebSocket Function.
 *
 * The browser connects to /api/live; this server connects to Gemini using
 * GEMINI_API_KEY from Vercel's protected Production environment.
 * Never send the long-lived API key to the browser.
 */
import { createServer } from 'node:http';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import { WebSocket, WebSocketServer } from 'ws';

const MODEL = 'gemini-3.8-live';
const server = createServer((_req, res) => {
  res.writeHead(426, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify({ error: 'This endpoint requires a WebSocket connection.' }));
});
const wss = new WebSocketServer({ server, maxPayload: 256 * 1024 });

wss.on('connection', async (browser: WebSocket, req) => {
  // Browsers send an Origin; permit only this app's own host to discourage
  // cross-site use of the server-side Gemini API quota.
  const origin = req.headers.origin;
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  try {
    if (!origin || !host || new URL(origin).host !== host) {
      browser.close(1008, 'Origin not allowed');
      return;
    }
  } catch {
    browser.close(1008, 'Invalid Origin');
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  const send = (payload: Record<string, unknown>) => {
    if (browser.readyState === WebSocket.OPEN) {
      browser.send(JSON.stringify(payload));
    }
  };

  if (!key) {
    send({ error: 'Voice service has not been configured. Contact the app owner.' });
    browser.close(1011, 'Service not configured');
    return;
  }

  type LiveSession = Awaited<ReturnType<GoogleGenAI['live']['connect']>>;
  let session: LiveSession | null = null;
  let clientClosed = false;

  browser.on('close', () => {
    clientClosed = true;
    try { session?.close(); } catch { /* already closed */ }
  });
  browser.on('error', (error) => {
    console.error('Voice browser WebSocket error:', error.message);
  });

  browser.on('message', (raw) => {
    if (!session || clientClosed) return;
    try {
      const data = JSON.parse(raw.toString());
      if (typeof data.audio === 'string' && data.audio.length < 256 * 1024) {
        session.sendRealtimeInput({
          audio: { data: data.audio, mimeType: 'audio/pcm;rate=16000' },
        });
      } else if (typeof data.text === 'string' && data.text.trim()) {
        session.sendRealtimeInput({ text: data.text.slice(0, 4000) });
      }
    } catch (error) {
      console.error('Invalid voice message:', error);
      send({ error: 'Could not process the voice message.' });
    }
  });

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    session = await ai.live.connect({
      model: MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction:
          'You are the Royal AI Voice Companion for AVHII RENT APP by Abhishek Ranjan. ' +
          'Respond warmly and concisely in Hindi or English to match the user. ' +
          'Help with rent, electricity bills, monthly ration budgets and roommate settlements. ' +
          'Do not claim to have read private app data unless it was provided in the conversation.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const content = message.serverContent;
          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) send({ audio: part.inlineData.data });
            if (part.text) send({ text: part.text, sender: 'assistant' });
          }
          if (content?.outputTranscription?.text) {
            send({ text: content.outputTranscription.text, sender: 'assistant' });
          }
          if (content?.inputTranscription?.text) {
            send({ text: content.inputTranscription.text, sender: 'user' });
          }
          if (content?.interrupted) send({ interrupted: true });
        },
        onerror: (error) => {
          console.error('Gemini Live error:', error);
          send({ error: 'Gemini Live connection encountered an error. Try reconnecting.' });
          if (browser.readyState === WebSocket.OPEN) browser.close(1011, 'Gemini error');
        },
        onclose: () => {
          if (browser.readyState === WebSocket.OPEN) browser.close(1000, 'Gemini closed');
        },
      },
    });
    if (clientClosed) {
      session.close();
      return;
    }
    send({ ready: true });
  } catch (error) {
    console.error('Gemini Live connection failed:', error);
    send({ error: 'Unable to connect to Gemini Live. Check Vercel function logs.' });
    if (browser.readyState === WebSocket.OPEN) browser.close(1011, 'Connection failed');
  }
});

export default server;
