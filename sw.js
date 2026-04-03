const BUILD = Date.now();
const CACHE = 'orbits-pwa-v4-' + BUILD;

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

          // ─────────────────────────────
          // ✅ SPEED DEFAULT
          // ─────────────────────────────
          html = html.replace('value="3"', 'value="1"');
          html = html.replace('updateSpeedLabel(3)', 'updateSpeedLabel(1)');

          // ─────────────────────────────
          // ✅ VERSION + OBSERVER INJECTION
          // ─────────────────────────────
          html = html.replace(
            "'use strict';",
            `'use strict';

            // ===== VERSION =====
            function getShortVersion(days){
              var yr = days / 365.24219;
              var yInt = Math.floor(yr);
              var frac = yr - yInt;
              var frac3 = Math.floor(frac * 1000);
              return 'v' + yInt + '.' + frac3.toString().padStart(3,'0');
            }

            // ===== BANGALORE OBSERVER =====
            const BANGALORE_LAT = 12.9716 * Math.PI/180;
            const BANGALORE_LON = 77.5946 * Math.PI/180;

            function getObserverPosition(radius){
              return new THREE.Vector3(
                radius * Math.cos(BANGALORE_LAT) * Math.cos(BANGALORE_LON),
                radius * Math.sin(BANGALORE_LAT),
                -radius * Math.cos(BANGALORE_LAT) * Math.sin(BANGALORE_LON)
              );
            }
            `
          );

          // ─────────────────────────────
          // ✅ FORCE VERSION DISPLAY (robust)
          // ─────────────────────────────
          html = html.replace(
            "renderer.render(scene, camera);",
            `
            // Inject version into HUD every frame
            var badge = document.getElementById('sBadge');
            if (badge && badge.textContent.indexOf('v') !== 0) {
              badge.textContent = getShortVersion(state.days) + ' | ' + badge.textContent;
            }

            renderer.render(scene, camera);
            `
          );

          // ─────────────────────────────
          // ✅ ADD OBSERVER CAMERA MODE
          // ─────────────────────────────
          html = html.replace(
            "camApply();",
            `
            camApply();

            // Toggle observer mode
            var observerMode = false;
            window.addEventListener('keydown', function(e){
              if(e.key === 'o') observerMode = !observerMode;
            });
            `
          );

          // ─────────────────────────────
          // ✅ APPLY OBSERVER VIEW EACH FRAME
          // ─────────────────────────────
          html = html.replace(
            "renderer.render(scene, camera);",
            `
            if (typeof observerMode !== 'undefined' && observerMode) {
              var obs = getObserverPosition(${0.22}); // Earth radius in scene
              var worldObs = obs.clone().applyQuaternion(earthGroup.quaternion).add(earthGroup.position);

              camera.position.copy(worldObs);

              // Look at Moon
              camera.lookAt(moonMesh.position);
            }

            renderer.render(scene, camera);
            `
          );

          // ─────────────────────────────
          // ✅ UI HIDDEN DEFAULT
          // ─────────────────────────────
          html = html.replace('var uiVisible = true;', 'var uiVisible = false;');
          html = html.replace('<div id="top">', '<div id="top" class="ui-hidden">');
          html = html.replace('<div id="hud">', '<div id="hud" class="ui-hidden">');

          // ─────────────────────────────
          // ✅ CAMERA DEFAULT (ECLIPTIC)
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
