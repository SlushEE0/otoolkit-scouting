/**
 * Service Worker for Offline PWA Support
 *
 * Caches the app shell and static assets on install.
 * Uses a network-first strategy for navigation requests and
 * cache-first for static assets. This ensures the app works
 * fully offline after the first visit.
 */

const CACHE_NAME = "otoolkit-scouting-v1";

/**
 * Core app shell files to cache on install.
 * Next.js generates hashed file names, so we rely on runtime
 * caching for JS/CSS bundles and pre-cache only the entry points.
 */
const PRECACHE_URLS = ["/", "/export", "/configure", "/responses"];

/* ---------- Install ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // Non-fatal: pages may not be built yet during dev
        console.warn("[SW] Pre-cache failed for some URLs:", err);
      });
    })
  );
  // Activate immediately
  self.skipWaiting();
});

/* ---------- Activate ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ---------- Fetch ---------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Skip Supabase / external API requests
  if (!request.url.startsWith(self.location.origin)) return;

  // Navigation requests: network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Static assets: cache-first with network fallback
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          // Cache successful responses for future offline use
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});
