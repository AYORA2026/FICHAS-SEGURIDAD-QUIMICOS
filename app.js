"use strict";

/* ============================================================
   Fichas de Seguridad · Obra
   Aplicación 100 % local: sin servidores, sin analítica, sin
   recursos externos. Los datos de configuración solo se guardan
   en este dispositivo (localStorage).
   ============================================================ */
const APP_VERSION = "1.3.0";
const APP_FECHA = "2026-10-01";

/* ---------- anti-clickjacking (GitHub Pages no permite cabeceras) ---------- */
(function () {
  try {
    if (window.top !== window.self) {
      document.documentElement.hidden = true;
      window.top.location = window.self.location;
    }
  } catch (e) { document.documentElement.hidden = true; }
})();

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"'`]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" }[c]));
const norm = (t) => String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9+]/g, "");
const tokens = (q) => String(q ?? "").slice(0, 80).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[\s,;]+/).map((x) => x.replace(/[^a-z0-9+]/g, "")).filter(Boolean).slice(0, 6);
const AVISO_ANIOS = 3;
const ID_OK = /^[a-z0-9-]{1,60}$/;
const PDF_OK = /^[a-z0-9.-]{1,80}\.pdf$/;

/* ---------- iconos (SVG inline propios, sin dependencias) ---------- */
const IC = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  drop: '<path d="M12 2.7s7 7.3 7 12.3a7 7 0 0 1-14 0c0-5 7-12.3 7-12.3z"/>',
  wind: '<path d="M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2"/>',
  cup: '<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  warn: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  chev: '<path d="M9 18l6-6-6-6"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  cog: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  spray: '<rect x="8" y="9" width="8" height="12" rx="2"/><path d="M10 9V6h4v3M12 3v3M17 4l2-1M17 7l2 .5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  mouth: '<path d="M4 12c3-4 5-4 8-2 3-2 5-2 8 2-3 5-5 6-8 6s-5-1-8-6z"/>',
  siren: '<path d="M7 18v-6a5 5 0 0 1 10 0v6M5 21h14M12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4"/>',
};
const ico = (n, c = "") => `<svg class="i ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ""}</svg>`;
$("#hAjustes").innerHTML = ico("sliders");

/* ---------- almacenamiento local validado ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const CFG_KEY = "fds.v1.config", TEL_KEY = "fds.v1.tel", REC_KEY = "fds.v1.rec";
const tieneMarcas = (s) => /[<>\u0000-\u001f\u007f]/.test(String(s ?? ""));
const clean = (s, max) => String(s ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
const TXT_OK = /^[\p{L}\p{M}\p{N} .,'’()\/&·-]{2,60}$/u;
const telOk = (s) => { const d = (String(s).match(/\d/g) || []).length; return /^\+?[0-9 ().-]{6,20}$/.test(s) && d >= 6 && d <= 15; };
const telHref = (s) => String(s).replace(/[^+\d]/g, "");

function cargarConfig() {
  const c = LS.get(CFG_KEY, null);
  if (!c || typeof c !== "object") return null;
  const proyecto = clean(c.proyecto, 60), nombre = clean(c.nombre, 60), tel = clean(c.tel, 20);
  let cargo = clean(c.cargo, 60); if (!TXT_OK.test(cargo)) cargo = "Técnico de PRL";
  if (!TXT_OK.test(proyecto) || !TXT_OK.test(nombre) || !telOk(tel)) return null;
  return { proyecto, nombre, cargo, tel };
}
function cargarTels() {
  const l = LS.get(TEL_KEY, []);
  if (!Array.isArray(l)) return [];
  return l.slice(0, 20).map((t) => ({ n: clean(t && t.n, 60), t: clean(t && t.t, 20) })).filter((t) => TXT_OK.test(t.n) && telOk(t.t));
}
let CFG = cargarConfig();

/* ---------- fechas y estado de la ficha ---------- */
function edadAnios(f) {
  if (!f) return null;
  const d = new Date(f.length === 7 ? f + "-01" : f);
  return isNaN(d) ? null : (Date.now() - d.getTime()) / 31557600000;
}
function fechaTxt(f) {
  if (!f) return "sin fecha";
  const [y, m, d] = f.split("-");
  return d ? `${d}/${m}/${y}` : m ? `${m}/${y}` : y;
}
function estadoFicha(p) {
  if (p.sinFDS) return { cls: "bad", txt: "Sin FDS" };
  const a = edadAnios(p.fecha);
  if (a === null) return { cls: "warn", txt: "Sin fecha" };
  const y = p.fecha.slice(0, 4);
  if (a > 5) return { cls: "old", txt: `${y} · antigua` };
  if (a > AVISO_ANIOS) return { cls: "warn", txt: `${y} · revisar` };
  return { cls: "ok", txt: y };
}

/* ---------- índice de búsqueda ---------- */
const H_TEXTO = {
  H222: "extremadamente inflamable aerosol", H225: "muy inflamable", H226: "inflamable", H229: "presion",
  H304: "aspiracion mortal", H315: "irritacion piel", H317: "alergia piel sensibilizante", H319: "irritacion ocular ojos",
  H332: "nocivo inhalacion", H336: "somnolencia vertigo", H351: "cancer", H361D: "feto", H373: "organos", H411: "acuatico", H412: "acuatico", H410: "acuatico",
};
const INDICE = PRODUCTOS.map((p) => {
  const bruto = [p.nombre, p.fabricante, p.tipo, p.uso, p.cas, p.un, p.sds, ...(p.alias || []),
    ...(p.h || []).map((h) => h[0] + " " + (H_TEXTO[h[0].toUpperCase()] || "")),
    p.nivel === 2 ? "peligro inflamable" : "", p.sinFDS ? "sin ficha" : ""].filter(Boolean).join(" ");
  return { p, blob: norm(bruto), palabras: bruto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9+]+/).filter(Boolean), nombre: norm(p.nombre) };
});
function subsec(q, t) { let i = 0; for (const c of t) if (c === q[i] && ++i === q.length) return true; return q.length === 0; }
const esNumCorto = (t) => t.length <= 3 && /^\d+$/.test(t);

const pasaGrupo = (p, g) => g === "todos" || (g === "peligro" ? !p.sinFDS && p.nivel === 2 : g === "sinfds" ? !!p.sinFDS : p.familia === g);
function buscar(q, grupo) {
  const tk = tokens(q);
  const base = INDICE.filter((x) => pasaGrupo(x.p, grupo));
  if (!tk.length) return base.map((x) => ({ x, s: 0 })).sort((a, b) => a.x.p.nombre.localeCompare(b.x.p.nombre, "es"));
  const res = [];
  for (const x of base) {
    let total = 0, ok = true;
    for (const t of tk) {
      let s = 0;
      if (x.nombre.startsWith(t)) s = 100;
      else if (x.palabras.some((w) => (esNumCorto(t) ? w === t : w.startsWith(t)))) s = 70;
      else if (!esNumCorto(t) && x.blob.includes(t)) s = 50;
      else if (t.length >= 2 && !/\d/.test(t) && subsec(t, x.nombre)) s = 15;
      if (!s) { ok = false; break; }
      total += s;
    }
    if (ok) res.push({ x, s: total });
  }
  return res.sort((a, b) => b.s - a.s || a.x.p.nombre.localeCompare(b.x.p.nombre, "es"));
}

/* ---------- interfaz común ---------- */
const vista = $("#vista"), dockEl = $("#dock");
let estado = { q: "", grupo: "todos", todos: false };
let toastT;
function toast(msg, ms = 3200) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), ms);
}
function pintarCabecera() {
  $("#hProyecto").textContent = CFG ? "Proyecto" : "Fichas de seguridad";
  $("#hTitulo").textContent = CFG ? CFG.proyecto : "Productos químicos";
}
/* últimos productos consultados (solo ids que existen; se guarda en este móvil) */
function cargarRec() {
  const l = LS.get(REC_KEY, []);
  return (Array.isArray(l) ? l : []).filter((id) => typeof id === "string" && ID_OK.test(id) && PRODUCTOS.some((p) => p.id === id)).slice(0, 5);
}
function guardarRec(id) { LS.set(REC_KEY, [id, ...cargarRec().filter((x) => x !== id)].slice(0, 5)); }

/* ---------- compartir la app (WhatsApp) ---------- */
const APP_URL = "https://ayora2026.github.io/FICHAS-SEGURIDAD-QUIMICOS/";
function textoCompartir() {
  const obra = CFG ? ` · ${CFG.proyecto}` : "";
  return `🧪 Fichas de Seguridad${obra}\nBuscador rápido de fichas de seguridad de productos químicos, con teléfonos y pasos a seguir en caso de accidente. Funciona sin conexión.\n\nÁbrela e instálala en tu móvil:\n${APP_URL}`;
}
function compartirWhatsApp() {
  const t = textoCompartir();
  // Enlace oficial de WhatsApp: abre la app (o WhatsApp Web) con el mensaje ya escrito; tú eliges el contacto o grupo.
  const a = document.createElement("a");
  a.href = "https://wa.me/?text=" + encodeURIComponent(t); a.target = "_blank"; a.rel = "noopener noreferrer";
  document.body.appendChild(a); a.click(); a.remove();
}
async function compartirOtros() {
  const t = textoCompartir();
  if (navigator.share) { try { await navigator.share({ title: "Fichas de Seguridad · Obra", text: t }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
  try { await navigator.clipboard.writeText(t); toast("Mensaje copiado. Pégalo donde quieras ✔"); } catch { toast("No se pudo copiar. Usa el botón de WhatsApp."); }
}

function llamar(t, extra = "") {
  return `<a class="call ${extra}" href="tel:${esc(telHref(t.t))}">${ico("phone")}<span class="call-t"><b>${esc(t.show || t.t)}</b><small>${esc(t.n)}</small></span></a>`;
}
function telResponsable() {
  return CFG ? { n: `${CFG.cargo}: ${CFG.nombre}`, t: CFG.tel, show: CFG.tel } : null;
}

function pintarDock(modo) {
  document.body.dataset.dock = modo;
  if (modo === "ficha") {
    const r = telResponsable();
    dockEl.className = "dock dock-ficha";
    dockEl.innerHTML = `<a class="dbtn danger" href="tel:915620420">${ico("phone")}<span><b>Toxicología</b><small>91 562 04 20</small></span></a>` +
      (r ? `<a class="dbtn navy" href="tel:${esc(telHref(r.t))}">${ico("user")}<span><b>Responsable</b><small>${esc(CFG.nombre)}</small></span></a>`
         : `<a class="dbtn navy" href="tel:112">${ico("siren")}<span><b>Emergencias</b><small>112</small></span></a>`);
    return;
  }
  if (modo === "busqueda") {
    dockEl.className = "dock dock-busca";
    dockEl.innerHTML = `<label class="busca">${ico("search")}<input id="q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="80" placeholder="Buscar producto…" aria-label="Buscar producto"><button id="borrar" type="button" aria-label="Borrar búsqueda" hidden>${ico("x")}</button></label>` +
      `<a class="sosb" href="#/sos" aria-label="Emergencia: a quién llamar">${ico("siren")}SOS</a>`;
    return;
  }
  dockEl.className = "dock"; dockEl.innerHTML = "";
}
const volverBtn = (txt = "Volver") => `<button class="volver" id="volver" type="button">${ico("back")}${txt}</button>`;
const conectarVolver = () => { const v = $("#volver"); if (v) v.onclick = () => (history.length > 1 ? history.back() : (location.hash = "#/")); };

function enfocar() { vista.focus({ preventScroll: true }); window.scrollTo(0, 0); }

/* ---------- vista: inicio y resultados ---------- */
const nivelEf = (p) => (p.sinFDS ? 1 : p.nivel);
const NIVEL_TXT = ["Sin clasificación de peligro", "Atención", "Peligro"];
const NIVEL_ICO = ["check", "warn", "flame"];
const GRUPO_ICO = { aceites: "drop", grasas: "cog", combustibles: "flame", pinturas: "spray", peligro: "warn", sinfds: "file" };
const GRUPO_NOM = { peligro: "Peligrosos", sinfds: "Sin ficha" };
const nombreGrupo = (id) => GRUPO_NOM[id] || (GRUPOS.find((g) => g.id === id) || { n: "Productos" }).n;
const cuenta = (g) => PRODUCTOS.filter((p) => pasaGrupo(p, g)).length;

function vistaLista() {
  document.title = "Fichas de Seguridad · Obra";
  pintarDock("busqueda");
  const q = $("#q"), bo = $("#borrar");
  q.value = estado.q; bo.hidden = !estado.q;
  q.addEventListener("input", () => { estado.q = q.value; bo.hidden = !q.value; pintarInicio(); });
  bo.onclick = () => { estado.q = ""; q.value = ""; bo.hidden = true; pintarInicio(); q.focus(); };
  pintarInicio();
}
function pintarInicio() {
  const lista = estado.q.trim() || estado.grupo !== "todos" || estado.todos;
  if (lista) return pintarResultados();
  const pendiente = !CFG ? `<a class="aviso-cfg" href="#/ajustes">${ico("warn")}<span><b>Falta configurar el proyecto y el responsable de emergencias.</b> Toca aquí para hacerlo.</span></a>` : "";
  const ids = [...GRUPOS.map((g) => g.id).filter((id) => id !== "todos"), "peligro", "sinfds"];
  const rec = cargarRec().map((id) => PRODUCTOS.find((p) => p.id === id));
  vista.innerHTML = `${pendiente}
    <div class="tiles">${ids.map((id) => `<button class="mos g-${esc(id)}" type="button" data-g="${esc(id)}"><span class="ic">${ico(GRUPO_ICO[id] || "layers")}</span><span><b>${esc(nombreGrupo(id))}</b><small>${cuenta(id)} ficha${cuenta(id) === 1 ? "" : "s"}</small></span></button>`).join("")}</div>
    <button class="btn ghost todos" id="verTodos" type="button">${ico("list")}Ver los ${PRODUCTOS.length} productos</button>
    ${rec.length ? `<h3 class="sec-t">Consultados hace poco</h3><ul class="lista">${rec.map((p) => filaProducto(p)).join("")}</ul>` : ""}
    <p class="ayuda">Escribe abajo 2 o 3 letras, o busca por <b>viscosidad</b> (15w40), <b>nº ONU</b> (1202), <b>CAS</b>, <b>fabricante</b> o <b>peligro</b> (inflamable, H304).</p>
    <p class="legal">Resumen elaborado a partir de las FDS de la obra. <b>Ante cualquier duda, manda la ficha original (PDF) y llama a Toxicología.</b> No sustituye al criterio médico ni al plan de emergencia.</p>`;
  vista.querySelectorAll(".mos").forEach((b) => (b.onclick = () => { estado.grupo = b.dataset.g; pintarInicio(); window.scrollTo(0, 0); }));
  $("#verTodos").onclick = () => { estado.todos = true; pintarInicio(); window.scrollTo(0, 0); };
}
function filaProducto(p) {
  const e = estadoFicha(p);
  return `<li><a class="card" href="#/p/${esc(p.id)}">
    <span class="tile n${nivelEf(p)}" title="${p.sinFDS ? "Sin ficha de seguridad" : NIVEL_TXT[p.nivel]}">${ico(NIVEL_ICO[nivelEf(p)])}</span>
    <span class="cuerpo"><b>${esc(p.nombre)}</b><small>${esc(p.tipo)} · ${esc(p.fabricante)}</small><span class="badge ${e.cls}">${esc(e.txt)}</span></span>${ico("chev", "chev")}</a></li>`;
}
function pintarResultados() {
  const r = buscar(estado.q, estado.grupo);
  const titulo = estado.q.trim() ? "Resultados" : estado.grupo !== "todos" ? nombreGrupo(estado.grupo) : "Todos los productos";
  vista.innerHTML = `
    <div class="rhead"><button class="volver" id="inicio" type="button">${ico("back")}Inicio</button><span class="rtit">${esc(titulo)}</span></div>
    <p class="contador" aria-live="polite">${r.length ? `${r.length} producto${r.length === 1 ? "" : "s"}` : ""}${estado.q.trim() && estado.grupo !== "todos" ? ` · en ${esc(nombreGrupo(estado.grupo))}` : ""}</p>
    <ul class="lista">${r.length ? r.map(({ x: { p } }) => filaProducto(p)).join("")
      : `<li class="vacio">No encuentro nada con “${esc(estado.q)}”.<br>Prueba con menos letras o quita el filtro.<br><button class="btn ghost" id="limpiar" type="button">Volver al inicio</button></li>`}</ul>`;
  const volverInicio = () => { estado = { q: "", grupo: "todos", todos: false }; const q = $("#q"); if (q) { q.value = ""; $("#borrar").hidden = true; } pintarInicio(); window.scrollTo(0, 0); };
  $("#inicio").onclick = volverInicio;
  const l = $("#limpiar"); if (l) l.onclick = volverInicio;
}

/* ---------- vista: ficha de producto ---------- */
function bloque(icon, titulo, cuerpo, cls = "") {
  return cuerpo ? `<section class="bl ${cls}"><h3>${ico(icon)}<span>${titulo}</span></h3>${cuerpo}</section>` : "";
}
let tabFicha = "acc";
function vistaFicha(id) {
  const p = ID_OK.test(id) ? PRODUCTOS.find((x) => x.id === id) : null;
  if (!p) { location.replace("#/"); return; }
  document.title = p.nombre + " · Fichas";
  pintarDock("ficha");
  guardarRec(p.id);
  const e = estadoFicha(p), a = p.auxilios;
  const viejo = e.cls === "old" || e.cls === "warn";
  const avisos = [];
  if (p.sinFDS) avisos.push(`<div class="aviso bad">${ico("warn")}<div><b>No hay ficha de seguridad utilizable.</b> ${esc(p.peligro)}</div></div>`);
  if (viejo && !p.sinFDS) avisos.push(`<div class="aviso old">${ico("info")}<div><b>Ficha de ${fechaTxt(p.fecha)}.</b> Puede estar desactualizada: pide la FDS vigente al proveedor.</div></div>`);
  const tel = p.tel.filter((t) => t.t !== "915620420" && t.t !== "112");
  const ingClave = /NO provocar|NUNCA provocar|urgencia/i.test(a.ingestion);
  const acc = (icon, t, txt, clave = false) => `<div class="acc ${clave ? "clave" : ""}"><span class="ic">${ico(icon)}</span><div><h4>${t}</h4><p>${esc(txt)}</p></div></div>`;
  const TABS = [["acc", "Accidente"], ["fuego", "Fuego y derrame"], ["datos", "Datos"]];
  const contenido = {
    acc: () => `${acc("cup", "Si lo tragas", a.ingestion, ingClave)}${acc("drop", "Si cae en la piel", a.piel)}${acc("eye", "Si cae en los ojos", a.ojos)}${acc("wind", "Si lo respiras", a.inhalacion)}
      <div class="llamar sec-llamar">${llamar({ n: "Emergencias", t: "112", show: "112" })}${tel.map((t) => llamar(t)).join("")}</div>`,
    fuego: () => `${p.fuego ? bloque("flame", "Incendio", `<p><b class="si">Usar:</b> ${esc(p.fuego.usar)}</p>${p.fuego.no && p.fuego.no !== "—" ? `<p><b class="no">No usar:</b> ${esc(p.fuego.no)}</p>` : ""}${p.fuego.nota ? `<p>${esc(p.fuego.nota)}</p>` : ""}`) : ""}
      ${bloque("drop", "Derrame", `<p>${esc(p.derrame)}</p>`)}
      ${p.nota ? bloque("info", "Nota del técnico <small>orientación, no es texto de la FDS</small>", `<p>${esc(p.nota)}</p>`, "nota") : ""}`,
    datos: () => `${p.h && p.h.length ? bloque("warn", "Indicaciones de peligro", `<ul class="hs">${p.h.map((h) => `<li><b>${esc(h[0])}</b><span>${esc(h[1])}</span></li>`).join("")}</ul>${p.palabra ? `<p class="palabra">Palabra de advertencia: <b>${esc(p.palabra)}</b></p>` : ""}`) : ""}
      ${bloque("file", "Datos", `<table class="datos">
        ${p.cas ? `<tr><th>CAS / composición</th><td>${esc(p.cas)}</td></tr>` : ""}
        ${p.un ? `<tr><th>Transporte (ONU)</th><td>${esc(p.un)}</td></tr>` : ""}
        ${p.flash ? `<tr><th>Punto de inflamación</th><td>${esc(p.flash)}</td></tr>` : ""}
        <tr><th>Uso</th><td>${esc(p.uso)}</td></tr>
        <tr><th>Fecha de la ficha</th><td>${fechaTxt(p.fecha)} · ${esc(p.version || "")}</td></tr>
      </table>`)}`,
  };
  vista.innerHTML = `
  <article class="ficha">
    ${volverBtn("Productos")}
    <div class="cab">
      <span class="tipo">${esc(p.tipo)} · ${esc(p.fabricante)}</span>
      <h2>${esc(p.nombre)}</h2>
      <span class="nivel n${nivelEf(p)}">${ico(NIVEL_ICO[nivelEf(p)])}${p.sinFDS ? "Sin FDS" : ["Sin clasificar", "Atención", "Peligro"][p.nivel]}</span>
      ${!p.sinFDS ? `<div class="riesgo n${p.nivel}"><b>Qué riesgo tiene</b><p class="clamp" id="rp">${esc(p.peligro)}</p><button class="mas" id="mas" type="button" aria-expanded="false" hidden>Leer todo</button></div>` : ""}
    </div>
    ${avisos.join("")}
    <div class="tabs" role="tablist" aria-label="Secciones de la ficha">${TABS.map(([k, n]) => `<button role="tab" type="button" data-t="${k}" id="tab-${k}" aria-controls="tabc">${n}</button>`).join("")}</div>
    <div id="tabc" role="tabpanel"></div>
    <div class="pdfs">
      ${p.fds && PDF_OK.test(p.fds) ? `<a class="btn primary" href="pdfs/${esc(p.fds)}" target="_blank" rel="noopener noreferrer">${ico("file")}Abrir FDS completa (PDF)</a>` : ""}
      ${p.tds && PDF_OK.test(p.tds) ? `<a class="btn ghost" href="pdfs/${esc(p.tds)}" target="_blank" rel="noopener noreferrer">${ico("file")}${esc(p.tdsNombre || "Ficha técnica (TDS)")}</a>` : ""}
    </div>
    <p class="legal">Resumen de la FDS. Ante cualquier duda manda el PDF original.</p>
  </article>`;
  const pintarTab = (k) => {
    tabFicha = k;
    $("#tabc").innerHTML = contenido[k]();
    $("#tabc").setAttribute("aria-labelledby", "tab-" + k);
    vista.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.t === k)));
  };
  vista.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => pintarTab(b.dataset.t)));
  pintarTab("acc");
  const rp = $("#rp"), mas = $("#mas");
  if (rp && mas && rp.scrollHeight > rp.clientHeight + 2) {
    mas.hidden = false;
    mas.onclick = () => { const abierto = rp.classList.toggle("clamp") === false; mas.textContent = abierto ? "Mostrar menos" : "Leer todo"; mas.setAttribute("aria-expanded", String(abierto)); };
  }
  conectarVolver();
}

/* ---------- vista: emergencia ---------- */
function cuadro(t, cls = "", wide = false) {
  return `<a class="sq ${cls} ${wide ? "wide" : ""}" href="tel:${esc(telHref(t.t))}">${ico("phone")}<span><small>${esc(t.n)}</small><b>${esc(t.show || t.t)}</b></span></a>`;
}
function vistaSos() {
  document.title = "Emergencia · Fichas";
  pintarDock("nada");
  const r = telResponsable(), extra = cargarTels();
  vista.innerHTML = `
    ${volverBtn()}
    <h2 class="h2 rojo">Emergencia</h2>
    <div class="sq-grid">
      ${cuadro({ n: "Emergencias", t: "112", show: "112" }, "rojo", true)}
      ${cuadro({ n: "Toxicología · 24 h", t: "915620420", show: "91 562 04 20" }, "azul", true)}
      ${r ? cuadro({ n: `Responsable · ${CFG.nombre}`, t: r.t, show: r.show }, "negro", true) : `<a class="aviso-cfg" style="grid-column:1/-1;margin:0" href="#/ajustes">${ico("user")}<span><b>Sin responsable configurado.</b> Añádelo en Ajustes para tenerlo aquí a un toque.</span></a>`}
      ${extra.map((t) => cuadro({ n: t.n, t: t.t, show: t.t })).join("")}
    </div>
    <h3 class="sec-t">Mientras llega la ayuda</h3>
    <ol class="pasos">
      <li><span><b>Protégete</b> y aparta a las personas de la zona.</span></li>
      <li><span>Si es seguro, <b>corta la fuente</b> (cierra el envase, apaga focos de ignición).</span></li>
      <li><span><b>Llama</b> y ten a mano el nombre del producto.</span></li>
      <li><span>Aplica los <b>primeros auxilios</b> de la ficha del producto.</span></li>
      <li><span>No des de beber ni provoques el vómito salvo que la ficha lo indique.</span></li>
    </ol>
    <a class="btn primary" href="#/">${ico("search")}Buscar el producto</a>`;
  conectarVolver();
}

/* ---------- formulario de configuración (primera vez y ajustes) ---------- */
function formConfig(primera) {
  const c = CFG || { proyecto: "", nombre: "", cargo: "Técnico de PRL", tel: "" };
  return `<form id="fCfg" class="form" novalidate autocomplete="off">
    <label>Proyecto / obra
      <span class="campo">${ico("pin")}<input name="proyecto" required maxlength="60" placeholder="Ej.: ISFV Ayora 1" value="${esc(c.proyecto)}" autocomplete="off"></span>
      <small class="err" data-e="proyecto"></small></label>
    <label>Responsable de emergencias (nombre)
      <span class="campo">${ico("user")}<input name="nombre" required maxlength="60" placeholder="Nombre y apellidos" value="${esc(c.nombre)}" autocomplete="off"></span>
      <small class="err" data-e="nombre"></small></label>
    <label>Cargo
      <span class="campo">${ico("shield")}<input name="cargo" maxlength="60" placeholder="Técnico de PRL" value="${esc(c.cargo)}" autocomplete="off"></span>
      <small class="err" data-e="cargo"></small></label>
    <label>Teléfono del responsable
      <span class="campo">${ico("phone")}<input name="tel" required type="tel" inputmode="tel" maxlength="20" placeholder="+34 600 000 000" value="${esc(c.tel)}" autocomplete="off"></span>
      <small class="err" data-e="tel"></small></label>
    <p class="hint">El técnico de prevención al mando al que hay que llamar en caso de accidente. Estos datos se guardan <b>solo en este móvil</b>; no se envían a ningún sitio.</p>
    <button class="btn primary" type="submit">${ico("check")}${primera ? "Guardar y empezar" : "Guardar cambios"}</button>
  </form>`;
}
function conectarFormConfig(alGuardar) {
  const f = $("#fCfg");
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const marcas = ["proyecto", "nombre", "cargo", "tel"].some((k) => tieneMarcas(d[k]));
    const v = { proyecto: clean(d.proyecto, 60), nombre: clean(d.nombre, 60), cargo: clean(d.cargo, 60) || "Técnico de PRL", tel: clean(d.tel, 20) };
    const err = {};
    if (marcas) { err.proyecto = "Hay caracteres no permitidos (< > o de control)."; }
    if (!err.proyecto && !TXT_OK.test(v.proyecto)) err.proyecto = "Escribe el nombre del proyecto (2-60 caracteres, sin símbolos raros).";
    if (!TXT_OK.test(v.nombre)) err.nombre = "Escribe el nombre del responsable (2-60 caracteres).";
    if (!TXT_OK.test(v.cargo)) err.cargo = "Cargo no válido.";
    if (!telOk(v.tel)) err.tel = "Teléfono no válido. Ej.: +34 600 000 000";
    f.querySelectorAll(".err").forEach((s) => (s.textContent = err[s.dataset.e] || ""));
    const primero = Object.keys(err)[0];
    if (primero) { f.querySelector(`[name="${primero}"]`).focus(); return; }
    if (!LS.set(CFG_KEY, v)) { toast("No se pudo guardar en este navegador (¿modo privado?)."); return; }
    CFG = v; pintarCabecera(); toast("Configuración guardada ✔"); alGuardar();
  });
}

/* ---------- vista: bienvenida (primera vez) ---------- */
function vistaBienvenida() {
  document.title = "Configuración inicial · Fichas";
  pintarDock("nada");
  vista.innerHTML = `
    <div class="bienvenida">
      <div class="hero">${ico("shield")}</div>
      <h2 class="h2">Configura la app para tu obra</h2>
      <p class="lead">Solo lo haces una vez. Así, en una emergencia tendrás a un toque el teléfono del técnico de prevención al mando.</p>
      ${formConfig(true)}
      <button class="btn link" id="luego" type="button">Configurar más tarde</button>
    </div>`;
  conectarFormConfig(() => (location.hash = "#/"));
  $("#luego").onclick = () => { try { sessionStorage.setItem("fds.saltar", "1"); } catch {} location.hash = "#/"; };
}

/* ---------- vista: ajustes ---------- */
let instalarEvt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); instalarEvt = e; const b = $("#btnInstalar"); if (b) b.hidden = false; });

function vistaAjustes() {
  document.title = "Ajustes · Fichas";
  pintarDock("nada");
  const tels = cargarTels();
  vista.innerHTML = `
    ${volverBtn()}
    <h2 class="h2">${ico("sliders")}Ajustes</h2>

    <section class="bl"><h3>${ico("pin")}<span>PROYECTO Y RESPONSABLE</span></h3>
      <p class="hint">El nombre del proyecto aparece en la cabecera de la app y en el mensaje al compartirla.</p>${formConfig(false)}</section>

    <section class="bl"><h3>${ico("share")}<span>COMPARTIR LA APP</span></h3>
      <p class="hint">Envía el enlace a un compañero por WhatsApp. Solo se envía el enlace y un texto de presentación (con el nombre del proyecto); no se comparte tu nombre ni tu teléfono.</p>
      <div class="acciones">
        <button class="btn primary" id="btnWA" type="button">${ico("share")}Compartir por WhatsApp</button>
        <button class="btn ghost" id="btnShare" type="button">${ico("share")}Otras opciones / copiar mensaje</button>
      </div>
    </section>

    <section class="bl"><h3>${ico("phone")}<span>OTROS TELÉFONOS DE LA OBRA</span></h3>
      <p class="hint">Mutua, hospital, coordinador… Aparecen en la pantalla de Emergencia.</p>
      <ul class="tels">${tels.map((t, i) => `<li><span><b>${esc(t.n)}</b><small>${esc(t.t)}</small></span><button class="icon-btn" type="button" data-del="${i}" aria-label="Borrar ${esc(t.n)}">${ico("trash")}</button></li>`).join("") || `<li class="vacio-s">Aún no hay teléfonos añadidos.</li>`}</ul>
      <form id="fTel" class="form fila" novalidate autocomplete="off">
        <input name="n" maxlength="60" placeholder="Nombre (ej. Mutua)" aria-label="Nombre del teléfono">
        <input name="t" type="tel" inputmode="tel" maxlength="20" placeholder="Teléfono" aria-label="Número de teléfono">
        <button class="btn primary" type="submit">${ico("plus")}Añadir</button>
      </form><small class="err" id="eTel"></small>
    </section>

    <section class="bl"><h3>${ico("refresh")}<span>APLICACIÓN</span></h3>
      <table class="datos">
        <tr><th>Proyecto</th><td>${esc(CFG ? CFG.proyecto : "Sin configurar")}</td></tr>
        <tr><th>Versión</th><td>v${esc(APP_VERSION)} <small>(${fechaTxt(APP_FECHA)})</small></td></tr>
        <tr><th>Fichas</th><td>${PRODUCTOS.length} productos · 25 PDF</td></tr>
        <tr><th>Estado</th><td id="estadoRed">${navigator.onLine ? "En línea" : "Sin conexión (funciona igual)"}</td></tr>
      </table>
      <div class="acciones">
        <button class="btn primary" id="btnAct" type="button">${ico("refresh")}Buscar actualización</button>
        <button class="btn ghost" id="btnInt" type="button">${ico("shield")}Verificar integridad de las fichas</button>
        <button class="btn ghost" id="btnInstalar" type="button" hidden>${ico("download")}Instalar en este móvil</button>
      </div>
      <p class="hint" id="msgApp" role="status" aria-live="polite"></p>
      <details class="det"><summary>Instalar en el móvil</summary>
        <p><b>Android (Chrome):</b> menú ⋮ → “Instalar aplicación”.<br><b>iPhone (Safari):</b> botón Compartir → “Añadir a pantalla de inicio”.</p></details>
      <details class="det"><summary>Problemas o versión antigua</summary>
        <p>Si algo no se actualiza, pulsa este botón: borra la copia guardada y la vuelve a descargar (tu configuración no se pierde).</p>
        <button class="btn ghost" id="btnForzar" type="button">${ico("refresh")}Forzar recarga completa</button></details>
    </section>

    <section class="bl"><h3>${ico("trash")}<span>PRIVACIDAD</span></h3>
      <p class="hint">La app no usa cuentas, cookies de seguimiento ni analítica, y no envía datos. Lo que escribes aquí solo existe en este móvil.</p>
      <button class="btn danger-o" id="btnBorrar" type="button">${ico("trash")}Borrar mis datos de este móvil</button>
    </section>
    <p class="legal">Fichas de Seguridad · Obra · v${esc(APP_VERSION)}</p>`;

  conectarVolver();
  conectarFormConfig(() => vistaAjustes());
  $("#fTel").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const n = clean(d.n, 60), t = clean(d.t, 20), er = $("#eTel");
    if (tieneMarcas(d.n) || tieneMarcas(d.t)) { er.textContent = "Hay caracteres no permitidos (< > o de control)."; return; }
    if (!TXT_OK.test(n)) { er.textContent = "Escribe un nombre (2-60 caracteres)."; return; }
    if (!telOk(t)) { er.textContent = "Teléfono no válido."; return; }
    const l = cargarTels(); if (l.length >= 20) { er.textContent = "Máximo 20 teléfonos."; return; }
    l.push({ n, t }); LS.set(TEL_KEY, l); vistaAjustes(); toast("Teléfono añadido ✔");
  });
  vista.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { const l = cargarTels(); l.splice(+b.dataset.del, 1); LS.set(TEL_KEY, l); vistaAjustes(); }));
  $("#btnWA").onclick = compartirWhatsApp;
  $("#btnShare").onclick = compartirOtros;
  $("#btnAct").onclick = buscarActualizacion;
  $("#btnInt").onclick = verificarIntegridad;
  $("#btnForzar").onclick = forzarRecarga;
  const bi = $("#btnInstalar"); bi.hidden = !instalarEvt;
  bi.onclick = async () => { if (!instalarEvt) return; instalarEvt.prompt(); try { await instalarEvt.userChoice; } catch {} instalarEvt = null; bi.hidden = true; };
  let armado = false; const bb = $("#btnBorrar");
  bb.onclick = () => {
    if (!armado) { armado = true; bb.innerHTML = `${ico("warn")}Pulsa otra vez para confirmar`; setTimeout(() => { armado = false; bb.innerHTML = `${ico("trash")}Borrar mis datos de este móvil`; }, 4000); return; }
    LS.del(CFG_KEY); LS.del(TEL_KEY); LS.del(REC_KEY); CFG = null; try { sessionStorage.removeItem("fds.saltar"); } catch {}
    pintarCabecera(); toast("Datos borrados"); location.hash = "#/"; ruta();
  };
}

/* ---------- actualización de la app ---------- */
const msg = (t) => { const m = $("#msgApp"); if (m) m.textContent = t; };
let swReg = null, recargando = false;

async function buscarActualizacion() {
  const btn = $("#btnAct"); btn.disabled = true;
  try {
    if (!("serviceWorker" in navigator)) return msg("Este navegador no permite actualizar en segundo plano. Recarga la página.");
    if (!navigator.onLine) return msg("Sin conexión: no se puede comprobar ahora. La app sigue funcionando con la versión guardada.");
    msg("Buscando…");
    swReg = (await navigator.serviceWorker.getRegistration()) || swReg;
    if (!swReg) return msg("La app aún no está instalada para uso sin conexión. Recarga la página una vez.");
    await swReg.update();
    if (swReg.installing) await esperarInstalado(swReg.installing);
    if (swReg.waiting) { mostrarBannerNueva(); msg("¡Hay una versión nueva! Pulsa “Actualizar ahora”."); }
    else msg(`Ya tienes la última versión (v${APP_VERSION}).`);
  } catch { msg("No se pudo comprobar la actualización. Inténtalo con cobertura."); }
  finally { btn.disabled = false; }
}
function esperarInstalado(w) {
  return new Promise((res) => { if (w.state === "installed" || w.state === "redundant") return res(); w.addEventListener("statechange", () => { if (w.state === "installed" || w.state === "redundant") res(); }); });
}
function mostrarBannerNueva() {
  const b = $("#banner");
  b.innerHTML = `${ico("download")}<span>Hay una versión nueva de la app.</span><button class="btn mini" id="btnAplicar" type="button">Actualizar ahora</button>`;
  b.hidden = false;
  $("#btnAplicar").onclick = () => { if (swReg && swReg.waiting) swReg.waiting.postMessage({ type: "SKIP_WAITING" }); };
}
async function forzarRecarga() {
  msg("Limpiando y descargando de nuevo…");
  try {
    const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map((r) => r.unregister()));
    const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k)));
  } catch {}
  location.reload();
}

/* ---------- verificación de integridad (SHA-256) ---------- */
async function sha256(buf) { const h = await crypto.subtle.digest("SHA-256", buf); return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
async function verificarIntegridad() {
  const btn = $("#btnInt"); btn.disabled = true;
  try {
    if (!(window.crypto && crypto.subtle)) return msg("Este navegador no permite verificar (necesita conexión segura HTTPS).");
    msg("Verificando…");
    const man = await (await fetch("integrity.json", { cache: "no-store" })).json();
    const files = Object.keys(man.files || {}); let ok = 0; const mal = [];
    for (const f of files) {
      if (!/^[A-Za-z0-9._\/-]{1,100}$/.test(f) || f.includes("..")) { mal.push(f); continue; }
      try { const r = await fetch(f, { cache: "force-cache" }); const h = await sha256(await r.arrayBuffer()); (h === man.files[f] ? ok++ : mal.push(f)); }
      catch { mal.push(f); }
    }
    msg(mal.length ? `⚠ ${mal.length} archivo(s) no coinciden: ${mal.slice(0, 3).join(", ")}${mal.length > 3 ? "…" : ""}. Pulsa “Forzar recarga completa”.` : `✔ ${ok} de ${files.length} archivos verificados (versión ${man.version || "?"}). Todo íntegro.`);
  } catch { msg("No se pudo verificar la integridad."); }
  finally { btn.disabled = false; }
}

/* ---------- navegación ---------- */
function ruta() {
  $("#toast").hidden = true;
  let h = location.hash || "#/";
  const primera = !CFG && (() => { try { return !sessionStorage.getItem("fds.saltar"); } catch { return true; } })();
  if (primera && !h.startsWith("#/ajustes")) { vistaBienvenida(); enfocar(); return; }
  const m = h.match(/^#\/p\/([a-z0-9-]{1,60})$/);
  if (m) vistaFicha(m[1]);
  else if (h.startsWith("#/sos")) vistaSos();
  else if (h.startsWith("#/ajustes")) vistaAjustes();
  else vistaLista();
  enfocar();
}
window.addEventListener("hashchange", ruta);
window.addEventListener("online", () => { const e = $("#estadoRed"); if (e) e.textContent = "En línea"; });
window.addEventListener("offline", () => { const e = $("#estadoRed"); if (e) e.textContent = "Sin conexión (funciona igual)"; });
document.addEventListener("visibilitychange", () => { if (!document.hidden && swReg) swReg.update().catch(() => {}); });

/* ---------- service worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      swReg = await navigator.serviceWorker.register("sw.js", { updateViaCache: "none" });
      const hayNueva = () => { if (navigator.serviceWorker.controller && swReg.waiting) mostrarBannerNueva(); };
      hayNueva();
      swReg.addEventListener("updatefound", () => { const w = swReg.installing; if (w) w.addEventListener("statechange", () => { if (w.state === "installed") hayNueva(); }); });
      navigator.serviceWorker.addEventListener("controllerchange", () => { if (!recargando && sessionStorage.getItem("fds.act")) { recargando = true; location.reload(); } });
    } catch {}
  });
  document.addEventListener("click", (e) => { if (e.target.closest("#btnAplicar")) { try { sessionStorage.setItem("fds.act", "1"); } catch {} } }, true);
}

pintarCabecera();
ruta();
