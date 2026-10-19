# property-brief.js — consciente del idioma (ronda 6, OT-C)

## Qué se tocó

`property-brief.js`. Patrón copiado de `shell.js`:
`LANG = (document.documentElement.getAttribute('lang') || 'es').toLowerCase()`,
diccionario `I18N_BRIEF` por idioma, respaldo `I18N_BRIEF[LANG] || I18N_BRIEF.es`.

## Qué se tradujo

- Texto de `#briefStatus` antes de enviar (validación) y después (resumen de confirmación).
- Mensaje de WhatsApp completo (saludo, etiquetas de cada línea).
- Mensaje del botón "Limpiar".
- Formato numérico del presupuesto por locale (`toLocaleString(T.locale)`): es/nl/de
  usan punto de millar, fr usa espacio, en usa coma. Con `lang="es"` el locale es
  `es-ES`, igual que antes — no cambia el camino español.

## Qué NO se tradujo (a propósito)

- Los grupos de casillas (`briefTipo`, `briefVistas`, `briefExtras`): el código
  nunca tradujo por un diccionario de texto. `marcadas()` lee
  `el.parentElement.textContent` directamente del DOM vivo, que ya está en el
  idioma de la página (el HTML de cada isla trae el `<span>` traducido). No se
  tocó ese mecanismo: traducirlo por `value` habría sido una reescritura
  innecesaria de algo que ya funcionaba correctamente por idioma.
- El `asunto` del lead que se manda a `VPLead`/Odoo: se deja siempre en español
  a propósito porque es un campo interno que lee el equipo (habla español), no
  el visitante. No forma parte del contrato visible al usuario.
- `name`/`value` de campos y checkboxes, claves de `localStorage` (`vpPropertyBriefV3`):
  intactos.

## Verificación

- Control negativo (es antes vs después): byte a byte idéntico en `#briefStatus`
  y en el mensaje de WhatsApp decodificado, comparado contra `git show
  d4bd3d5:property-brief.js` (el "antes" de esta OT) con un stub de DOM en Node.
- Runtime real en Playwright: `nl/zoekprofiel.html` y `de/suchprofil.html`,
  formulario relleno y enviado, confirmación y WhatsApp en el idioma de la
  página. Capturas en `docs/capturas-idiomas/brief-nl-confirmacion.png` y
  `brief-de-confirmacion.png`.
- Respaldo: `lang="pl"` (no está en el diccionario) cae a español sin
  `undefined` ni huecos.
- RED-TEAM: un `value` de cada uno de los 3 grupos de checkbox (`briefTipo`,
  `briefVistas`, `briefExtras`) con etiqueta visible traducida y sin relación
  textual con el español, en nl/de/pl — ningún `undefined`, porque el mecanismo
  lee el DOM, no un diccionario keyed por texto.
