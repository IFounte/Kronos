const CACHE_NAME = 'kronos-v59';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './assets/forest_bg.png',
    './assets/desert_bg.png',
    './assets/snowy_bg.png',
    './assets/beach_bg.png',
    './assets/night_bg.png',
    './assets/rain_bg.png',
    './assets/aurora_bg.jpg',
    './assets/cyberpunk_bg.jpg',
    './assets/autumn_bg.jpg',
    './assets/space_bg.jpg',
    './assets/sakura_bg.jpg',
    './assets/volcano_bg.jpg',
    './assets/bamboo_bg.jpg',
    './assets/selimiye_bg.jpg',
    './assets/kaba_bg.jpg',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event (Delete old caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Network First, Cache Fallback)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network response is good, clone it and update the cache
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed (offline), use cache
                return caches.match(event.request);
            })
    );
});
