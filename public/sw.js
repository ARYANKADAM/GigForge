/* Basic service worker: minimal install/activate/fetch handling */

self.addEventListener('install', (event) => {
  console.log('Service worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Try network first, fall back to cache if offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
