const CACHE_NAME = "dumbbell-ppl-v1";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./workout-data.js",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/app-icon.svg",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./images/flat/dumbbell-floor-press-start.webp",
  "./images/flat/dumbbell-floor-press-peak.webp",
  "./images/flat/dumbbell-shoulder-press-start.webp",
  "./images/flat/dumbbell-shoulder-press-peak.webp",
  "./images/flat/lateral-raise-start.webp",
  "./images/flat/lateral-raise-peak.webp",
  "./images/flat/dumbbell-tricep-extension-start.webp",
  "./images/flat/dumbbell-tricep-extension-peak.webp",
  "./images/flat/bent-over-db-row-start.webp",
  "./images/flat/bent-over-db-row-peak.webp",
  "./images/flat/dumbbell-romanian-deadlift-start.webp",
  "./images/flat/dumbbell-romanian-deadlift-peak.webp",
  "./images/flat/dumbbell-reverse-fly-start.webp",
  "./images/flat/dumbbell-reverse-fly-peak.webp",
  "./images/flat/bicep-curl-start.webp",
  "./images/flat/bicep-curl-peak.webp",
  "./images/flat/db-squat-start.webp",
  "./images/flat/db-squat-peak.webp",
  "./images/flat/db-lunge-start.webp",
  "./images/flat/db-lunge-peak.webp",
  "./images/flat/dumbbell-calf-raise-start.webp",
  "./images/flat/dumbbell-calf-raise-peak.webp",
  "./images/flat/dumbbell-side-bend-start.webp",
  "./images/flat/dumbbell-side-bend-peak.webp",
  "./images/flat/plank-main.webp"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        return response;
      });
      return cached || network.catch(() => caches.match("./index.html"));
    })
  );
});
