/* 296 Tools service worker — last-known-good cache, v1.0.0 */
const VERSION = '296-tools-v1.0.0';
const CORE_CACHE = VERSION + '-core';
const RUNTIME_CACHE = VERSION + '-runtime';
const OFFLINE_URL = '/offline.html';

const CORE = [
  '/', OFFLINE_URL, '/manifest.webmanifest', '/app-health.json', '/app-manifest.json',
  '/assets/css/tokens.css', '/assets/css/layout.css',
  '/assets/js/tailwind-config.js', '/assets/js/tools-data.js', '/assets/js/layout.js', '/assets/js/app-runtime.js',
  '/assets/components/header.html', '/assets/components/sidebar.html',
  '/assets/components/mobile-menu.html', '/assets/components/footer.html',
  '/assets/icons/icon-192.png', '/assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CORE_CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('296-tools-') && key !== CORE_CACHE && key !== RUNTIME_CACHE)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

function validResponse(response, expectHTML) {
  if (!response || !response.ok) return false;
  if (!expectHTML) return true;
  return (response.headers.get('content-type') || '').includes('text/html');
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (!validResponse(response, request.mode === 'navigate')) throw new Error('Respons tidak valid');
    await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await caches.match(request)) || (request.mode === 'navigate' ? caches.match(OFFLINE_URL) : Response.error());
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const update = fetch(request).then(async response => {
    if (validResponse(response, false)) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  return cached || (await update) || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  if (url.origin === location.origin) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
