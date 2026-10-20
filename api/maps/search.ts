/**
 * AVHII Rent App: Google Maps grounded search for Vercel.
 * API key stays server-side. The existing browser UI POSTs to this route.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';

type RequestWithBody = IncomingMessage & { body?: unknown };

const MODEL = 'gemini-3.8-flash';
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;
// Best-effort per-instance limit. Production deployments should also apply
// Vercel WAF / rate limiting for dependable quota protection.
const requestCounts = new Map<string, { count: number; resetsAt: number }>();

function sendJson(res: ServerResponse, status: number, payload: object) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

function isValidHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch { return false; }
}

export default async function handler(req: RequestWithBody, res: ServerResponse) {
  if (req.method === 'GET') {
    sendJson(res, 200, { service: 'maps-search', status: 'ready' });
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  // Same-origin browser requests only. This is not a replacement for
  // authentication or a platform-level rate limiter.
  const origin = req.headers.origin;
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = (typeof forwardedHost === 'string' ? forwardedHost : req.headers.host)?.split(',')[0]?.trim();
  if (origin) {
    try {
      if (!host || new URL(origin).host !== host) {
        sendJson(res, 403, { error: 'Cross-origin Maps requests are not allowed.' });
        return;
      }
    } catch {
      sendJson(res, 403, { error: 'Invalid Origin header.' });
      return;
    }
  }

  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.includes('application/json')) {
    sendJson(res, 415, { error: 'Expected a JSON request.' });
    return;
  }

  const length = Number(req.headers['content-length'] ?? 0);
  if (Number.isFinite(length) && length > 8192) {
    sendJson(res, 413, { error: 'Search request is too large.' });
    return;
  }

  let body: Record<string, unknown>;
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      body = req.body as Record<string, unknown>;
    } else {
      sendJson(res, 400, { error: 'Invalid search request.' });
      return;
    }
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body.' });
    return;
  }

  const query = typeof body.query === 'string' ? body.query.trim().slice(0, 300) : '';
  const address = typeof body.address === 'string' ? body.address.trim().slice(0, 300) : '';
  const latitude = typeof body.latitude === 'number' ? body.latitude : null;
  const longitude = typeof body.longitude === 'number' ? body.longitude : null;
  const hasCoordinates = latitude !== null && longitude !== null &&
    Number.isFinite(latitude) && Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;

  if (!query || query.length < 3) {
    sendJson(res, 400, { error: 'Enter what you want to find.' });
    return;
  }
  if (!hasCoordinates && !address) {
    sendJson(res, 400, { error: 'Enter your room address/area or tap Use My GPS before searching nearby places.' });
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, { error: 'Maps search is not configured on the server. Please contact the app owner.' });
    return;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (typeof forwardedFor === 'string' ? forwardedFor : 'anonymous').split(',')[0].trim().slice(0, 80);
  const now = Date.now();
  const entry = requestCounts.get(ip);
  const count = entry && now < entry.resetsAt ? entry : { count: 0, resetsAt: now + WINDOW_MS };
  if (count.count >= MAX_REQUESTS_PER_WINDOW) {
    sendJson(res, 429, { error: 'Too many searches. Please wait a few minutes before trying again.' });
    return;
  }
  count.count += 1;
  requestCounts.set(ip, count);
  if (requestCounts.size > 500) {
    for (const [key, value] of requestCounts) {
      if (value.resetsAt <= now) requestCounts.delete(key);
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `${address ? `Near ${address}. ` : ''}${query}. ` +
      'Use Google Maps sources for nearby places. Prefer verified results and concise, useful location descriptions.';
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        ...(hasCoordinates
          ? { toolConfig: { retrievalConfig: { latLng: { latitude, longitude } } } }
          : {}),
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const seen = new Set<string>();
    const places = chunks.flatMap((chunk) => {
      const place = chunk.maps;
      if (!place || !isValidHttpUrl(place.uri) || seen.has(place.uri)) return [];
      seen.add(place.uri);
      return [{
        title: typeof place.title === 'string' ? place.title : 'Google Maps place',
        uri: place.uri,
        reviewSnippets: (place.placeAnswerSources?.reviewSnippets ?? [])
          .map((review) => review?.snippet)
          .filter((snippet): snippet is string => typeof snippet === 'string')
          .slice(0, 2),
      }];
    }).slice(0, 20);

    sendJson(res, 200, {
      text: response.text || (places.length ? 'Places found using Google Maps.' : 'No grounded places were found. Try a more specific location.'),
      places,
    });
  } catch (error: unknown) {
    const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 500;
    console.error('Maps grounding request failed', {
      status: Number.isFinite(status) ? status : 500,
      message: error instanceof Error ? error.message.slice(0, 250) : 'Unknown error',
    });
    if (status === 429) {
      sendJson(res, 429, { error: 'Gemini Maps quota or rate limit reached. Please try again later.' });
    } else if (status === 400 || status === 403) {
      sendJson(res, 502, { error: 'Google Maps grounding is unavailable for this API key or project. Check Google AI Studio billing and API access.' });
    } else {
      sendJson(res, 502, { error: 'Maps search is temporarily unavailable. Please retry shortly.' });
    }
  }
}
