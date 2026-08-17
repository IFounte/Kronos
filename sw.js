const CACHE_NAME = 'kronos-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './assets/forest_bg.png',
    './assets/desert_bg.png',
    './assets/snowy_bg.png',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
