// Neo Routine Service Worker
// Handles push notifications and background sync

const CACHE_NAME = 'neo-routine-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Neo Routine', body: event.data ? event.data.text() : 'Time to check in!' };
  }

  const title = data.title || 'Neo Routine';
  const options = {
    body: data.body || 'Time to check in on your routine!',
    icon: '/neoLogo.jfif',
    badge: '/neoLogo.jfif',
    data: { url: data.url || '/dashboard' },
    requireInteraction: false,
    tag: data.tag || 'neo-routine-reminder',
    renotify: false,
    silent: false,
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle notification close (user swiped away)
self.addEventListener('notificationclose', (event) => {
  // Could track dismissals here for analytics
});
