const BUILD = Date.now();
const CACHE = 'orbits-pwa-v3-' + BUILD;

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

          // ✅ SPEED
          html = html.replace('value="3"', 'value="1"');
          html = html.replace('updateSpeedLabel(3)', 'updateSpeedLabel(1)');

          // ─────────────────────────────
          // ✅ ENABLE SHADOWS (NO NEW LIGHT)
          // ─────────────────────────────
          html = html.replace(
            "renderer.shadowMap.enabled = false;",
            "renderer.shadowMap.enabled = true;"
          );

          // Modify existing light instead of creating new one
          html = html.replace(
            "scene.add(new THREE.PointLight(0xfff0d0, 3.0, 120));",
            `
            const sunLight = new THREE.PointLight(0xfff0d0, 2.2, 0);
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 2048;
            sunLight.shadow.mapSize.height = 2048;
            scene.add(sunLight);
            `
          );

          // Earth shadows
          html = html.replace(
            "earthGroup.add(earthMesh);",
            `
            earthMesh.castShadow = true;
            earthMesh.receiveShadow = true;
            earthGroup.add(earthMesh);
            `
          );

          // Moon shadows
          html = html.replace(
            "scene.add(moonMesh);",
            `
            moonMesh.castShadow = true;
            moonMesh.receiveShadow = true;
            scene.add(moonMesh);
            `
          );

          // ─────────────────────────────
          // ✅ VERSION + PHASE
          // ─────────────────────────────
          html = html.replace(
            "'use strict';",
            `'use strict';

            function getShortVersion(days){
              var yr = days / 365.24219;
              var yInt = Math.floor(yr);
              var frac = yr - yInt;
              var frac3 = Math.floor(frac * 1000);
              return 'v' + yInt + '.' + frac3.toString().padStart(3,'0');
            }

            const SUPERMOON_JD = 2457706.5;

            function getMoonPhaseOffset(currentJD){
              const synodic = 29.530589;
              let delta = (currentJD - SUPERMOON_JD) % synodic;
              if (delta < 0) delta += synodic;
              return (delta / synodic) * 2*Math.PI;
            }
            `
          );

          // Apply phase
          html = html.replace(
            "var moonL = MOON.L0 + MOON.n * d;",
            `
            var moonL = MOON.L0 + MOON.n * d;
            moonL += getMoonPhaseOffset(J2000_JD + d);
            `
          );

          // Version display
          html = html.replace(
            "document.getElementById('sBadge').textContent= getSeason(lambdaSun_deg);",
            `
            document.getElementById('sBadge').textContent =
              getShortVersion(state.days) + ' | ' + getSeason(lambdaSun_deg);
            `
          );

          // UI hidden
          html = html.replace('var uiVisible = true;', 'var uiVisible = false;');
          html = html.replace('<div id="top">', '<div id="top" class="ui-hidden">');
          html = html.replace('<div id="hud">', '<div id="hud" class="ui-hidden">');
          html = html.replace('<div id="panelToggle"', '<div id="panelToggle" class="ui-hidden"');

          // Camera
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
