// the "self" refers to the service worker itself
// This is a service worker script that caches assets for offline use
// and handles fetch events to serve cached assets when offline.

_consoleLog('REGISTERED ServiceWorker.js', 'success');

// This is the name of the cache we will use
const AF_PWA_CACHE_NAME = 'af-pwa-cache-v1';
// List the files to precache
const AF_PWA_CACHE_ASSETS = [
	'/',
	'/src/vue.global.js',
	'/src/bootstrap.bundle.min.js',
	'/src/tsparticles.confetti.bundle.min.js',
	'/src/toDo.js',
	'/src/slides.js',
	'/src/main.js',
	'/src/bootstrap.min.css',
	'/src/style.css',
];

var cache = null;

// Installation
self.addEventListener('install', async (event) => {
	// Cache the assets we need
	event.waitUntil((async () => {
		if (cache === null) {
			cache = await self.caches.open(AF_PWA_CACHE_NAME);
		}
		return cache.addAll(AF_PWA_CACHE_ASSETS);
	})());

	// Skip waiting to activate the new service worker immediately
	self.skipWaiting();

	_consoleLog('INSTALLED ServiceWorker.js', 'success');
})

self.addEventListener('activate', () => {
	_consoleLog('ACTIVATED ServiceWorker.js', 'success');
	// This is a good place to clean up old caches
	// self.clients.claim();
	// self.clients.matchAll().then(clients => {
	// 	clients.forEach(client => {
	// 		client.postMessage('Service worker activated');
	// 	});
	// });
})

// This is the fetch event handler
// It will intercept all fetch requests and serve them from the cache if available
// or fetch them from the network if not
// This is a simple example, in a real application you would want to use a more sophisticated strategy
self.addEventListener('fetch', event => {
	const url = new URL(event.request.url);
	if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {

		event.respondWith((async () => {
			if (cache === null) {
				cache = await self.caches.open(AF_PWA_CACHE_NAME);
			}
			// Get the resource from the cache
			const cached_response = await cache.match(event.request);

			// If it is not in the cache, fetch it from the network
			// we will fetch the request and put it in the cache if it is not already there
			const pending_response = fetch(event.request).then((response) => {

				// Important: we do not await here, since that would defeat the point of using the cache
				cache.put(event.request, response.clone());
				return response;
			}).catch((error) => {
				_consoleLog('Error fetching ' + event.request.url + ': ' + error, 'warn');
			});

			// return the cached response if available, otherwise return the pending response
			return cached_response || pending_response;
		})());

		// This is a request to the same origin, so we can handle it
		_consoleLog('service worker fetched resource: ' + event.request.url, 'info');
		_consoleLog('service worker fetched resource type: ' + event.request.destination, 'info');
	}
})


function _consoleLog(msg, type = 'log') {
	if (type === 'log') {
		console.log(msg)
	} else {
		let bgColor = '#ff0000';
		switch (type) {
			case 'info':
				bgColor = '#00aeef';
				break;
			case 'success':
				bgColor = '#21ab3e';
				break;
			case 'warn':
				bgColor = '#f22222';
				break;
			case 'alert':
				bgColor = '#edac13';
				break;
		}

		console.log(`%c${msg}`, `background-color: ${bgColor}; color: white; font-weight: bold;`)
	}
}


// Show notification when received
self.addEventListener('message', (event) => {

	console.log('Received message from main thread:', event.data);
	let notification = event.data;
	self.registration.showNotification(
		notification.title,
		notification.options
	).catch((error) => {
		console.log(error);
	});

});
