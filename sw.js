const VERSION = Date.now();
const CACHE = 'orbits-pwa-' + VERSION;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete old caches automatically
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (!k.includes(CACHE)) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then(res => res.text())
        .then(html => {

          // ✅ SPEED FIX
          html = html.replace('value="3"', 'value="1"');
          html = html.replace('updateSpeedLabel(3)', 'updateSpeedLabel(1)');

          // ✅ VERSION LABEL (dynamic)
          html = html.replace(
            'Earth–Sun–Moon: Precise 3D',
            'Earth–Sun–Moon: Precise 3D v' + VERSION
          );

          html = html.replace(
            'Earth · Sun · Moon — Precise 3D Dynamics',
            'Earth · Sun · Moon — Precise 3D Dynamics v' + VERSION
          );

          // ✅ UI hidden by default
          html = html.replace('var uiVisible = true;', 'var uiVisible = false;');
          html = html.replace('<div id="top">', '<div id="top" class="ui-hidden">');
          html = html.replace('<div id="hud">', '<div id="hud" class="ui-hidden">');
          html = html.replace('<div id="panelToggle"', '<div id="panelToggle" class="ui-hidden"');

          // ✅ Camera (ecliptic view)
          html = html.replace(
            'var cam = { theta:-0.42, phi:0.48, dist:22, panX:0, panY:0 };',
            'var cam = { theta:0, phi:0.02, dist:18, panX:0, panY:0 };'
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