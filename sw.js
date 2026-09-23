const CACHE_NAME = 'flysend-v4';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png'
];

// Google Fonts (Outfit + Inter) used by the page, cached up front so text
// renders in the right fonts offline even right after install. The font file
// URLs depend on the browser, so the stylesheet is fetched here (same browser,
// so same URLs), and the .woff2 files it lists are cached from it. Fonts are
// fetched with CORS, as the browser does for web fonts.
const FONTS_CSS = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap';

function cacheable(response) {
  return response && (response.ok || response.type === 'opaque');
}

// Best effort: one unreachable file must not abort the whole install.
function precache(cache, request) {
  return fetch(request)
    .then((response) => (cacheable(response) ? cache.put(request, response) : undefined))
    .catch(() => {});
}

function precacheFonts(cache) {
  return fetch(FONTS_CSS, { mode: 'cors' })
    .then((response) => {
      if (!response.ok) return;
      return response.clone().text().then((css) => {
        const fontUrls = [...new Set((css.match(/url\((https:[^)]+)\)/g) || []).map((u) => u.slice(4, -1)))];
        return Promise.all([
          cache.put(FONTS_CSS, response),
          ...fontUrls.map((url) => precache(cache, new Request(url, { mode: 'cors' })))
        ]);
      });
    })
    .catch(() => {});
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all([
      ...ASSETS.map((url) => precache(cache, new Request(url, { cache: 'reload' }))),
      precacheFonts(cache)
    ]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          // FlyLog, FlySend, FlyStock and FlySky share the steelgar-code.github.io
          // origin, and Cache Storage is per origin: only delete FlySend's own
          // old caches, never the other apps' offline copies.
          .filter((key) => key.startsWith("flysend-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache with the fresh network response. Cross-origin files
        // loaded without CORS (e.g. the Google Fonts stylesheet) are opaque,
        // which is fine to cache; error responses never replace a good copy.
        if (cacheable(response)) {
          const responseClone = response.clone();

          event.waitUntil(
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone))
              .catch(() => {})
          );
        }

        return response;
      })
      .catch(() => {
        // Network unavailable → use cached version
        return caches.match(event.request);
      })
  );
});
