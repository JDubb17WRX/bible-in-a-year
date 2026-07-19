// Service worker for the Bible in a Year PWA. Caches the app shell for
// installability and instant paint, and caches same-origin /api/passage
// responses so a day's text stays readable offline once it has been viewed.
const CACHE_VERSION = "bible-in-a-year-v1";
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = "/offline";
const CORE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/app-icons/bible-icon-192.png",
  "/app-icons/bible-icon-512.png",
  "/app-icons/bible-icon-maskable-512.png",
  "/app-icons/bible-apple-touch-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!key.startsWith(CACHE_VERSION)) {
              return caches.delete(key);
            }
            return Promise.resolve(false);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isPassageRequest(url) {
  return url.pathname === "/api/passage";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          () =>
            caches.match(request).then((cached) => cached) ||
            caches.match(OFFLINE_URL),
        ),
    );
    return;
  }

  if (isPassageRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        }),
    ),
  );
});
