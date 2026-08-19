# Pasar la web a villasproperties.es — qué falta y en qué orden

> Auditoría del 19-08-2026. Todo lo que aquí se afirma está medido contra la web
> real, no estimado. Donde no se ha podido medir, se dice.
>
> Complemento operativo: [ANTIRETROCESO.md](ANTIRETROCESO.md) — qué no se puede
> romper y por qué.

---

## 0. LO PRIMERO: el dominio no está libre

**`villasproperties.es` tiene hoy una web Odoo en marcha con 53 URLs indexadas.**
Sustituirla sin más las convierte todas en 404 y tira por la borda el
posicionamiento acumulado.

Y no es solo el SEO: ahí vive **contenido que la preview no tiene**.

| Lo que hay hoy y NO está en la preview | Por qué importa |
|---|---|
| **8 artículos de blog** (`/blog/4/...`) | contenido indexado, con antigüedad |
| **6 landings por municipio** (`vender-casa-adeje`, `-arona`, `-granadilla`, `-guia-de-isora`, `-san-miguel-de-abona`, `-santiago-del-teide`) | SEO local puro: es la consulta que hace quien quiere vender |
| `/valoracion-gratis-tenerife`, `/cuanto-vale-tu-piso-ahora-mismo` | landings de captación con tráfico propio |
| `/financiacion`, `/catalogo`, `/galeria`, `/referidos` | secciones vivas |

**Esto no es un despliegue: es una migración.** El orden correcto:

1. **Exportar** los 8 artículos y las 6 landings municipales antes de tocar nada.
2. **Recrearlos** en la preview (los artículos con `tools/nuevo-post.js`; las
   landings municipales son la pieza que más falta).
3. **Mapear las 53 URLs** a su equivalente nuevo y dejar las **redirecciones 301**
   escritas antes del cambio.
4. **Solo entonces** apuntar el dominio.

> ⚠️ El sitemap actual declara las URLs en **http://**, no https. Al migrar hay
> que corregirlo o se pierde la señal de canonicidad.

---

## 1. Seguridad — auditado

### Corregido durante la auditoría

- 🔴 **XSS real en el brief de búsqueda.** Escribir `<img src=x onerror=...>` en
  el campo "zona" ejecutaba el código, y como el brief se guarda en
  `localStorage` y se restaura al volver, el payload persistía. Además ese texto
  viaja a Odoo. **Comprobado explotándolo y comprobado el arreglo.**
- 🟡 **Desborde horizontal en pantallas de 320 px** (iPhone SE, Galaxy S9+) en
  cuatro páginas.

### Lo que está bien

- **Una sola dependencia externa** en todo el sitio: `wa.me`. Sin CDN, sin
  fuentes de Google, sin librerías. Superficie de ataque mínima.
- **Cero cookies y cero terceros** desde que el hero dejó de usar Vimeo.
- `vp-safe.js` (escape de HTML y bloqueo de `javascript:`) cargado el primero en
  las 25 páginas.
- Datos de contacto coherentes: un teléfono, un email y un CIF en todo el sitio.

### Pendiente

| Falta | Riesgo | Dónde se arregla |
|---|---|---|
| **Cabeceras de seguridad**: solo hay HSTS. Faltan `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy` | clickjacking, sniffing de tipo, fuga de referer | GitHub Pages **no las permite**. En el VPS con Traefik sí: es una razón de peso para servir desde ahí |
| **El candado del back office no protege**: basta poner `sessionStorage.vpBackofficeUnlocked='1'` para abrirlo | **bajo hoy** — el back office solo escribe en el navegador de quien lo usa, no en el servidor | si algún día escribe en servidor, hace falta autenticación de verdad |
| Endpoint de leads público y sin CSRF | spam en el CRM | ya lleva honeypot; vigilar el volumen las primeras semanas |

---

## 2. SEO — auditado

### Bien

- JSON-LD en **25/25** páginas, **0 errores** de sintaxis: `RealEstateAgent`,
  `BreadcrumbList`, `FAQPage`, `Article`, y `RealEstateListing` en cada ficha.
- `canonical`, `og:title`, `og:image`, `twitter:card`: **25/25**.
- **Cero** títulos o descripciones duplicados. **Cero** imágenes sin `alt`.
- `robots.txt`, `sitemap.xml` y `llms.txt` presentes y correctos.

### Pendiente

- ✅ **Las 6 landings municipales ya están** (`tools/build-landings.js`), con
  los mismos slugs que las indexadas, para que la migración no genere 404.
- 🟡 **`hreflang` 0/25 y todo en español.** El comprador del sur es
  mayoritariamente extranjero. Es lo más rentable que queda, y ya existe
  `anuncio_aleman_1.mp4` grabado sin usar.
- 🟡 Dar de alta el dominio en **Search Console** y **Bing Webmaster** el día 1,
  y enviar el sitemap.

---

## 3. GEO / IA — auditado

Esta parte está mejor de lo habitual, y es una ventaja competitiva real: casi
ninguna inmobiliaria local tiene `llms.txt`.

- **`llms.txt` con cifras concretas y su fuente** (idealista, Notariado,
  Catastro) — que es lo que un modelo puede citar. **Actualizado en esta
  auditoría**: seguía diciendo 6.233 €/m² y una brecha del 21,4 %.
- **Los 9 crawlers de IA nombrados uno a uno** en `robots.txt` (GPTBot,
  OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-User,
  Google-Extended, Applebot-Extended, CCBot), hoy bloqueados por ser preview y
  listos para abrirse con `tools/abrir-indexacion.cjs`.

**Pendiente:** medir de verdad si os citan. Preguntar a ChatGPT, Perplexity y
Google AI Overviews por "vender casa en Tenerife Sur" al mes del lanzamiento y
apuntar el resultado. Sin esa medición, el GEO es fe.

---

## 4. Confort de uso y compatibilidad — auditado

**Probado en 7 dispositivos reales** (perfiles con user agent, densidad y
soporte táctil, no solo ventanas estrechas): iPhone SE, iPhone 12, iPhone 14 Pro
Max, Pixel 7, Galaxy S9+, iPad Mini, iPad Pro 11. **35 comprobaciones, sin
fallos** tras corregir el desborde de 320 px.

- Accesibilidad: `lang`, un solo `h1`, los cuatro landmarks, 0 imágenes sin
  `alt`, 0 botones sin nombre accesible. **Añadido el "Saltar al contenido"**,
  que faltaba.
- Objetivos táctiles y contenido oculto: `vp-touch` y `vp-invisible` en verde.

### Pendiente

| Falta | Por qué importa |
|---|---|
| 🔴 **Safari / WebKit sin probar.** Playwright ya no lo soporta en macOS 12, que es el de este Mac | **el iPhone usa WebKit, no Chrome.** Hay que abrir la web en un iPhone real y recorrerla antes de lanzar. Es la comprobación manual más importante que queda |
| 🟡 **La portada pesa 4,6 MB** (3 MB en móvil), casi todo el vídeo del hero | en 4G flojo la portada tarda. Opciones: no cargar vídeo en móvil y dejar el póster, o recortar el bucle |

---

## 5. Blog sin dependencias — HECHO

`tools/nuevo-post.js` publica un artículo desde un fichero de texto:

```bash
node tools/nuevo-post.js borrador.md
./tools/sellar.sh
```

Genera el HTML con la misma cabecera, pie, estilos y scripts que el resto, lo
da de alta en `blog-data.js` (para que salga en Insights y en "seguir leyendo")
y lo añade al `sitemap.xml`. Sin CMS, sin build y sin `npm install`: el
marcado mínimo está escrito a mano justamente para no introducir la primera
dependencia del sitio.

---

## 6. Lo que no estaba en la lista y hace falta

1. **Analítica.** Ahora mismo **no hay ninguna**. Se lanzaría sin saber qué
   páginas funcionan ni de dónde vienen los leads. Conviene una que no rompa el
   "cero cookies": Plausible o Umami, o los propios datos de Odoo.
2. **Aviso legal.** Hay política de privacidad, pero **no aviso legal**, y la
   LSSI lo exige para una web comercial: titular, CIF, domicilio y contacto.
3. **Vigilancia de caídas.** Si la web se cae un domingo, ahora mismo nadie se
   entera. Un ping cada 5 minutos con aviso a Telegram, como el resto de la casa.
4. **Copia de seguridad y vuelta atrás.** Definir cómo se revierte si el
   despliegue sale mal: hoy es `git revert` + push, pero conviene escribirlo.
5. **Certificado y DNS.** Comprobar el certificado del dominio y el TTL antes de
   cambiar los registros, para que la ventana de corte sea corta.
6. **Las fotos de los inmuebles.** Varias llevan marca de agua de idealista.
   Publicarlas en el dominio propio es más visible que en una preview con
   `noindex`.
7. **Correo del dominio.** `info@villasproperties.es` debe seguir recibiendo
   después de la migración: si el correo cuelga del mismo proveedor que la web,
   el cambio puede tumbarlo.

---

## 7. Orden recomendado

**Antes de tocar el dominio**
1. Exportar los 8 artículos y las 6 landings municipales de la web actual
2. Recrear las 6 landings municipales (lo más caro en SEO)
3. Escribir el mapa de redirecciones 301 de las 53 URLs
4. Probar en un iPhone real
5. Añadir aviso legal
6. Decidir analítica

**El día del cambio**
7. `node tools/abrir-indexacion.cjs --dominio=https://villasproperties.es --aplicar`
8. Cambiar DNS con TTL bajo
9. Cargar las redirecciones 301
10. Search Console + Bing, y enviar el sitemap

**La semana siguiente**
11. Vigilar 404 en Search Console
12. Comprobar que entran leads en Odoo
13. Medir la primera cita en LLM

---

## 8. Lo que ya está resuelto

- Cero cookies y cero terceros · consentimiento con efecto real
- Leads a Odoo desde valorador, brief, contacto y clic en WhatsApp con ficha
- Datos de mercado a julio de 2026 (6 municipios, 39 zonas) con su fiabilidad
- Vídeos propios autoalojados · el interruptor de indexación en un comando
- Cinco suites de QA: `vp-invisible`, `vp-touch`, `vp-recorte`, `vp-calc-audit`,
  `vp-valuation-qa`, más `vp-dispositivos` para compatibilidad
