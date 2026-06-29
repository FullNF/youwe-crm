// Service worker for Web Push notifications.
// Vite copies this file as-is to the site root, so it's reachable at /sw.js.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'YouWe CRM', body: 'You have a new update.', url: '/' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // if payload isn't JSON, fall back to defaults above
  }

  const options = {
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    image: payload.image || undefined,
    data: { url: payload.url || '/' },
    tag: payload.url || undefined, // collapses repeat notifications for the same lead instead of stacking endlessly
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Tapping the notification focuses an existing tab on that URL if one is
// open, otherwise opens a new tab/window - this is what makes "tap to open
// the lead" work even when the site isn't currently open.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
