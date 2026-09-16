// JAM AI Service Worker - Safe Self-Unregistering & Pass-Through
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Pass-through: Do NOT intercept or cache any dev or runtime requests
self.addEventListener('fetch', () => {
  // Let network handle all requests natively
});
