/* Maestro PWA Service Worker - Master431 Android standalone
   Client-side PWA only. Does not modify Cloud/Sync/Worker backend logic. */
const MAESTRO_PWA_CACHE = 'maestro-pwa-master431-index-v1';
const MAESTRO_APP_SHELL = [
  './index.html',
  './manifest.webmanifest',
  './maestro-icon-192.png',
  './maestro-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(MAESTRO_PWA_CACHE)
      .then((cache) => cache.addAll(MAESTRO_APP_SHELL))
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => key !== MAESTRO_PWA_CACHE ? caches.delete(key) : Promise.resolve(false))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Do not interfere with API/Cloud calls: only navigation and same-origin static files are handled.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(MAESTRO_PWA_CACHE).then((cache) => cache.put(req, copy)).catch(() => null);
      return res;
    }).catch(() => caches.match(req))
  );
});
