const CACHE_NAME = "ask-your-lawyer-cache-v4";
const ASSETS_TO_CACHE = [
  "/nbs-legal-chatbot/",
  "/nbs-legal-chatbot/index.html",
  "/nbs-legal-chatbot/logo.png",
  "/nbs-legal-chatbot/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Don't cache external file URLs or API calls
  if (url.hostname !== self.location.hostname && 
      (url.pathname.includes('/uploads/') || url.pathname.includes('/files/'))) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (url.pathname === "/" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, responseToCache);
            } catch (err) {
              console.debug("Cache put error:", err);
            }
          });

          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first strategy for other assets
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            // Only cache successful responses
            if (
              !response ||
              response.status !== 200 ||
              response.type === "error"
            ) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(event.request, responseToCache);
              } catch (err) {
                console.debug("Cache put error:", err);
              }
            });

            return response;
          })
          .catch(() => caches.match("/index.html"));
      })
    );
  }
});
