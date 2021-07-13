//when user has accessed app and then tries to access again offline...cached files will be stored in users' device and user will still have access
const FILES_TO_CACHE = [
  "./index.html",
  "./js/index.js",
  "./js/idb.js",
  "./css/styles.css",
  // "/",
  // "./manifest.json",
  "./service-worker.js",
  // "/icons/icon-128x128.png",
  // "/icons/icon-144x144.png",
  // "/icons/icon-384x384.png",
  // "/icons/icon-512x512.png",
  // "/icons/icon-152x152.png",
  // "/icons/icon-192x192.png",
  // "/icons/icon-72x72.png",
  // "/icons/icon-96x96.png"
];

const APP_PREFIX = "BudgetTrackerPWA-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener("install", function (e) {
  console.log("See if it works");
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("New files were cached successfully! : " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("Old cache removed successfully : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// how to retrieve information from the cache. To do that, we need to add another event listener.

self.addEventListener("fetch", function (e) {
  //   For our own development purposes, we can console log e.request.url, so that every single time the application requests a resource, we'll console log the path to that resource
  console.log("fetch request : " + e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        // if cache is available, respond with cache
        console.log("responding with cache : " + e.request.url);
        return request;
      } else {
        // if there are no cache, try fetching request
        console.log("file is not cached, fetching : " + e.request.url);
        return fetch(e.request);
      }

      // You can omit if/else for console.log & put one line below like this too.
      // return request || fetch(e.request)
    })
  );
});
