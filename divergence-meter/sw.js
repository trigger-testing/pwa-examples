// self.addEventListener('install', function(e) {
//   e.waitUntil(
//     caches.open('fox-store').then(function(cache) {
//       return cache.addAll([
//         '/pwa-examples/divergence-meter/',
//         '/pwa-examples/divergence-meter/index.html',
//         '/pwa-examples/divergence-meter/index.js',
//         '/pwa-examples/divergence-meter/style.css',
//         '/pwa-examples/divergence-meter/icons/icon-32.png',
//         '/pwa-examples/divergence-meter/data/img/Large/NixieAuthentic.png',
//         '/pwa-examples/divergence-meter/data/img/Large/NixieFontA.png',
//         '/pwa-examples/divergence-meter/data/img/Large/NixieTubeLeft.png',
//         '/pwa-examples/divergence-meter/data/img/Large/NixieTubeMid.png',
//         '/pwa-examples/divergence-meter/data/img/Large/NixieTubeRight.png',
//         '/pwa-examples/divergence-meter/data/img/Large/NixieTubeSingle.png',
//         '/pwa-examples/divergence-meter/data/img/Medium/NixieAuthentic.png',
//         '/pwa-examples/divergence-meter/data/img/Medium/NixieFontA.png',
//         '/pwa-examples/divergence-meter/data/img/Medium/NixieTubeLeft.png',
//         '/pwa-examples/divergence-meter/data/img/Medium/NixieTubeMid.png',
//         '/pwa-examples/divergence-meter/data/img/Medium/NixieTubeRight.png',
//         '/pwa-examples/divergence-meter/data/img/Medium/NixieTubeSingle.png',
//         '/pwa-examples/divergence-meter/data/img/Small/NixieAuthentic.png',
//         '/pwa-examples/divergence-meter/data/img/Small/NixieFontA.png',
//         '/pwa-examples/divergence-meter/data/img/Small/NixieTubeLeft.png',
//         '/pwa-examples/divergence-meter/data/img/Small/NixieTubeMid.png',
//         '/pwa-examples/divergence-meter/data/img/Small/NixieTubeRight.png',
//         '/pwa-examples/divergence-meter/data/img/Small/NixieTubeSingle.png',
//       ]);
//     })
//   );
//  });
 
//  self.addEventListener('fetch', function(e) {
//    console.log(e.request.url);
//    e.respondWith(
//      caches.match(e.request).then(function(response) {
//        return response || fetch(e.request);
//      })
//    );
//  });

// self.importScripts('data/games.js');

// Files to cache
var cacheName = 'divergence-meter-v1';
var appShellFiles = [
  '/pwa-examples/divergence-meter/',
  '/pwa-examples/divergence-meter/index.html',
  '/pwa-examples/divergence-meter/index.js',
  '/pwa-examples/divergence-meter/style.css',
  '/pwa-examples/divergence-meter/favicon.ico',
	'/pwa-examples/divergence-meter/data/img/Large/NixieAuthentic.png',
	'/pwa-examples/divergence-meter/data/img/Large/NixieFontA.png',
	'/pwa-examples/divergence-meter/data/img/Large/NixieFontB.png',
	'/pwa-examples/divergence-meter/data/img/Large/NixieTubeLeft.png',
	'/pwa-examples/divergence-meter/data/img/Large/NixieTubeMid.png',
	'/pwa-examples/divergence-meter/data/img/Large/NixieTubeRight.png',
	'/pwa-examples/divergence-meter/data/img/Large/NixieTubeSingle.png',
	'/pwa-examples/divergence-meter/data/img/Medium/NixieAuthentic.png',
	'/pwa-examples/divergence-meter/data/img/Medium/NixieFontA.png',
	'/pwa-examples/divergence-meter/data/img/Medium/NixieFontB.png',
	'/pwa-examples/divergence-meter/data/img/Medium/NixieTubeLeft.png',
	'/pwa-examples/divergence-meter/data/img/Medium/NixieTubeMid.png',
	'/pwa-examples/divergence-meter/data/img/Medium/NixieTubeRight.png',
	'/pwa-examples/divergence-meter/data/img/Medium/NixieTubeSingle.png',
	'/pwa-examples/divergence-meter/data/img/Small/NixieAuthentic.png',
	'/pwa-examples/divergence-meter/data/img/Small/NixieFontA.png',
	'/pwa-examples/divergence-meter/data/img/Small/NixieFontB.png',
	'/pwa-examples/divergence-meter/data/img/Small/NixieTubeLeft.png',
	'/pwa-examples/divergence-meter/data/img/Small/NixieTubeMid.png',
	'/pwa-examples/divergence-meter/data/img/Small/NixieTubeRight.png',
  '/pwa-examples/divergence-meter/data/img/Small/NixieTubeSingle.png',
  '/pwa-examples/divergence-meter/icons/icon-32.png',
  '/pwa-examples/divergence-meter/icons/icon-256.png'
];
var gamesImages = [];
for (var i = 0; i < games.length; i++) {
  gamesImages.push('data/img/'+games[i].slug+'.jpg');
}
var contentToCache = appShellFiles.concat(gamesImages);

// Installing Service Worker
self.addEventListener('install', function(e) {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(contentToCache);
    })
  );
});

// Fetching content using Service Worker
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then(function(response) {
        return caches.open(cacheName).then(function(cache) {
          console.log('[Service Worker] Caching new resource: ' + e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
