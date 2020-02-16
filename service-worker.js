const CACHE_NAME = 'static-cache-v1';

const FILES_TO_CACHE = ['/'];

self.addEventListener('install', (evt) => {

	// CODELAB: Precache static resources here.
	evt.waitUntil(
	    caches.open(CACHE_NAME).then((cache) => {
	      console.log('[ServiceWorker] Pre-caching offline page');
	      return cache.addAll(FILES_TO_CACHE);
	    })
	);
});

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.

  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached dat


	// CODELAB: Remove previous cached data from disk.
	evt.waitUntil(
	    caches.keys().then((keyList) => {
	      return Promise.all(keyList.map((key) => {
	        if (key !== CACHE_NAME){
	          return caches.delete(key);
	        }
	      }));
	    })
	);


  return self.clients.claim();
});

self.addEventListener('fetch', event => {
 event.respondWith(
   caches.match(event.request).then(response => {
     fetch(event.request).then(res => {
       cache.put(event.request, res.clone());
      });
      return response;
   });
 );
});