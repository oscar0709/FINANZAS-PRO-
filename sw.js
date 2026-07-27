const CACHE_NAME = "finanzas-pro-firebase-v1";
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
self.addEventListener("fetch", function(event){
  var url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function(cached){
      if(cached) return cached;
      return fetch(event.request).then(function(response){
        return caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(function(){
        return caches.match("./index.html");
      });
    })
  );
});
