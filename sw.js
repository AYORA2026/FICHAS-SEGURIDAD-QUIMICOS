// GENERADO por tools/build.py — no editar a mano.
// Guarda la app y todas las fichas para funcionar SIN cobertura.
const VERSION = "fichas-v1.3.0";
const PRECACHE = [
 "./",
 "index.html",
 "styles.css",
 "fonts/lexend-latin.woff2",
 "app.js",
 "data.js",
 "manifest.webmanifest",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/maskable-512.png",
 "icons/apple-touch-icon.png",
 "integrity.json",
 "pdfs/axle7-85w140-fds.pdf",
 "pdfs/axle7-85w140-tds.pdf",
 "pdfs/azolla-eco2-68-fds.pdf",
 "pdfs/azolla-eco2-68-tds.pdf",
 "pdfs/azolla-zs-tds.pdf",
 "pdfs/disolvente-nu20-fds.pdf",
 "pdfs/equivis-zs-46-fds.pdf",
 "pdfs/equivis-zs-68-fds.pdf",
 "pdfs/equivis-zs-tds.pdf",
 "pdfs/fluidmatic-d3-fds.pdf",
 "pdfs/fluidmatic-d3-tds.pdf",
 "pdfs/galvafix-zinc-fds.pdf",
 "pdfs/gasoleo-diesel-e-fds-2011.pdf",
 "pdfs/liebherr-hydraulic-plus-fds.pdf",
 "pdfs/marker-paint-fds.pdf",
 "pdfs/multis-complex-ep2-tds.pdf",
 "pdfs/rubia-tir-7400-fds.pdf",
 "pdfs/rubia-tir-7400-tds.pdf",
 "pdfs/rubia-works-4000-fds.pdf",
 "pdfs/rubia-works-4000-tds.pdf",
 "pdfs/sikafill-380-thermic-fds.pdf",
 "pdfs/tecnodiesel-e10-fds-2009.pdf",
 "pdfs/tecnodiesel-e10-fds-2015.pdf",
 "pdfs/tranself-trj-75w80-fds.pdf",
 "pdfs/transmission-gear-8-fe-75w80-tds.pdf"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    // "reload": evita copias antiguas de la caché HTTP de GitHub Pages
    await c.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" })));
  })());
});

self.addEventListener("message", (e) => { if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting(); });

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;   // nunca tocamos peticiones externas
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") { const idx = await caches.match("index.html"); if (idx) return idx; }
    try { return await fetch(req); } catch { return Response.error(); }
  })());
});
