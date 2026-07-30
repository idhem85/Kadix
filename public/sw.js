const STATIC_CACHE = 'kadix-static-v1';
const DYNAMIC_CACHE = 'kadix-dynamic-v1';
const API_CACHE = 'kadix-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Failed to cache some static assets:', err);
        // Don't fail installation for optional assets
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(
            (key) =>
              key !== STATIC_CACHE &&
              key !== DYNAMIC_CACHE &&
              key !== API_CACHE
          )
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (handled by IndexedDB sync queue)
  if (request.method !== 'GET') {
    return;
  }

  // Static assets: cache-first
  if (
    STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Supabase API calls: network-first with dedicated cache
  if (
    url.hostname.includes('supabase') ||
    url.hostname.includes('supabase.co')
  ) {
    // Only cache GET queries (SELECT), not auth/function calls
    if (request.method === 'GET') {
      event.respondWith(networkFirstWithDedicatedCache(request));
    }
    return;
  }

  // Navigation: network-first with fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

// ============================================
// Cache Strategies
// ============================================

async function cacheFirst(request, cacheName = DYNAMIC_CACHE) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // For navigation, serve the app shell
    if (request.mode === 'navigate') {
      const appShell = await caches.match('/index.html');
      if (appShell) return appShell;
    }

    return new Response(
      JSON.stringify({ error: 'Vous êtes hors ligne.', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Network-first strategy for Supabase API calls.
 * Uses a dedicated API cache with stale-while-revalidate behavior.
 */
async function networkFirstWithDedicatedCache(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone and cache the response
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Offline: return cached response
    const cached = await cache.match(request);
    if (cached) return cached;

    // Return a structured offline response
    return new Response(
      JSON.stringify({ error: 'offline', offline: true, cached: false }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ============================================
// Background Sync (Periodic)
// ============================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'kadix-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // This will trigger the app's sync engine
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: 'TRIGGER_SYNC' });
  }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHES':
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
      break;
    case 'GET_CACHE_STATUS':
      // Report cache sizes back to the app
      caches.keys().then(async (keys) => {
        const status = {};
        for (const key of keys) {
          const cache = await caches.open(key);
          const requests = await cache.keys();
          status[key] = requests.length;
        }
        event.source?.postMessage({
          type: 'CACHE_STATUS',
          status,
        });
      });
      break;
  }
});
