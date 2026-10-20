/*
 * AVHII Rent App PWA service worker.
 * Never serve an old cached HTML shell ahead of a new deployment. Vite uses
 * content-hashed JS/CSS filenames, so an old index.html can point to assets
 * that Vercel no longer serves and leave an installed PWA on a blank screen.
 *
 * Keep user data untouched: no localStorage / IndexedDB / app data deletion.
 */
const VERSION = 'v2';
const PREFIX = 'avhii-rent-';
const ASSET_CACHE = `${PREFIX}assets-${VERSION}`;
const HTML_CACHE = `${PREFIX}html-${VERSION}`;

self.addEventListener('install', (event) => {
  // Do not precache / or /index.html: a newly installed worker must start
  // with an up-to-date HTML document fetched from the server.
  event.waitUntil((async () => {
    const cache = await caches.open(ASSET_CACHE);
    await Promise.allSettled([
      cache.add('/manifest.webmanifest'),
      cache.add('/cat-mascot.svg'),
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(PREFIX) &&
          key !== ASSET_CACHE && key !== HTML_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    // Network first: always get the current Vite HTML and asset hashes.
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok && response.type === 'basic') {
          const cache = await caches.open(HTML_CACHE);
          await cache.put('/index.html', response.clone());
        }
        return response;
      } catch (error) {
        // Offline-only fallback. Cached HTML is never preferred when online.
        const cached = await caches.match('/index.html');
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    // Hashed Vite files are immutable; cache only successfully loaded assets.
    event.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
