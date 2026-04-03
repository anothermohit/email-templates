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

          console.log("Injecting Bangalore observer...");

          try {

            html = html.replace(
              "</body>",
              `
              <script>
                console.log("SW BANGALORE MODE ACTIVE:", "${VERSION}");

                (function () {

                  const BANGALORE = { lat: 12.9716, lon: 77.5946 };

                  function applyOverride() {

                    // 🔥 Try your app's likely functions
                    if (window.setObserver) {
                      window.setObserver(BANGALORE.lat, BANGALORE.lon);
                      console.log("✔ Applied via setObserver");
                      return true;
                    }

                    if (window.updateLocation) {
                      window.updateLocation(BANGALORE.lat, BANGALORE.lon);
                      console.log("✔ Applied via updateLocation");
                      return true;
                    }

                    if (window.setLocation) {
                      window.setLocation(BANGALORE.lat, BANGALORE.lon);
                      console.log("✔ Applied via setLocation");
                      return true;
                    }

                    // fallback (if app reads globals)
                    window.__OBSERVER_OVERRIDE__ = BANGALORE;

                    return false;
                  }

                  // try immediately
                  if (!applyOverride()) {

                    let tries = 0;

                    const interval = setInterval(() => {
                      tries++;

                      if (applyOverride()) {
                        clearInterval(interval);
                      }

                      if (tries > 20) {
                        console.log("❌ Could not hook observer");
                        clearInterval(interval);
                      }

                    }, 300);
                  }

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