const CACHE = 'quiz-app-v1';
const ASSETS = [
  './',
  './index.html',
  './questions.json',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// 安裝:預先快取核心檔案
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// 啟用:清掉舊版快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// 抓取策略:
// questions.json 用「網路優先」(有網路就拿最新題庫,失敗才用快取)
// 其他檔用「快取優先」(離線也能開)
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (url.includes('questions.json')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request))
    );
  }
});
