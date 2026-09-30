# Fichas de Seguridad · Obra

App web instalable (PWA, Android e iOS) para buscar al instante las fichas de seguridad (FDS) de los productos químicos de la obra y ver a quién llamar y qué hacer en caso de accidente. Funciona **sin cobertura**.

- **Buscador**: por nombre (2-3 letras), viscosidad (`15w40`, `68`), nº ONU, CAS, fabricante, tipo o peligro (`H304`, `inflamable`).
- **Ficha de emergencia**: teléfonos, primeros auxilios, incendio, derrame, indicaciones de peligro y PDF original.
- **Configuración inicial**: proyecto y responsable de emergencias (técnico de prevención al mando) con su teléfono. Se guarda solo en el móvil.
- **Actualizar**: Ajustes → “Buscar actualización”. La versión se ve arriba a la derecha.
- **Integridad**: Ajustes → “Verificar integridad de las fichas” (SHA-256).

## Publicar (GitHub Pages)
Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
Dirección: `https://<organización>.github.io/<repositorio>/`

## Instalar en el móvil
- Android (Chrome): menú ⋮ → “Instalar aplicación”.
- iPhone (Safari): Compartir → “Añadir a pantalla de inicio”.
Abrir una vez con cobertura para que se descarguen las fichas.

## Añadir o cambiar una ficha
1. Copia el PDF a `pdfs/` (nombre en minúsculas, sin espacios, `.pdf`).
2. Añade o edita el producto en `data.js`.
3. Sube `APP_VERSION` en `app.js` (p. ej. `1.1.1`).
4. Ejecuta `python3 tools/build.py` (regenera `sw.js` e `integrity.json`).
5. Sube los cambios a GitHub. Los móviles verán el aviso “Hay una versión nueva”.

## Seguridad
Ver [SECURITY.md](SECURITY.md).

## Aviso
Los resúmenes proceden de las FDS de la obra. Ante cualquier duda manda la ficha original y llama al Instituto Nacional de Toxicología (91 562 04 20) o al 112. Varias fichas son antiguas (aviso en cada producto).
