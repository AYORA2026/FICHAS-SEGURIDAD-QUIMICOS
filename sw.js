// Service worker: guarda la app y todas las fichas para funcionar SIN cobertura en obra.
// Al cambiar cualquier archivo, sube el número de VERSION.
const VERSION = "fichas-v1";
const CORE = ["./", "index.html", "styles.css", "app.js", "data.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];
const PDFS = ["pdfs/axle7-85w140-fds.pdf", "pdfs/axle7-85w140-tds.pdf", "pdfs/azolla-eco2-68-fds.pdf", "pdfs/azolla-eco2-68-tds.pdf", "pdfs/azolla-zs-tds.pdf", "pdfs/disolvente-nu20-fds.pdf", "pdfs/equivis-zs-46-fds.pdf", "pdfs/equivis-zs-68-fds.pdf", "pdfs/equivis-zs-tds.pdf", "pdfs/fluidmatic-d3-fds.pdf", "pdfs/fluidmatic-d3-tds.pdf", "pdfs/galvafix-zinc-fds.pdf", "pdfs/gasoleo-diesel-e-fds-2011.pdf", "pdfs/liebherr-hydraulic-plus-fds.pdf", "pdfs/marker-paint-fds.pdf", "pdfs/multis-complex-ep2-tds.pdf", "pdfs/rubia-tir-7400-fds.pdf", "pdfs/rubia-tir-7400-tds.pdf", "pdfs/rubia-works-4000-fds.pdf", "pdfs/rubia-works-4000-tds.pdf", "pdfs/sikafill-380-thermic-fds.pdf", "pdfs/tecnodiesel-e10-fds-2009.pdf", "pdfs/tecnodiesel-e10-fds-2015.pdf", "pdfs/tranself-trj-75w80-fds.pdf", "pdfs/transmission-gear-8-fe-75w80-tds.pdf"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(CORE);
    // los PDF se guardan uno a uno: si falla uno no se rompe la instalación
    await Promise.all(PDFS.map((u) => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const r = await fetch(e.request);
      if (r.ok && new URL(e.request.url).origin === location.origin) (await caches.open(VERSION)).put(e.request, r.clone());
      return r;
    } catch {
      return (await caches.match("index.html")) || Response.error();
    }
  })());
});
