const CACHE = 'miebau-static-v2';
const CORE = ['/', '/css/style.css', '/js/site.js', '/js/seo.js', '/assets/favicon.svg', '/manifest.webmanifest', '/404.html'];

self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));

self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/404.html')));
    return;
  }

  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request);
    const networkFetch = fetch(event.request, { cache: 'no-store' }).then(response => {
      cache.put(event.request, response.clone());
      return response;
    });
    if (cached) {
      event.waitUntil(networkFetch.catch(() => {}));
      return cached;
    }
    return networkFetch.catch(() => cached);
  }));
});
