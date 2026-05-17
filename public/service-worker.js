const CACHE_NAME = "ticketmaster-zik-v9";
// NOTE: With Expo Router, there's no static index.html - it's generated dynamically
// So we don't pre-cache it. Only cache truly static assets.
const APP_SHELL_ASSETS = [
  "/manifest.json",
  "/icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL_ASSETS).catch(() => {
        // If pre-caching fails, that's okay - we'll cache on first access
        console.warn(
          "Service Worker: Pre-caching failed, will cache on demand",
        );
      }),
    ),
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
            .map((key) => caches.delete(key)),
        ).then(() => self.clients.claim()),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    // For navigation requests (HTML pages), always try network first
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }
          const responseClone = response.clone();
          void caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(async () => {
          // Network failed, try cache
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          // If nothing in cache, fall back to root
          return caches.match("/").catch(() => {
            return new Response("Offline - app shell not available", {
              status: 503,
              statusText: "Service Unavailable",
            });
          });
        }),
    );
    return;
  }

  // For non-navigate requests, use cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            void caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // Network failed and nothing in cache
          // Return a basic offline response for images/styles
          if (request.destination === "image") {
            return caches.match("/icon.png").catch(() => {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ccc" width="100" height="100"/></svg>',
                { headers: { "Content-Type": "image/svg+xml" } },
              );
            });
          }
          return new Response("Resource unavailable offline", { status: 503 });
        });
    }),
  );
});
