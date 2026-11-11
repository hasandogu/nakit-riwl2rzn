// Kendi dosyalarımız: önce ağ (güncel kalsın), olmazsa önbellek.
// CDN dosyaları (React, Recharts...): önce önbellek (sürümleri sabit), ilk yüklemede kaydedilir.
const C = 'nakit-akisi-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.json', './icon-180.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const own = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(own
    ? fetch(e.request).then(r => { const c = r.clone(); caches.open(C).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request))
    : caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(C).then(x => x.put(e.request, c)); }
        return r; })));
});
