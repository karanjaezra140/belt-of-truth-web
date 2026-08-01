// Minimal Service Worker for offline ebook reading. It only ever touches
// requests to the protected page-image route — every other request on the
// site passes through untouched.
//
// Strategy is network-first, cache-fallback (not cache-first): while online,
// every page load re-hits the server so access revocation is respected
// immediately, and a copy is stashed in Cache Storage as a side effect.
// Only when the network is unreachable does a previously-cached page get
// served. This is the one documented exception to "revocation is instant" —
// see the note in components/EbookReader.tsx.
const CACHE_NAME = "ebook-offline-v1";
const EBOOK_PAGE_PATTERN = /\/api\/ebooks\/[^/]+\/page\/\d+$/;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!EBOOK_PAGE_PATTERN.test(url.pathname)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.open(CACHE_NAME).then(async (cache) => {
          const cached = await cache.match(request);
          return (
            cached ??
            new Response(null, { status: 503, statusText: "Not saved for offline reading" })
          );
        })
      )
  );
});
