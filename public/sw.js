const CACHE_NAME = 'back2u-cache-v3';
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/pwa-192.png',
  '/pwa-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Purging old service worker cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // NEVER cache HTML pages or navigation or API requests - always live from network!
  if (
    event.request.mode === 'navigate' ||
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('?')
  ) {
    return;
  }

  // Network-first for static icons
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
