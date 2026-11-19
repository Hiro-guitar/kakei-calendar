/* さんにんのおうち：通知を受け取るためだけのサービスワーカー（キャッシュはしない） */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'さんにんのおうち', {
    body: d.body || '', icon: 'kaji-icon.png', badge: 'kaji-icon.png', tag: d.tag || undefined, data: { url: 'kaji.html' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(c => /kaji\.html/.test(c.url));
    if (c) return c.focus();
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || 'kaji.html');
  }));
});
