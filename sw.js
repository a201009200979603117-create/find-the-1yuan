// 離線玩：第一次打開時把遊戲和 three.js 存在手機裡，之後沒網路也能開
// 遊戲檔每次先上網拿最新的，拿不到才用存著的；three.js 和圖示直接用存著的
const CACHE = 'ft1y-v1';
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const CORE = ['./', './index.html', './find-the-1yuan.html', './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([
    c.addAll(CORE),
    fetch(THREE_URL, { mode: 'cors' }).then(r => r.ok && c.put(THREE_URL, r))
  ])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const page = req.mode === 'navigate' || (url.origin === location.origin && /\.(html|webmanifest)$|\/$/.test(url.pathname));
  if (page) {
    // 先上網，拿到就順便更新存著的；沒網路才用存著的
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(url.pathname.endsWith('/') ? './' : req, cp)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./find-the-1yuan.html'))));
    return;
  }
  if (url.href === THREE_URL || url.origin === location.origin) {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
      if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
      return r;
    })));
  }
});
