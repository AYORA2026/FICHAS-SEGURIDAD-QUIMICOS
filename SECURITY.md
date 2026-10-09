# Revisión de seguridad · v1.1.0 (30/09/2026)

Alcance: código de la app, service worker, PDF incluidos y configuración de publicación en GitHub Pages.
Modelo de amenaza: (1) alguien manipula los datos que ve el operario en una emergencia; (2) XSS/inyección vía entradas del usuario; (3) fuga de datos personales (nombre y teléfono del responsable); (4) PDF con contenido activo; (5) compromiso del repositorio o de la cuenta.

## Resultado
Sin hallazgos críticos abiertos. Lo que se encontró se corrigió; lo que no se puede corregir desde el código se lista como riesgo residual con su acción recomendada.

| # | Hallazgo | Riesgo | Estado |
|---|---|---|---|
| 1 | Sin Content-Security-Policy | Medio | Corregido: CSP estricta (`default-src 'none'`, scripts/estilos solo `'self'`, sin `unsafe-inline`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`, `frame-src 'none'`; desde la v1.3 añade `font-src 'self'` para la tipografía incluida). Probado: un script inline inyectado se bloquea. |
| 2 | Entradas del usuario (proyecto, responsable, teléfonos) mostradas con `innerHTML` | Medio | Corregido: escape de todo dato dinámico, validación con lista blanca (letras, números y puntuación básica), longitud máxima, rechazo explícito de `< >` y caracteres de control, revalidación al leer de `localStorage`. |
| 3 | Enlaces `tel:` construidos con texto libre | Bajo | Corregido: solo dígitos y `+` (y validación de 6-15 dígitos). |
| 4 | Ruteo por `location.hash` | Bajo | Corregido: identificador por lista blanca `[a-z0-9-]`, búsqueda en el catálogo (sin `__proto__`), sin `decodeURIComponent` sin control. |
| 5 | Service worker: caché obsoleta / envenenamiento | Medio | Corregido: caché versionada; precarga con `cache: "reload"` (evita copias viejas de la caché HTTP de GitHub Pages); solo GET del mismo origen; nunca intercepta peticiones externas; la actualización la decide el usuario. |
| 6 | Manipulación o corrupción de las fichas | Medio | Mitigado: `integrity.json` con SHA-256 de los 35 archivos + botón “Verificar integridad”. Limitación: detecta corrupción y cambios parciales, no un repositorio comprometido (ver riesgos residuales). |
| 7 | Fuga por `Referer` / `window.opener` | Bajo | Corregido: `referrer: no-referrer`, enlaces `rel="noopener noreferrer"`. |
| 8 | Recursos de terceros | — | Ninguno: cero CDN, fuentes, analítica, cookies ni peticiones externas (verificado por análisis del código). |
| 9 | PDF con contenido activo | Info | Los 25 PDF analizados (estructura completa, incluidos flujos comprimidos): sin JavaScript, sin `Launch`, sin `SubmitForm`, sin ficheros incrustados. Solo enlaces `URI` normales de los fabricantes (algunos `http://`: quick-fds.com, cefic.org, echa.europa.eu, eur-lex.europa.eu) y `mailto:`. |
| 10 | Metadatos de los PDF con nombres/usuarios de terceros | Bajo | Corregido en 7 PDF (campo Autor eliminado; contenido verificado idéntico: mismas páginas y mismo texto). Los originales no se han alterado en nada más. |
| 11 | Clickjacking | Bajo | Mitigado parcialmente: GitHub Pages no permite cabeceras `X-Frame-Options`/`frame-ancestors`, así que la app se oculta y sale del marco si detecta que está incrustada. |
| 12 | Datos personales (RGPD) | Bajo | Nombre y teléfono del responsable solo en `localStorage` del propio móvil; sin envío a ningún servidor; se pueden borrar desde Ajustes. |

## Riesgos residuales (requieren acción tuya)
1. **Cuenta y repositorio de GitHub** (el mayor riesgo real: quien pueda subir código puede cambiar teléfonos y primeros auxilios):
   - Activar 2FA en todas las cuentas con acceso a la organización.
   - Proteger la rama `main` (Settings → Branches): exigir Pull Request y no permitir push directo ni force-push.
   - Limitar quién tiene permiso de escritura (mínimo imprescindible).
   - Activar “Secret scanning” y “Push protection”.
   - Exigir commits firmados (opcional, recomendable).
   - Revisar en Settings → Integrations que la aplicación de Claude solo tiene acceso a este repositorio y **retirarle el permiso de escritura cuando no se use**.
   - Marcar “Enforce HTTPS” en Pages.
2. **Origen compartido de GitHub Pages**: todos los repositorios Pages de `AYORA2026` comparten el origen `ayora2026.github.io` (y por tanto `localStorage`). Las claves de esta app llevan prefijo `fds.v1.`, pero si publicas otras apps en la misma organización, un fallo en una podría leer los datos de otra. Solución robusta: dominio propio para esta app (o una organización distinta).
3. **Contenido de las fichas**: la exactitud depende de las FDS originales. Varias son antiguas (avisos visibles en la app). Solicitar las vigentes a los proveedores y revisar el resumen de las de gasóleo, NU-20, Galvafix y Marker Paint antes de fiarse de ellas en obra.
4. **Móvil sin bloqueo**: quien tenga el móvil desbloqueado ve el nombre y teléfono del responsable (dato ya visible en el plan de emergencia).
5. **PDF de terceros**: se abren en el visor del navegador. Mantener el navegador y el sistema actualizados.
6. No se ha probado en dispositivos Android/iOS reales, solo en un navegador con tamaño de móvil (incluido modo sin conexión y flujo de actualización).

## Comprobaciones realizadas
- Análisis estático: sin `eval`, `Function`, `document.write`, manejadores `on*` en línea ni URL `javascript:`; 12 usos de `innerHTML`, todos con datos escapados o estáticos.
- Pruebas automáticas: inyección `<img onerror>` en formularios (rechazada), hash manipulados (`__proto__`, `../`, `<script>`), script inline (bloqueado por CSP), modo sin conexión (app y PDF), verificación de integridad (35/35), actualización de versión sin perder la configuración.
- Consola del navegador sin errores ni avisos de CSP.

## Cambios de la v1.3.0 (rediseño «Mosaico»)
- Tipografía Lexend (licencia SIL OFL) incluida en `fonts/`: ningún recurso externo, se verifica con el resto de archivos.
- Nueva clave local `fds.v1.rec` (últimos 5 productos consultados, solo ids válidos). Se borra con «Borrar mis datos de este móvil».
- Botón de compartir por WhatsApp (v1.2.0): solo envía el enlace de la app y el nombre del proyecto; no incluye nombre ni teléfono del responsable.
