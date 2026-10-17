const CACHE_NAME = "ticketmaster-zik-v15";
const IS_LOCAL_PREVIEW = ["localhost", "127.0.0.1", "[::1]"].includes(self.location.hostname);
const APP_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  if (!IS_LOCAL_PREVIEW) event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("ticketmaster-zik-") && (IS_LOCAL_PREVIEW || key !== CACHE_NAME))
          .map((key) => caches.delete(key)),
      ).then(() => self.clients.claim()),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Metro module IDs and HMR updates must always come from the same server graph.
  // Never intercept local development traffic, even for an old registration.
  if (IS_LOCAL_PREVIEW || request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  // Ticket lists and mutations must always use the live API, never an offline
  // snapshot that could hide a ticket immediately after it was created.
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  if (url.pathname.endsWith(".bundle") || url.pathname.includes("hot-update") || url.pathname === "/symbolicate") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          void caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("/")) ||
            (await caches.match("/index.html"))
          );
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          void caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      });
    }),
  );
});
