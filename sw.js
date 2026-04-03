const VERSION = "v9"; // 🔥 increment every update
const CACHE = "orbits-pwa-" + VERSION;

console.log("SW FILE LOADED:", VERSION);

// ─────────────────────────────
// INSTALL
// ─────────────────────────────
self.addEventListener("install", event => {
  console.log("SW INSTALL:", VERSION);
  self.skipWaiting();
});

// ─────────────────────────────
// ACTIVATE
// ─────────────────────────────
self.addEventListener("activate", event => {
  console.log("SW ACTIVATE:", VERSION);

  event.waitUntil(
    caches.keys().then(keys => {
      console.log("Clearing old caches:", keys);
      return Promise.all(keys.map(k => caches.delete(k)));
    })
  );

  self.clients.claim();
});

// ─────────────────────────────
// FETCH
// ─────────────────────────────
self.addEventListener("fetch", event => {

  if (event.request.mode === "navigate") {

    console.log("SW intercept:", event.request.url);

    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => response.text())
        .then(html => {

          console.log("Injecting Bangalore observer override...");

          try {

            html = html.replace(
              "</body>",
              `
              <script>
                console.log("SW BANGALORE MODE ACTIVE:", "${VERSION}");

                (function () {

                  const BANGALORE = { lat: 12.9716, lon: 77.5946 };

                  // 🔥 Global override your app can read
                  window.__OBSERVER_OVERRIDE__ = BANGALORE;
                  window.__USE_BANGALORE__ = true;

                  // 🌙 Phase check (if SunCalc exists)
                  if (window.SunCalc) {
                    const now = new Date();
                    const illum = SunCalc.getMoonIllumination(now);
                    console.log("🌙 Bangalore moon phase:", illum.phase);
                  }

                  console.log("✔ Bangalore override ready");

                })();
              </script>

              </body>`
            );

            console.log("✔ Injection success");

          } catch (err) {
            console.error("❌ Injection error:", err);
          }

          return new Response(html, {
            headers: { "Content-Type": "text/html" }
          });

        })
        .catch(err => {
          console.error("❌ Fetch failed:", err);
          return fetch(event.request);
        })
    );
  }
});