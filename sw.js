/* ============================================================
   Service Worker – Landsgemeinde 2026
   Cacht nur die App-Shell (HTML/CSS/JS), nicht die API-Calls.
   ============================================================ */

const CACHE  = 'lg2026-v1';
const SHELL  = ['/', '/index.html', '/style.css', '/app.js', '/config.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only cache GET requests for same-origin shell assets
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
