const CACHE = 'orbits-pwa-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then(res => res.text())
        .then(html => {

          // ✅ 1. Change default speed
          html = html.replace('value="3"', 'value="1"');

          // ✅ 2. Fix initial label
          html = html.replace('updateSpeedLabel(3)', 'updateSpeedLabel(1)');

          // ✅ 3. Add "v2" to title (tab title)
          html = html.replace(
            'Earth–Sun–Moon: Precise 3D',
            'Earth–Sun–Moon: Precise 3D v2'
          );

          // ✅ 4. Add "v2" to UI header text
          html = html.replace(
            'Earth · Sun · Moon — Precise 3D Dynamics',
            'Earth · Sun · Moon — Precise 3D Dynamics v2'
          );

          return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  event.respondWith(fetch(req));
});