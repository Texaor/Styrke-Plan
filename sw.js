const CACHE = 'styrkeplan-v61';
const CORE = [
  './',
  './index.html',
  './style.css?v=61',
  './app.js?v=61',
  './manifest.json?v=61',
  './icon.svg',
  './bg-loop.mp4?v=61'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function(cache){
      return Promise.all(CORE.map(function(url){
        return cache.add(url).catch(function(){ return null; });
      }));
    })
  );
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

  var url = new URL(req.url);
  var isCoreText = url.pathname.endsWith('/') ||
                   url.pathname.endsWith('/index.html') ||
                   url.pathname.endsWith('/app.js') ||
                   url.pathname.endsWith('/style.css');

  if(isCoreText){
    event.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(cache){ cache.put(req, copy); });
        return res;
      }).catch(function(){ return caches.match(req); })
    );
  }else{
    event.respondWith(
      caches.match(req).then(function(hit){
        if(hit) return hit;
        return fetch(req).then(function(res){
          var copy = res.clone();
          caches.open(CACHE).then(function(cache){ cache.put(req, copy); });
          return res;
        });
      })
    );
  }
});
