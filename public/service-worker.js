const CACHE_NAME = "ticketmaster-rey-v14";
const APP_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// These external CDN origins must never be intercepted by the SW.
// Caching opaque CDN responses on Android fills quota and causes silent failures.
const CDN_PASS_THROUGH_ORIGINS = [
  "unpkg.com",
  "openfreemap.org",
  "tiles.openfreemap.org",
  "fonts.openmaptiles.org",
  "maps.googleapis.com",
  "maps.geoapify.com",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
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

  // Let CDN requests pass through — never cache map tiles/assets as opaque responses.
  if (CDN_PASS_THROUGH_ORIGINS.some((origin) => url.hostname.endsWith(origin))) {
    return;
  }

  if (url.origin !== self.location.origin) {
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
