# ANTIRETROCESO — qué no se puede romper y por qué

> Documento de guardia. Cada línea de aquí está escrita porque algo se rompió,
> se rompió dos veces, o estuvo a punto. **Si vas a tocar algo de esta lista,
> lee antes el porqué.** Casi ninguna de estas reglas se entiende mirando el
> código: por eso están aquí y no solo en un comentario.
>
> Última revisión: 19-08-2026

---

## 0. Antes de dar nada por bueno

```bash
cd ~/villasproperties-preview && python3 -m http.server 4799 &
cd ~/vp-qa
BASE=http://localhost:4799/ node vp-invisible.js      # contenido tapado por animaciones
BASE=http://localhost:4799/ node vp-touch.js          # desbordes y objetivos táctiles
BASE=http://localhost:4799/ node vp-recorte.js        # texto recortado en silencio
BASE=http://localhost:4799/ node vp-calc-audit.js     # que las calculadoras cuadren
BASE=http://localhost:4799/ node vp-valuation-qa.js   # el valorador entero
```

Los cinco tienen que salir en verde. `vp-touch` y `vp-recorte` son los que
cazan las regresiones de un rediseño; los otros tres, las de lógica.

**Una captura vale más que un test en verde.** Dos de los peores fallos de esta
web pasaron por delante de tests que decían "correcto" y solo se vieron mirando
una imagen. Si tocas algo visual, míralo.

---

## 1. Reglas de CSS que parecen inocentes y no lo son

| Regla | Si la quitas |
|---|---|
| `.motion-ready:not(.hero-in) .hero-content>*` | la portada se queda **sin titular** |
| `.property .media { display: block }` | el `<a>` vuelve a ser inline y **las tarjetas pierden la foto** |
| `[data-reveal="image-reveal"] { clip-path: none }` en el contenedor | el recorte salta al contenedor y **la foto no aparece jamás** |
| `.map-chip` / `.pricemap` z-index | el mapa **tapa el header** o las etiquetas colapsan |
| `scroll-margin-top` | el ancla cae **detrás del header** |
| `header.solid` | el header deja de fijarse al bajar |

### 1.1 `min-width: 0` en los hijos de `.head` y `.pagehero`

**No lo quites.** Los hijos de un grid nacen con `min-width: auto`, así que una
palabra que no quepa —"INTERPRETAMOS" a 46px mide 385px— **ensancha su propia
columna** por encima del ancho de la pantalla. Como `.section` lleva
`overflow: hidden`, el sobrante no genera scroll: se recorta en silencio y la
palabra se pinta sin su última letra.

Ningún test de desborde lo cazaba, porque no hay scroll que medir y dentro del
`h2` el texto "cabe". Se descubrió mirando una captura de móvil. Para eso
existe ahora `vp-recorte.js`, que mide el borde **absoluto** del texto contra
la ventana.

### 1.2 Los titulares editoriales

`.t-ligero` va en **peso 100** (Ultralight real en la pila del sistema) y
`.t-solido` en 800. El contraste entre ambos es el gesto de la marca.

- Es **delgada y sólida**, nunca hueca. Un intento con `-webkit-text-stroke` y
  relleno transparente se rechazó expresamente: se ve degradado, no fino.
- El interletraje de la delgada (`.085em`) acompaña al peso: a menos trazo,
  más aire, o el texto se deshilacha.

---

## 2. El preloader y el consentimiento

### 2.1 La red de seguridad del preloader

```css
animation: pl-out .5s ... 9s forwards;
```

Ese `forwards` con retardo es lo que retira el preloader **aunque el JS no se
ejecute nunca**. Si lo quitas y algo falla, el visitante se queda mirando el
logo para siempre. `app.js` solo lo *adelanta*.

### 2.2 El preloader espera al vídeo. A propósito.

El orden es: DOM → tipografías → **vídeo del hero** → un frame pintado.
Quitar la espera del vídeo para "que cargue antes" ya se intentó y fue un
retroceso explícito: la web entraba y el fondo aparecía después.

### 2.3 La pausa cuelga de `<html>`, no de `<body>`

```css
html.vp-consent-espera body::before { animation-play-state: paused; }
```

`<html>` existe desde el primer byte; `<body>` puede no estar todavía. Con
`<body>` se midió `DOMContentLoaded` a **5,3 s** contra una red de seguridad de
9 s: con una conexión lenta la web se colaba por debajo del aviso sin haber
preguntado nada.

Por el mismo motivo **`vp-consent.js` no lleva `defer`**.

### 2.4 Los tres seguros del aviso de cookies

En villasproperties.es un modal de cookies acabó cubriendo la ventana con el
botón muerto. Aquí no puede pasar:

1. Si el JS no corre, el CSS retira el preloader igual.
2. A los **20 s** sin decidir, el aviso baja al pie y **deja de bloquear**.
3. `Escape` = "solo lo esencial", nunca la opción que más concede.

### 2.5 El texto del aviso dice lo que se midió

La web pone **una sola cookie**: `__cf_bm`, de `.vimeo.com`, por el vídeo de
portada. Ni analítica, ni publicidad, ni cookies propias.

> ⚠️ **Si algún día se añade analítica**: hay que cambiar el texto del aviso
> **y subir `VERSION` en `vp-consent.js`**. Si no se sube, nadie vuelve a ser
> preguntado y el consentimiento guardado deja de ser válido.

> ✅ **19-08-2026: ya no hay terceros.** El hero pasó de un iframe de Vimeo a
> vídeo propio autoalojado, así que la web quedó a **CERO cookies y CERO
> dominios externos** y el aviso **dejó de aparecer solo**: `vp-consent.js`
> comprueba si hay terceros con `.hero-vimeo[data-src], [data-tercero]` y ya no
> encuentra ninguno. El mecanismo se conserva entero: el día que se añada un
> tercero (analítica, un mapa embebido, otro reproductor), basta con marcarlo
> con `data-tercero` y el aviso vuelve solo.

---

## 3. Vídeos

| Vídeo | Página | Comportamiento |
|---|---|---|
| `inversores-web.mp4` | `invest.html`, 1ª sección tras el hero | **a sangre + arranque automático** |
| `vender-hoy.mp4` | `sell.html` | dos columnas, play a demanda |
| `villas-tenerife.mp4` | portada, antes del CTA | play a demanda |
| `hero-desktop.mp4` / `hero-mobile.mp4` | fondo del hero de la portada | bucle mudo, sin terceros |

**El hero ya no usa Vimeo.** El vídeo propio es el único metraje recibido **sin
texto quemado**, que era justo lo que impedía usar los otros de fondo. Se
recortan los primeros 20 s de los 38 limpios (el logo entra a los 40 s).

⚠️ El `<video>` del hero necesita **la clase `.active`**, no solo
`data-variant`: el CSS antiguo lo tiene en `display:none` y solo `.hero-video.active`
lo muestra. Con `data-variant` a secas se queda en 0×0 y ni siquiera arranca,
porque un elemento de tamaño cero no dispara el IntersectionObserver.

⚠️ **El velo oscuro del hero es obligatorio con este metraje.** Es cielo y arena
a plena luz, y el titular va en tonos pastel: sin reforzar el degradado las dos
primeras líneas son ilegibles.

### 3.1 Trampas al añadir un vídeo nuevo

- **`assets/video/.gitignore` ignora `*.mp4`.** Sin añadir su `!nombre.mp4`, el
  vídeo no llega a GitHub Pages y queda un play que no reproduce nada.
- **Los másteres llegan en HEVC**, que Chrome y Firefox **no reproducen**. Hay
  que transcodificar a H.264 siempre. Uno pasó de 80 MB a 4,2 MB.
- **`preload="none"` en todos.** Sin eso, cada vídeo se descarga en cada visita.
- **Nunca `width: 100vw` para el sangrado.** En Windows incluye la barra de
  scroll y provoca desborde horizontal en toda la página. El ancho completo se
  consigue sacando el `<figure>` fuera del `.wrap` en el HTML.
- **`object-fit: contain`, no `cover`.** El vídeo de inversores lleva cifras y
  rótulos pegados a los bordes: recortar se come los datos.

### 3.2 El autoplay no es solo `autoplay`

`vp-video.js` existe porque un `autoplay` a secas deja tres cosas rotas:

1. **El peso**: se descargaría siempre. El fichero cuelga de `data-src` y solo
   se asigna al entrar en pantalla.
2. **`prefers-reduced-motion`**: no arranca ni descarga. A mucha gente el
   movimiento automático le provoca mareo.
3. **Ahorro de datos / 2G**: tampoco arranca.

Y **conserva los controles siempre**: la pauta WCAG 2.2.2 exige poder parar
algo que se mueve solo más de cinco segundos, y el vídeo dura cuarenta y cinco.

`muted` va explícito aunque el vídeo no tenga pista de audio: sin ese atributo
Safari e iOS se niegan a arrancar.

### 3.3 Por qué no van en el hero

Los creativos llevan **texto quemado** ("TENERIFE.", "PROPERTY.", "HABLEMOS")
que es justo el que la web ya dice en HTML. De fondo se pisan y quedan
ilegibles, y en bucle el cierre no tiene sentido. Además se perdería el `h1`,
que es señal fuerte de SEO: el buscador no lee rótulos incrustados.

---

## 3bis. Contacto y espacio del fundador

- **El formulario NO tiene backend.** La web es estática: no hay servidor que
  reciba un POST. `contact-form.js` compone el mensaje y lo abre en el WhatsApp
  del visitante, que ve exactamente qué envía y a quién. Aquí no se guarda ni
  un dato de nadie. Si algún día se pone un backend de verdad, hay que revisar
  el aviso de privacidad: ahora mismo dice que no se almacena nada.
- **Solo el nombre es obligatorio.** Pedir más campos en un formulario de
  contacto solo consigue que la gente se vaya.
- **La foto ya está puesta**: `assets/team/valeria-villa.webp` (47 KB, 3:4, con
  JPG de respaldo). Lleva `width`/`height` en el HTML para reservar el sitio
  antes de cargar y que no salte la maquetación.
- **El nombre y el cargo son dato, no suposición**: Valeria Villa, CEO de
  Villa's Properties. En la primera versión puse el de Jose por deducción propia
  y estaba mal. Si cambia, se cambia también el `alt` de la imagen.
- **Los datos de contacto son reales y verificados**: +34 667 384 965,
  info@villasproperties.es, VILLVERG SL · B19430115. No inventar credenciales,
  años de experiencia ni número de operaciones en el texto del fundador.

---

## 3bis-b. La casilla de consentimiento del valorador

`.field input{width:100%}` está pensada para campos de texto, pero también
alcanzaba al `<input type="checkbox">`: ocupaba los 296px del bloque y empujaba
el texto fuera de la caja —31px fuera de la ventana en móvil—. La casilla
necesita su ancho fijo y el texto un `min-width: 0` para poder partir.

## 3ter. El menú NO está en el HTML

`shell.js` construye la cabecera de las 25 páginas desde su array `NAV`, y
`app.js` monta aparte el desplegable móvil. **Editar el `<nav>` de un HTML no
sirve de nada**: al cargar, el JS lo sobrescribe. Si se toca el menú hay que
tocar los dos sitios, o móvil y escritorio dejan de coincidir.

Son **seis** entradas a propósito: un menú de ocho no se lee, se escanea y se
abandona. Finance e Insights salieron del menú pero conservan tres enlaces cada
una en el cuerpo y el pie, así que no pierden tráfico interno ni enlaces de SEO.

## 3quater. Las zonas de Tenerife (`#tf-zonas`)

- **La portada muestra 4 propiedades como máximo** (`TOPE_PORTADA` en `app.js`).
  El catálogo completo sigue mostrándolas todas: son dos cosas distintas.
- El scrollytelling mide `--tf-zones × 58vh`. Estaba a 90vh, o sea **4.050 px**:
  cuatro pantallas y media para ver cinco fotos.
- Esa altura va dentro de `@media (prefers-reduced-motion: no-preference)`. Si
  se saca de ahí, se le impone el recorrido a quien pidió justo lo contrario.
- 🔴 **`.tf-section` va con `overflow: clip`, NUNCA con `overflow: hidden`.**
  Un ancestro con `overflow` distinto de `visible` crea un contenedor de scroll
  y **rompe el `position: sticky`** del hijo. Con `hidden`, la escena se iba
  hacia arriba con el scroll y lo único que quedaba en pantalla era el fondo
  negro de la sección: se veía Costa Adeje al entrar y negro el resto del
  recorrido, aunque el JS informara de que la capa activa tenía opacidad 1.
  `clip` recorta igual pero no crea contenedor de scroll.
- **Las fotos de las zonas son paisajes** (`zona-*.webp`, 1600×900). Antes eran
  `prop-*.webp`: interiores de pisos a 480×360, que ni son la zona ni dan
  resolución para pantalla completa.
- **Con `reduced-motion` la sección era un pasillo negro**: el CSS oculta
  `.tf-stage` —las cinco fotos van superpuestas— y quedaba solo texto sobre
  fondo oscuro. Ahora `tenerife-cinematic.js` le devuelve a cada zona SU foto y
  el CSS las coloca en rejilla: de 1.810 px de negro a 1.069 px con imágenes.

---

## 3quinquies. Los leads van a Odoo (`vp-lead.js`)

Odoo expone `/website/form/crm.lead` (módulo `website_crm`, instalado en
`VILLVERG18`) y **acepta un POST sin autenticación y sin token CSRF**.
Verificado contra producción: creó los leads 772, 773 y 774, todos borrados
después. Eso es lo que permite crear leads desde una web estática **sin
credenciales en el navegador y sin tocar el servidor**.

- **`mode: 'no-cors'` es obligatorio.** Odoo no devuelve cabeceras CORS, así que
  un `fetch` normal se bloquea. Con `no-cors` y
  `Content-Type: application/x-www-form-urlencoded` la petición es "simple", no
  hay preflight y el navegador la envía. El precio: la respuesta llega opaca y
  **no se puede leer el id del lead**, así que nunca se le dice al visitante
  "recibido" basándose en ella.
- **`team_id: 11` = "Villa's · Compraventas".** Es lo que separa estos leads de
  los de okservice. La `company_id` la pone Odoo sola (`#okservice.es`) y no se
  pelea: aquí solo hay una sociedad real, VILLVERG SL, y la marca se distingue
  por equipo.
- **`description` va en TEXTO PLANO.** Odoo escapa el HTML: los `<br>` salían
  literales como `&lt;br&gt;`.
- **El endpoint es público y sin CSRF: admite spam.** Por eso los formularios
  llevan honeypot (`#vp_hp`), colocado fuera de pantalla y NO con
  `display:none`, que muchos bots ya detectan.
- WhatsApp se mantiene **además** de Odoo: si Odoo está caído o hay un
  bloqueador, el lead no se pierde.

**Qué manda lead y qué no**, que es una decisión, no un olvido:

| Origen | ¿Lead? |
|---|---|
| Valorador, brief y contacto | sí — captan nombre y teléfono |
| Clic en WhatsApp **desde una ficha** | sí — con el inmueble, la referencia y el precio |
| Clic en el botón flotante de WhatsApp | **no** — no hay contexto |
| Calculadoras (finance-lab, compare, decision-lab, market-impact, buy) | **no** — no captan contacto |

Las calculadoras no crean lead a propósito: sin nombre ni teléfono quedaría una
ficha vacía, y llenar el CRM de leads sin contacto es la forma más rápida de
que nadie vuelva a mirarlo. El clic en ficha sí, porque el mensaje va a llegar
por WhatsApp y quien atienda lo tiene ya con el inmueble delante.

---

## 4. Lo que mantiene la web invisible (y es intencionado)

Hay **cuatro frenos** puestos a propósito. No se tocan a mano:

1. `noindex` en las 25 páginas
2. `robots.txt` con `Disallow: /`
3. la línea `Sitemap:` comentada
4. **246 referencias a `josecrea.github.io`** en canonical, og:url, sitemap,
   llms.txt y JSON-LD

El día del lanzamiento se sueltan los cuatro con un solo comando:

```bash
node tools/abrir-indexacion.cjs --dominio=https://villasproperties.es            # simula
node tools/abrir-indexacion.cjs --dominio=https://villasproperties.es --aplicar  # lo hace
```

> ⚠️ El riesgo no es olvidar el `noindex` —eso se nota, no aparece nadie—. Es
> **olvidar las URLs**: se abriría la indexación del dominio equivocado, el SEO
> se lo llevaría `github.io` y recuperarlo obliga a redirigir y a perder
> autoridad.

Probado sobre una copia: los cuatro frenos caen y las cinco comprobaciones
salen en verde.

---

## 5. Ficheros generados: no se editan a mano

| Fichero | Lo genera |
|---|---|
| `market-data.js` | el scraper del repo privado de precios |
| `nearby-data.js` | `tools/build-nearby.cjs` (OpenStreetMap) |

Al regenerar `market-data.js` hay que **revisar a mano las cifras citadas en
los `post-*.html`**: el texto de los artículos no se actualiza solo y puede
quedar contradiciendo al dato.

---

## 6. Orden de los scripts

`vp-safe.js` **el primero** y `backoffice-auth.js` **el último**, en las 25
páginas. `vp-safe.js` es el que neutraliza el HTML de los datos y bloquea
`javascript:` en las URLs; si carga tarde, hay una ventana de XSS.

---

## 7. Reglas de trabajo

- **QA con clic real, no con `curl`.** Tres QA dieron "verde por curl" tapando
  botones rotos.
- **Nunca `git push --force` sobre `main`.**
- **Antes de culpar a tu cambio, compáralo.** Un `git worktree` del commit
  anterior servido en otro puerto responde en dos minutos si una regresión es
  tuya o venía de antes. Ya evitó "arreglar" algo que no estaba roto.
- **Desconfía de tus propios tests.** En una sola sesión dieron falsos
  positivos por: el viewport puesto en `newPage` en vez de en `newContext`, una
  página inexistente en la lista, una regex que ignoraba `text-transform:
  uppercase`, y un `clip` de captura mal calculado.
- **Un test intermitente es un test roto.** `vp-touch` daba 25 hallazgos en una
  pasada y 0 en la siguiente: medía elementos de un menú cerrado, fuera de
  pantalla, mientras el JS los montaba. Se arregló filtrando por posición, no
  subiendo el tiempo de espera.
