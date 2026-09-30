# Fichas de Seguridad · Obra ISFV Ayora 1

App web instalable (PWA) para Android e iOS. Busca fichas de seguridad de los productos químicos de la obra y muestra al instante teléfonos, primeros auxilios, incendio y derrame. Funciona sin cobertura.

## Publicar en GitHub (una sola vez)
1. Crea un repositorio nuevo en github.com (por ejemplo `fichas-obra`).
2. Sube TODO el contenido de esta carpeta a la raíz del repositorio (index.html, app.js, data.js, sw.js, pdfs/, icons/…).
3. Settings → Pages → Source: "Deploy from a branch" → Branch: main / (root) → Save.
4. En 1-2 minutos tendrás la dirección: https://TU-USUARIO.github.io/fichas-obra/

## Instalar en el móvil
- Android (Chrome): abrir la dirección → menú ⋮ → "Instalar aplicación".
- iPhone (Safari): abrir la dirección → Compartir → "Añadir a pantalla de inicio".
Abrir una vez con cobertura: se descargan la app y los PDF y ya funciona sin conexión.

## Añadir o cambiar una ficha
1. Copia el PDF a `pdfs/`.
2. Añade el producto en `data.js` (copia uno existente).
3. Añade el PDF a la lista de `sw.js` y sube `VERSION` (p. ej. `fichas-v2`).
4. Sube los cambios a GitHub.

## Aviso
Resúmenes basados en las FDS de la obra. Ante cualquier duda, la ficha original manda. Varias fichas son antiguas (aviso en cada producto).
