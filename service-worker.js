const CACHE_NAME = 'ruota-scales-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/note-click.mp3',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-152.png',
  '/icons/apple-167.png',
  '/icons/apple-180.png',
  '/icons/splash-portrait.png',
  '/icons/splash-landscape.png',
  '/icons/favicon-light.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Serve app shell from cache first
  if (req.method === 'GET' && ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
    return;
  }

  // For other GET requests use stale-while-revalidate
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req).then(resp => {
          if (resp && resp.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone()));
          }
          return resp;
        }).catch(() => null);
        return cached || network;
      })
    );
  }
});
