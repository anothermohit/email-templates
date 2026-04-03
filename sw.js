const VERSION = "v5"; // 🔥 CHANGE THIS EVERY UPDATE
const CACHE = 'orbits-pwa-' + VERSION;

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
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

          // ─────────────────────────────
          // ✅ FORCE VERSION DISPLAY (NOT OVERRIDABLE)
          // ─────────────────────────────
          html = html.replace(
            '</body>',
            `
            <div style="
              position:fixed;
              bottom:8px;
              left:50%;
              transform:translateX(-50%);
              color:#e8b84b;
              font-size:11px;
              font-family:monospace;
              z-index:9999;
              opacity:0.8;
              pointer-events:none;
            ">${VERSION}</div>
            </body>`
          );

          // ─────────────────────────────
          // ✅ UI HIDDEN
          // ─────────────────────────────
          html = html.replace('var uiVisible = true;', 'var uiVisible = false;');
          html = html.replace('<div id="top">', '<div id="top" class="ui-hidden">');
          html = html.replace('<div id="hud">', '<div id="hud" class="ui-hidden">');

          // ─────────────────────────────
          // ✅ CAMERA FIX
          // ─────────────────────────────
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
