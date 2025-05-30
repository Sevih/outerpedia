// /public/service-worker.js

const CACHE_NAME = 'outerpedia-cache-v1.24.19';
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


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 🔥 Nouvelle écoute : message envoyé au client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
