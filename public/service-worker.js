const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/css/styles.css",
  "/js/index.js",
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-512x512.png",
];

const CACHE_NAME = "static-cache";
const DATA_CACHE_NAME = "data-cache";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Your files were pre-cached successfully!\n", cache);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      console.log("keyList:\n", keyList);
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("what is a key?\n", key);
            console.log("Removing old cache data");
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("/api/")) {
    console.log("[Service Worker] Fetch (data)", e.request.url);

    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(e.request)
            .then((res) => {
              if (res.status === 200) {
                cache.put(e.request.url, response.clone());
              }
              console.log("response\n", res);
              return res;
            })
            .catch((err) => {
              return cache.match(e.request);
            });
        })
        .catch((err) => {
          console.log(err);
        })
    );
    return;
  }
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((res) => {
        return res || fetch(e.request);
      });
    })
  );
});
