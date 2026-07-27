const CACHE_NAME = "finanzas-pro-firebase-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./firebase-config.js",
  "./icon-180.png",
  "./icon-512.png"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; })
                             .map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Only intervene for same-origin app-shell requests.
// Firebase/Firestore/Google network calls are left completely untouched,
// so real-time sync and auth work normally.
//
// Network-first: always try to fetch the latest version first, and only
// fall back to the cached copy if there's no connection. This means future
// updates show up immediately instead of getting stuck behind a stale cache.
self.addEventListener("fetch", function(event){
  var url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).then(function(response){
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
      return response;
    }).catch(function(){
      return caches.match(event.request).then(function(cached){
        return cached || caches.match("./index.html");
      });
    })
  );
});
