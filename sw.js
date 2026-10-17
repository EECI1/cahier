/* Cahier de Boutique : fonctionnement sans internet. L'application est servie depuis le téléphone, puis mise à jour en arrière-plan quand il y a du réseau. */
const CACHE = 'cahier-boutique-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, {ignoreSearch: true}) || (u.pathname.endsWith('/') ? await c.match('./') : null);
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(u.pathname.endsWith('/') ? './' : u.pathname, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
