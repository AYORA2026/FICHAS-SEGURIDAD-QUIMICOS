"use strict";

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// normaliza: minúsculas, sin acentos, sin espacios/guiones/signos (15W-40 == 15w40 == 15 w 40)
const norm = (t) => String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9+]/g, "");
const tokens = (q) => String(q ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[\s,;]+/).map((x) => x.replace(/[^a-z0-9+]/g, "")).filter(Boolean);
const AVISO_ANIOS = 3;

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
  if (p.sinFDS) return { cls: "bad", txt: "SIN FDS" };
  const a = edadAnios(p.fecha);
  if (a === null) return { cls: "warn", txt: "sin fecha" };
  if (a > 5) return { cls: "old", txt: `${new Date(p.fecha).getFullYear()} · antigua` };
  if (a > AVISO_ANIOS) return { cls: "warn", txt: `${new Date(p.fecha).getFullYear()} · revisar` };
  return { cls: "ok", txt: `${new Date(p.fecha).getFullYear()}` };
}

/* ---------- índice de búsqueda ---------- */
const H_TEXTO = {
  H222: "extremadamente inflamable aerosol", H225: "muy inflamable", H226: "inflamable", H229: "presion",
  H304: "aspiracion mortal", H315: "irritacion piel", H317: "alergia piel sensibilizante", H319: "irritacion ocular ojos",
  H332: "nocivo inhalacion", H336: "somnolencia vertigo", H351: "cancer", H361D: "feto", H373: "organos", H411: "acuatico", H412: "acuatico", H410: "acuatico",
};
const INDICE = PRODUCTOS.map((p) => {
  const partes = [
    p.nombre, p.fabricante, p.tipo, p.uso, p.cas, p.un, p.sds, ...(p.alias || []),
    ...(p.h || []).map((h) => h[0] + " " + (H_TEXTO[h[0].toUpperCase()] || "")),
    p.nivel === 2 ? "peligro inflamable" : "", p.sinFDS ? "sin ficha" : "",
  ];
  const bruto = partes.filter(Boolean).join(" ");
  return { p, blob: norm(bruto), palabras: bruto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9+]+/).filter(Boolean), nombre: norm(p.nombre) };
});

// subsecuencia: "rbw" encaja con "rubiaworks" (permite teclear 2-3 letras salteadas)
function subsec(q, t) { let i = 0; for (const c of t) if (c === q[i] && ++i === q.length) return true; return q.length === 0; }

function buscar(q, grupo) {
  const tk = tokens(q);
  let lista = INDICE.filter((x) => grupo === "todos" || x.p.familia === grupo);
  if (!tk.length) return lista.map((x) => ({ x, s: 0 })).sort((a, b) => a.x.p.nombre.localeCompare(b.x.p.nombre, "es"));
  const res = [];
  for (const x of lista) {
    let total = 0, ok = true;
    for (const t of tk) {
      let s = 0;
      if (x.nombre.startsWith(t)) s = 100;
      else if (x.palabras.some((w) => (t.length <= 3 && /^\d+$/.test(t) ? w === t : w.startsWith(t)))) s = 70;
      else if (!(t.length <= 3 && /^\d+$/.test(t)) && x.blob.includes(t)) s = 50;
      else if (t.length >= 2 && !/\d/.test(t) && subsec(t, x.nombre)) s = 15;
      if (!s) { ok = false; break; }
      total += s;
    }
    if (ok) res.push({ x, s: total });
  }
  return res.sort((a, b) => b.s - a.s || a.x.p.nombre.localeCompare(b.x.p.nombre, "es"));
}

/* ---------- teléfonos de obra (solo en este móvil) ---------- */
const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const telObra = () => LS.get("telObra", []);

function pintarSos() {
  const l = telObra();
  $("#sosObra").innerHTML = l.length
    ? l.map((t, i) => `<div class="fila-tel"><a class="call" href="tel:${esc(t.t.replace(/[^+\d]/g, ""))}">📞 ${esc(t.t)} <small>${esc(t.n)}</small></a><button class="del" data-del="${i}" aria-label="Borrar">🗑</button></div>`).join("")
    : "";
}

/* ---------- vistas ---------- */
const vista = $("#vista");
let estado = { q: "", grupo: "todos" };

function vistaLista() {
  document.title = "Fichas de Seguridad · Obra";
  vista.innerHTML = `
    <div class="buscador">
      <input id="q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false"
        placeholder="Buscar: rub, 15w40, 68, gasoil…" value="${esc(estado.q)}" aria-label="Buscar producto">
      <button id="borrar" type="button" aria-label="Borrar búsqueda" ${estado.q ? "" : "hidden"}>✕</button>
    </div>
    <div class="chips" role="tablist">${GRUPOS.map((g) => `<button class="chip ${estado.grupo === g.id ? "on" : ""}" data-g="${g.id}">${g.n}</button>`).join("")}</div>
    <p id="contador" class="contador"></p>
    <ul id="lista" class="lista"></ul>
    <p class="ayuda">💡 Puedes buscar por <b>nombre</b> (rub, azo…), <b>viscosidad</b> (15w40, 68), <b>nº ONU</b> (1202), <b>CAS</b>, <b>fabricante</b>, <b>tipo</b> (grasa, gasoil) o <b>peligro</b> (inflamable, H304).</p>`;
  const q = $("#q");
  q.addEventListener("input", () => { estado.q = q.value; $("#borrar").hidden = !q.value; pintarLista(); });
  $("#borrar").onclick = () => { estado.q = ""; q.value = ""; $("#borrar").hidden = true; pintarLista(); q.focus(); };
  vista.querySelectorAll(".chip").forEach((b) => (b.onclick = () => { estado.grupo = b.dataset.g; vistaLista(); }));
  pintarLista();
}

function pintarLista() {
  const r = buscar(estado.q, estado.grupo);
  $("#contador").textContent = r.length ? `${r.length} producto${r.length === 1 ? "" : "s"}` : "";
  $("#lista").innerHTML = r.length
    ? r.map(({ x: { p } }) => {
        const e = estadoFicha(p);
        return `<li><a class="card n${p.nivel}" href="#/p/${p.id}">
          <span class="dot n${p.nivel}" title="${["Sin clasificación de peligro", "Atención", "Peligro"][p.nivel]}">${["✔", "!", "⚠"][p.nivel]}</span>
          <span class="cuerpo"><b>${esc(p.nombre)}</b><small>${esc(p.tipo)} · ${esc(p.fabricante)}</small></span>
          <span class="badge ${e.cls}">${esc(e.txt)}</span></a></li>`;
      }).join("")
    : `<li class="vacio">No encuentro nada con “${esc(estado.q)}”.<br>Prueba con menos letras o quita filtros.<br><button class="chip on" id="limpiar">Ver todos</button></li>`;
  const l = $("#limpiar"); if (l) l.onclick = () => { estado = { q: "", grupo: "todos" }; vistaLista(); };
}

function llamar(t) {
  return `<a class="call" href="tel:${esc(t.t)}">📞 ${esc(t.show)} <small>${esc(t.n)}</small></a>`;
}

function bloque(icono, titulo, cuerpo, cls = "") {
  return cuerpo ? `<section class="bl ${cls}"><h3><span>${icono}</span>${titulo}</h3>${cuerpo}</section>` : "";
}

function vistaFicha(id) {
  const p = PRODUCTOS.find((x) => x.id === id);
  if (!p) return (location.hash = "#/");
  document.title = p.nombre + " · Fichas";
  const e = estadoFicha(p);
  const a = p.auxilios;
  const tel = [...p.tel];
  if (!tel.some((t) => t.t === "112")) tel.push({ n: "Emergencias", t: "112", show: "112" });
  const antigua = e.cls === "old" || e.cls === "warn";
  const avisos = [];
  if (p.sinFDS) avisos.push(`<div class="aviso bad"><b>No hay ficha de seguridad utilizable.</b> ${esc(p.peligro)}</div>`);
  if (antigua) avisos.push(`<div class="aviso old"><b>Ficha de ${fechaTxt(p.fecha)} (más de ${AVISO_ANIOS} años).</b> Puede estar desactualizada: pedir la FDS vigente al proveedor.</div>`);

  vista.innerHTML = `
  <article class="ficha">
    <button class="volver" id="volver">← Volver</button>
    <div class="cab n${p.nivel}">
      <div class="cab-t"><span class="tipo">${esc(p.tipo)}</span><h2>${esc(p.nombre)}</h2><p>${esc(p.fabricante)}</p></div>
      <div class="nivel n${p.nivel}">${["SIN CLASIFICAR", "ATENCIÓN", "PELIGRO"][p.nivel]}</div>
    </div>
    ${avisos.join("")}
    <div class="llamar">${tel.map(llamar).join("")}</div>

    ${!p.sinFDS ? `<div class="peligro n${p.nivel}"><b>Qué riesgo tiene:</b> ${esc(p.peligro)}</div>` : ""}

    ${bloque("🩺", "EN CASO DE ACCIDENTE", `
      <dl class="aux">
        <div><dt>👁 Ojos</dt><dd>${esc(a.ojos)}</dd></div>
        <div><dt>🧴 Piel</dt><dd>${esc(a.piel)}</dd></div>
        <div><dt>🫁 Inhalación</dt><dd>${esc(a.inhalacion)}</dd></div>
        <div class="${/NO provocar|NUNCA provocar|urgencia/i.test(a.ingestion) ? "clave" : ""}"><dt>👄 Ingestión</dt><dd>${esc(a.ingestion)}</dd></div>
      </dl>`, "aux-bl")}

    ${p.fuego ? bloque("🔥", "INCENDIO", `<p><b class="si">Usar:</b> ${esc(p.fuego.usar)}</p>${p.fuego.no && p.fuego.no !== "—" ? `<p><b class="no">No usar:</b> ${esc(p.fuego.no)}</p>` : ""}${p.fuego.nota ? `<p>${esc(p.fuego.nota)}</p>` : ""}`) : ""}

    ${bloque("🧯", "DERRAME", `<p>${esc(p.derrame)}</p>`)}

    ${p.nota ? bloque("👷", "NOTA DEL TÉCNICO <small>(orientación, no es texto de la FDS)</small>", `<p>${esc(p.nota)}</p>`, "nota") : ""}

    ${p.h && p.h.length ? bloque("⚠", "INDICACIONES DE PELIGRO", `<ul class="hs">${p.h.map((h) => `<li><b>${esc(h[0])}</b> ${esc(h[1])}</li>`).join("")}</ul>${p.palabra ? `<p class="palabra">Palabra de advertencia: <b>${esc(p.palabra)}</b></p>` : ""}`) : ""}

    ${bloque("📋", "DATOS", `<table class="datos">
      ${p.cas ? `<tr><th>CAS / composición</th><td>${esc(p.cas)}</td></tr>` : ""}
      ${p.un ? `<tr><th>Transporte (ONU)</th><td>${esc(p.un)}</td></tr>` : ""}
      ${p.flash ? `<tr><th>Punto de inflamación</th><td>${esc(p.flash)}</td></tr>` : ""}
      <tr><th>Uso</th><td>${esc(p.uso)}</td></tr>
      <tr><th>Fecha de la ficha</th><td>${fechaTxt(p.fecha)} · ${esc(p.version || "")}</td></tr>
    </table>`)}

    <div class="pdfs">
      ${p.fds ? `<a class="pdf main" href="pdfs/${esc(p.fds)}" target="_blank" rel="noopener">📄 Abrir FDS completa (PDF)</a>` : ""}
      ${p.tds ? `<a class="pdf" href="pdfs/${esc(p.tds)}" target="_blank" rel="noopener">📄 ${esc(p.tdsNombre || "Ficha técnica (TDS)")}</a>` : ""}
    </div>
  </article>`;
  $("#volver").onclick = () => (history.length > 1 ? history.back() : (location.hash = "#/"));
  window.scrollTo(0, 0);
}

/* ---------- navegación ---------- */
function ruta() {
  const m = location.hash.match(/^#\/p\/(.+)$/);
  if (m) vistaFicha(decodeURIComponent(m[1]));
  else { vistaLista(); }
}
window.addEventListener("hashchange", ruta);

/* ---------- panel emergencia ---------- */
const panel = $("#sosPanel");
$("#btnSos").onclick = () => { pintarSos(); panel.hidden = false; };
panel.addEventListener("click", (e) => {
  if (e.target === panel || e.target.hasAttribute("data-close")) panel.hidden = true;
  const d = e.target.closest("[data-del]");
  if (d) { const l = telObra(); l.splice(+d.dataset.del, 1); LS.set("telObra", l); pintarSos(); }
});
$("#formTel").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const l = telObra(); l.push({ n: String(f.get("n")).trim(), t: String(f.get("t")).trim() });
  LS.set("telObra", l); e.target.reset(); pintarSos();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") panel.hidden = true; });

/* ---------- PWA / sin conexión ---------- */
function estadoRed() {
  $("#estado").textContent = navigator.onLine ? "" : "📴 Sin conexión: la app y las fichas siguen funcionando.";
}
window.addEventListener("online", estadoRed); window.addEventListener("offline", estadoRed); estadoRed();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

ruta();
