const CACHE = 'jarvis-v1';
const FILES = [
  '/noor-ai-studio/',
  '/noor-ai-studio/index.html',
  '/noor-ai-studio/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
