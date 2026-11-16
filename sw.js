const CACHE = 'styrkeplan-v70';

self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(key){
        if(key !== CACHE) return caches.delete(key);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;

  // Network-first strategy for all files so updates always come through immediately
  event.respondWith(
    fetch(req, {cache: 'no-store'}).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(cache){ cache.put(req, copy); });
      return res;
    }).catch(function(){
      return caches.match(req);
    })
  );
});
