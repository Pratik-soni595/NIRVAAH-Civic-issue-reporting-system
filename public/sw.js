/**
 * NIRVAAH Service Worker v7
 * - Offline cached app shell
 * - True background sync for offline complaints
 */

importScripts('/js/indexeddb.js');

const CACHE_NAME = 'nirvaah-v7';
const ASSETS_TO_CACHE = [
  '/offline-report.html',
  '/css/govt-theme.css',
  '/js/indexeddb.js'
];

// =============================================================
// INSTALL — cache app shell
// =============================================================
self.addEventListener('install', (event) => {
  console.log('[SW v7] Installing, caching assets...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    .then(() => self.skipWaiting())
  );
});

// =============================================================
// ACTIVATE — Clean old caches
// =============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW v7] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// =============================================================
// FETCH — App Shell + Network First / API Offline Error
// =============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!request.url.startsWith('http')) return;

  // API requests — network only, return offline JSON error on fail
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ success: false, message: 'You are offline.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // HTML Navigation — serve offline-report.html if network fails
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline-report.html'))
    );
    return;
  }

  // Assets (CSS, JS, images)
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});

// =============================================================
// BACKGROUND SYNC — True Offline Processing
// =============================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-complaints') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      (typeof globalThis !== 'undefined' ? globalThis : self).NirvaahDB.syncPendingComplaints()
    );
  }
});

// =============================================================
// PUSH NOTIFICATIONS
// =============================================================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'NIRVAAH', {
      body: data.message || 'New notification',
      icon: '/assets/icons/icon-192.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
