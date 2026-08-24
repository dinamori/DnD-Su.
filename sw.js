/*
  СЛУЖЕБНЫЙ ПОТОК (Service Worker)
  =================================
  Каждый раз, когда вы обновляете гримуар (добавили персонажа, поменяли код),
  увеличьте CACHE_VERSION на единицу. Это заставит приложение у всех
  пользователей скачать новую версию и показать плашку «Доступно обновление».
*/

var CACHE_VERSION = "grimoire-v2";

var CORE_ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "characters.js",
  "manifest.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_VERSION; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var networkFetch = fetch(event.request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_VERSION).then(function (cache) {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(function () { return cached; });

      return cached || networkFetch;
    })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
