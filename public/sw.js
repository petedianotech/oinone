self.options = {
    "domain": "3nbf4.com",
    "zoneId": 11124727
}
self.lary = ""
try {
  importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')
} catch (e) {
  console.error("Monetag script import skipped/failed:", e);
}

const CACHE_NAME = 'oinone-blog-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/oinone_blog_icon.jpg',
  '/manifest.json',
  '/premium_og_image.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== 'GET' || 
      requestUrl.protocol === 'chrome-extension:' ||
      requestUrl.host.includes('3nbf4.com') ||
      requestUrl.host.includes('n6wxm.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (response.status === 200 && (
          requestUrl.origin === self.location.origin ||
          requestUrl.host.includes('images.unsplash.com') ||
          requestUrl.host.includes('i.ibb.co') ||
          requestUrl.host.includes('fonts.googleapis.com') ||
          requestUrl.host.includes('fonts.gstatic.com')
        )) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch((err) => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
        throw err;
      });
    })
  );
});
