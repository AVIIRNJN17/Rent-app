import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/live' });

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Google Maps Grounding Search Endpoint
  app.post('/api/maps/search', async (req, res) => {
    try {
      const { query, latitude, longitude, address } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets.',
        });
      }

      const ai = new GoogleGenAI({});

      const promptContext = address ? `Near address: ${address}. ` : '';
      const promptQuery = query || 'Find nearby grocery supermarkets, convenience stores, and electricity bill payment centers';
      const fullPrompt = `${promptContext}${promptQuery}`;

      const toolConfig =
        latitude && longitude
          ? {
              retrievalConfig: {
                latLng: {
                  latitude: Number(latitude),
                  longitude: Number(longitude),
                },
              },
            }
          : undefined;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullPrompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig,
        },
      });

      const text = response.text || '';
      const candidate = response.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

      // Extract structured places from grounding chunks
      const places: Array<{
        title: string;
        uri: string;
        reviewSnippets?: string[];
      }> = [];

      for (const chunk of groundingChunks) {
        const mapsData = (chunk as any).maps;
        if (mapsData) {
          places.push({
            title: mapsData.title || 'View on Google Maps',
            uri: mapsData.uri,
            reviewSnippets: mapsData.placeAnswerSources?.reviewSnippets?.map((r: any) => r.snippet || r) || [],
          });
        }
      }

      res.json({
        text,
        places,
        groundingChunks,
      });
    } catch (err: any) {
      console.error('Error in /api/maps/search:', err);
      res.status(500).json({
        error: err.message || 'Error occurred while querying Google Maps grounding',
      });
    }
  });

  // Gemini Live Audio WebSocket Bridge
  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('Client connected to /live WebSocket');
    let session: any = null;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        clientWs.send(
          JSON.stringify({
            error: 'GEMINI_API_KEY is not configured on server. Please configure it in Settings > Secrets.',
          })
        );
        return;
      }

      const ai = new GoogleGenAI({});

      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          // @ts-ignore
          outputAudioTranscription: {},
          // @ts-ignore
          inputAudioTranscription: {},
          systemInstruction:
            'You are the royal AI voice companion for AVHII RENT APP created by Abhishek Ranjan. Speak warmly, respectfully, and concisely in either Hindi or English based on how the user addresses you. You help roommates calculate rent balances, track meter reading electricity bills, manage monthly ration budgets, and settle expenses. Keep responses friendly, natural, and brief for spoken voice conversation.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            try {
              // 1. Audio stream payload
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ audio }));
              }

              // 2. Text parts if any
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts) {
                for (const p of parts) {
                  if (p.text && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ text: p.text, sender: 'assistant' }));
                  }
                }
              }

              // 3. Audio transcriptions if emitted
              const outputTrans = (message.serverContent as any)?.outputAudioTranscription?.text;
              if (outputTrans && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ text: outputTrans, sender: 'assistant' }));
              }

              const inputTrans = (message.serverContent as any)?.inputAudioTranscription?.text;
              if (inputTrans && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ text: inputTrans, sender: 'user' }));
              }

              // 4. Interruption notification
              if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
            } catch (err) {
              console.error('Error sending message to client WS:', err);
            }
          },
          onerror: (err: any) => {
            console.error('Gemini Live session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  error: err?.message || 'Gemini Live session encountered an error',
                })
              );
            }
          },
          onclose: () => {
            console.log('Gemini Live session closed');
          },
        },
      });

      clientWs.send(JSON.stringify({ ready: true }));

      clientWs.on('message', (rawData) => {
        try {
          const payload = JSON.parse(rawData.toString());

          if (payload.audio && session) {
            session.sendRealtimeInput({
              audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (payload.text && session) {
            try {
              if (typeof (session as any).sendClientContent === 'function') {
                (session as any).sendClientContent({
                  turns: [{ role: 'user', parts: [{ text: payload.text }] }],
                  turnComplete: true,
                });
              } else if (typeof session.sendRealtimeInput === 'function') {
                session.sendRealtimeInput({
                  text: payload.text,
                });
              }
            } catch (textErr) {
              console.error('Error sending text to Live session:', textErr);
            }
          }
        } catch (err) {
          console.error('Error processing client WS message:', err);
        }
      });

      clientWs.on('close', () => {
        console.log('Client WS connection closed');
        try {
          if (session && typeof session.close === 'function') {
            session.close();
          }
        } catch (e) {
          // ignore
        }
      });
    } catch (err: any) {
      console.error('Failed to initialize Gemini Live session:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            error: err.message || 'Failed to establish Gemini Live connection',
          })
        );
      }
    }
  });

  // Mount Vite middleware in development or serve static in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AVHII RENT APP server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
