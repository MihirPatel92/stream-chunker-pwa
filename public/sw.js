const CACHE_NAME = 'streamplex-v1';
const VIDEO_CACHE = 'video-chunks-v1';

// Cache video chunks and essential assets
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Handle video chunks with special caching strategy
  if (event.request.url.includes('.m3u8') || event.request.url.includes('.ts')) {
    event.respondWith(
      caches.open(VIDEO_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            // Cache successful video chunk responses
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
  } else {
    // Standard caching strategy for other resources
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== VIDEO_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});