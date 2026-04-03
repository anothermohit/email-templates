const VERSION = "v6"; // 🔥 increment manually each update
const CACHE = "orbits-pwa-" + VERSION;

self.addEventListener("install", e => {
  console.log("SW INSTALL", VERSION);
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  console.log("SW ACTIVATE", VERSION);
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {

  // ✅ CRITICAL FIX: works on GitHub Pages
  if (event.request.mode === "navigate") {

    event.respondWith(
      fetch(event.request)
        .then(res => res.text())
        .then(html => {

          // ─────────────────────────────
          // ✅ SPEED FIX
          // ─────────────────────────────
          html = html.replace('value="3"', 'value="1"');
          html = html.replace('updateSpeedLabel(3)', 'updateSpeedLabel(1)');

          // ─────────────────────────────
          // ✅ UI HIDDEN DEFAULT
          // ─────────────────────────────
          html = html.replace('var uiVisible = true;', 'var uiVisible = false;');
          html = html.replace('<div id="top">', '<div id="top" class="ui-hidden">');
          html = html.replace('<div id="hud">', '<div id="hud" class="ui-hidden">');

          // ─────────────────────────────
          // ✅ CAMERA (ECLIPTIC VIEW)
          // ─────────────────────────────
          html = html.replace(
            'var cam = { theta:-0.42, phi:0.48, dist:22, panX:0, panY:0 };',
            'var cam = { theta:0, phi:0.02, dist:18, panX:0, panY:0 };'
          );

          // ─────────────────────────────
          // ✅ VERSION DISPLAY (GUARANTEED)
          // ─────────────────────────────
          html = html.replace(
            '</body>',
            `
            <div style="
              position:fixed;
              bottom:10px;
              left:50%;
              transform:translateX(-50%);
              color:#e8b84b;
              font-size:12px;
              font-family:monospace;
              z-index:999999;
              opacity:0.9;
              pointer-events:none;
            ">${VERSION}</div>
            </body>`
          );

          return new Response(html, {
            headers: { "Content-Type": "text/html" }
          });

        })
    );

  }

});
