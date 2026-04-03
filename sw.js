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
// FETCH (CRITICAL FIX HERE)
// ─────────────────────────────
self.addEventListener("fetch", event => {

  // Only intercept page loads
  if (event.request.mode === "navigate") {

    console.log("SW intercept:", event.request.url);

    event.respondWith(
      fetch(event.request, { cache: "no-store" }) // 🔥 BYPASS GITHUB CACHE
        .then(response => {
          console.log("Fetched fresh HTML");
          return response.text();
        })
        .then(html => {

          console.log("Injecting debug overlay...");

          try {

            // ─────────────────────────────
            // DEBUG OVERLAY (CANNOT MISS)
            // ─────────────────────────────
            html = html.replace(
              "</body>",
              `
              <div style="
                position:fixed;
                top:20px;
                left:20px;
                background:#ff0000;
                color:#ffffff;
                font-size:18px;
                font-family:monospace;
                padding:10px 14px;
                z-index:999999;
                border-radius:4px;
              ">
                SW ACTIVE ${VERSION}
              </div>

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
              ">
                ${VERSION}
              </div>

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

          // fallback
          return fetch(event.request);
        })
    );
  }
});
