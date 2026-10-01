#!/usr/bin/env python3
"""Genera sw.js e integrity.json a partir de los archivos reales.
Uso (desde la raíz del repositorio):  python3 tools/build.py
Ejecutar SIEMPRE tras añadir/cambiar cualquier archivo, y subir APP_VERSION en app.js."""
import hashlib, json, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
ver = re.search(r'const APP_VERSION = "([^"]+)"', open("app.js", encoding="utf8").read()).group(1)
core = ["index.html", "styles.css", "fonts/lexend-latin.woff2", "app.js", "data.js", "manifest.webmanifest",
        "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"]
pdfs = sorted("pdfs/" + f for f in os.listdir("pdfs") if f.lower().endswith(".pdf"))
for f in core + pdfs:
    if not os.path.isfile(f): sys.exit("Falta el archivo: " + f)
sha = lambda f: hashlib.sha256(open(f, "rb").read()).hexdigest()
files = {f: sha(f) for f in core + pdfs}
json.dump({"version": ver, "algoritmo": "SHA-256", "files": files}, open("integrity.json", "w", encoding="utf8"), indent=1, sort_keys=True)
PRE = ["./"] + core + ["integrity.json"] + pdfs
sw = '''// GENERADO por tools/build.py — no editar a mano.
// Guarda la app y todas las fichas para funcionar SIN cobertura.
const VERSION = "fichas-v%s";
const PRECACHE = %s;

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
''' % (ver, json.dumps(PRE, indent=1))
open("sw.js", "w", encoding="utf8").write(sw)
print("OK · versión", ver, "·", len(files), "archivos con hash · precache", len(PRE))
