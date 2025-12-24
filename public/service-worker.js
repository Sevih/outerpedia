// /public/service-worker.js

const CACHE_NAME = 'outerpedia-cache-v8.4.26';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/logo.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/images/icons/icon-maskable-512x512.png',
  '/images/splash/splashscreen-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 👈 Force le SW à s'installer immédiatement
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim()) // 👈 ICI
  );
});


self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/')) {
    return;
  }

  // NE JAMAIS SERVIR DU HTML DU CACHE
  if (event.request.mode === 'navigate') {
    // Just fetch and update clients
    event.respondWith(
      fetch(event.request).then(response => {
        // enregistre dans le cache pour offline si tu veux
        const clone = response.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        );
        return response;
      })
    );
    return;
  }

  // Cache-first pour les assets non HTML
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});


// 🔥 Nouvelle écoute : message envoyé au client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
