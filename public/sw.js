var CACHE_STATIC_NAME = 'static-v15'
var CACHE_DYNAMIC_NAME = 'dynamic-v2'
var STATIC_FILES = [
    '/public/index.html',
    '/public/offline.html',
    '/public/src/app.js',
    '/public/src/js/feed.js',
    '/public/src/js/promise.js',
    '/public/src/js/fetch.js',
    '/public/src/js/material.min.js',
    '/public/src/css/app.css',
    '/public/src/css/feed.css',
    '/public/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

//CLEAN DYNAMIC CACHE
function trimCache(cacheName, maxItems) {
    caches.open(cacheName)
        .then(function (cache) {
            return cache.keys()
                .then(function (keys) {
                    if (keys.length > maxItems) {
                        cache.delete(keys[0])
                            .then(trimCache(cacheName, maxItems))
                    }
                })
        })
}

self.addEventListener("install", function (event) {
    console.log("Installing service worker.. (Triggered by browser)", event)
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log("Precaching app Shell")

                // cache.addAll([
                //     '/public/',
                //     '/public/index.html',
                //     '/public/src/app.js',
                //     '/public/src/js/feed.js',
                //     '/public/src/js/promise.js',
                //     '/public/src/js/fetch.js',
                //     '/public/src/js/material.min.js',
                //     '/public/src/css/app.css',
                //     '/public/src/css/feed.css',
                //     '/public/src/images/main-image.jpg',
                //     'https://fonts.googleapis.com/css?family=Roboto:400,700',
                //     'https://fonts.googleapis.com/icon?family=Material+Icons',
                //     'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                // ])

                //cache.add('/')
                cache.add('/public/index.html')
                cache.add('/public/offline.html')
                cache.add('/public/src/js/app.js')
                cache.add('/public/src/js/feed.js')
                cache.add('/public/src/js/promise.js')
                cache.add('/public/src/js/fetch.js')
                cache.add('/public/src/js/material.min.js')
                cache.add('/public/src/css/app.css')
                cache.add('/public/src/css/feed.css')
                cache.add('/public/src/images/main-image.jpg')
                cache.add('https://fonts.googleapis.com/css?family=Roboto:400,700')
                cache.add('https://fonts.googleapis.com/icon?family=Material+Icons')
                cache.add('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css')
            })
    )
})

self.addEventListener("activate", function (event) {
    console.log("Activating service worker.. (Triggered by browser) ", event)

    event.waitUntil(
        caches.keys()
            .then(function (keylist) {
                return Promise.all(keylist.map(function (key) {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('Removing Old Cache', key)
                        return caches.delete(key)
                    }
                }))
            })
    )

    return self.clients.claim()
})

// ---> CACHE WITH NETWORK FALLBACK <---
// self.addEventListener("fetch", function (event) {
//     event.respondWith(
//         caches.match(event.request)
//             .then(function (response) {
//                 if (response) {
//                     return response
//                 }
//                 else {
//                     return fetch(event.request)
//                         .then(function (res) {
//                             caches.open(CACHE_DYNAMIC_NAME)
//                                 .then(function (cache) {
//                                   cache.put(event.request.url, res.clone())
//                                     return res
//                                 })
//                         })
//                         .catch(function(err){ 
//                          return caches.open(CACHE_STATIC_NAME)
//                             .then(function(cache){
//                                 return cache.match('/public/offline.html')
//                             })
//                         })
//                 }
//             })
//     )

// })

// // ---> CACHE THEN NETWORK  (IMPROVED VERSION OF NETWORK WITH CACHE FALLBACK) <---
// self.addEventListener("fetch", function (event) {
//     event.respondWith(
//       caches.open(CACHE_DYNAMIC_NAME)
//       .then(function(cache){
//           return fetch(event.request)
//           .then(function(res){
//               cache.put(event.request,res.clone())
//               return res
//           })
//       })
//     )

// })


function isInArray(string, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === string) {
            return true
        }
    }
    return false
}

// ---> IMPORVED VERSION OF CACHE THEN NETWORK <---
self.addEventListener("fetch", function (event) {
    var url = "https://pwa-advanced.firebaseio.com/posts"

    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                    return fetch(event.request)
                        .then(function (res) {
                            // trimCache(CACHE_DYNAMIC_NAME,5)
                            cache.put(event.request, res.clone())
                            return res
                        })
                })
        )

    }
    // } else if (new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url)) {

    else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        )
    }

    else {
        event.respondWith(

            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response
                    }
                    else {
                        return fetch(event.request)
                            .then(function (res) {
                                caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function (cache) {
                                        cache.put(event.request.url, res.clone())
                                        return res
                                    })
                            })
                            .catch(function (err) {
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function (cache) {
                                        // if (event.request.url.indexOf('/help'))
                                        if (event.request.headers.get('accept').includes('text/html'))
                                            return cache.match('/public/offline.html')
                                    })
                            })
                    }
                })

        )
    }

})


// ---> NETWORK WITH CACHE FALLBACK <---
// self.addEventListener("fetch",function(event){
//     event.respondWith(
//         fetch(event.request)
//         .then(function(res){
//            return caches.open(CACHE_DYNAMIC_NAME)
//            .then(function(cache){
//                cache.put(event.request,res.clone())
//                return res
//            })
//         })
//         .catch(function(err){
//             return caches.match(event.request)
//         })
//         )
// })

// ---> CACHE ONLY <---
// self.addEventListener("fetch", function (event) {
//     event.respondWith(
//         caches.match(event.request)
//     )

// })

// ---> NETWORK ONLY <---
// self.addEventListener("fetch", function (event) {
//     event.respondWith(
//         fetch(event.request)
//     )

// })