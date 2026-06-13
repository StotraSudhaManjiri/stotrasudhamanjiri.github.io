const CACHE_NAME = 'stotra-cache-v1';
const CORE_ASSETS = [
  '/',
  '/style.css',
  '/manifest.json'
];

// Install Event: Pre-cache the core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Fetch Event: Serve from network, save a copy, fallback to cache if offline
self.addEventListener('fetch', event => {
  // Only cache GET requests (HTML, CSS, etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save a copy of the visited page for offline use
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails (offline), load from the cache
        return caches.match(event.request);
      })
  );
});