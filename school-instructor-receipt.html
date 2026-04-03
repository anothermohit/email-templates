// Basic Service Worker for PWA

self.addEventListener('install', event => {
  console.log('SW installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW activated');
  self.clients.claim();
});

// Optional caching (recommended for your app)
const CACHE_NAME = 'orbits-pwa-v1';
const ASSETS = [
  './',
  './index.html',   // change if your file name is different
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(res =>
        res || fetch(event.request).then(fetchRes => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        })
      )
    )
  );
});