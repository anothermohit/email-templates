const VERSION = "v8"; // 🔥 increment every update
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

          console.log("Injecting header version...");

          try {

            html = html.replace(
              "</body>",
              `
              <script>
                console.log("SW VERSION INJECTED:", "${VERSION}");

                (function() {
                  const el =
                    document.querySelector('#header') ||
                    document.querySelector('header') ||
                    document.querySelector('h1');

                  if (el) {
                    el.innerText += " (v${VERSION})";
                    console.log("✔ Header updated");
                  } else {
                    console.log("❌ Header not found");
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