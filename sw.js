const CACHE = 'quiz-app-v2';
// 相對於 sw.js 所在資料夾的資源
const ASSETS = [
  'index.html',
  'questions.json',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())  // 即使某檔快取失敗也不卡住
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 只處理同源 GET,其他放行
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('questions.json')) {
    // 題庫:網路優先
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // 其他:快取優先,沒有再連網
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request))
    );
  }
});
