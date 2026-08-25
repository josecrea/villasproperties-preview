# Fondos de las tarjetas de Insights — prompts para Nano Banana

Diez fondos, uno por tema editorial. Van **detrás** del gráfico de cada tarjeta (las
barras, la línea de puntos, los círculos), así que no son ilustraciones protagonistas:
son textura. Si la imagen tiene un foco fuerte en el centro, el gráfico deja de leerse.

## Cómo usarlos

1. Genera cada imagen en **Google AI Studio / Gemini** con el prompt de abajo.
2. Guárdala como **`<tema>.webp`** (o `.png` renombrado a `.webp` si hace falta) en
   esta misma carpeta: `assets/fig/`.
3. Ya está. No hay que tocar CSS ni HTML.

El CSS declara los dos ficheros apilados —`url(tema.webp), url(tema.svg)`—, así que en
cuanto exista el `.webp` se pinta encima del SVG; mientras no exista, se sigue viendo el
SVG y no se rompe nada. Puedes ir subiéndolos de uno en uno.

## Ajustes que valen para los diez

- **Formato:** 16:10 (o 16:9). Resolución 1600×1000 suficiente; la tarjeta más grande
  del sitio mide ~830 px de ancho.
- **Peso:** exporta a WebP con calidad ~72. Objetivo **por debajo de 90 KB**. Diez
  imágenes a 300 KB se cargarían el rendimiento de la página, que es uno de los
  objetivos del plan SEO.
- Si una queda muy contrastada, baja la opacidad en `site.css` (`.pcard-fig[data-bg]::before`,
  hoy `opacity:.9`).

## La paleta, literal

Pégala tal cual dentro del prompt; son los colores exactos de `site.css`.

```
#5f8075 (verde atlántico) · #dfe8e3 (verde muy claro) · #c9ad95 (arena)
#f3ece4 (arena clara) · #20242a (tinta) · #f2eee8 (papel) · #fbfaf7 (papel claro)
```

---

## Los diez prompts

Todos comparten esta coletilla, que es la que hace que sirvan como fondo. **No la quites.**

> `Muted, low-contrast, atmospheric background texture. No text, no letters, no numbers, no logos, no people, no buildings in focus. Nothing important in the centre — the centre must stay visually empty so a chart can sit on top. Soft even lighting, no harsh shadows, no vignette. Editorial, restrained, expensive-looking. Palette strictly limited to: #5f8075, #dfe8e3, #c9ad95, #f3ece4, #20242a, #f2eee8. 16:10.`

### 1 · `mapa.webp` — El mapa del metro cuadrado
```
Abstract aerial view of a coastal terrain reduced to topographic contour lines,
like a cartographer's draft. Thin sage-green lines on a pale warm paper ground,
suggesting the ridges and barrancos of southern Tenerife falling to the sea.
+ coletilla común
```

### 2 · `suelo.webp` — Suelo urbano / 125.000 viviendas
```
Abstract cadastral land parcels seen from directly above: irregular plots of dry
volcanic soil separated by faint boundary lines, in warm sand tones with sage
accents. Flat, diagrammatic, sun-bleached.
+ coletilla común
```

### 3 · `brecha.webp` — Lo que pides y lo que se firma
```
Two parallel horizontal planes at slightly different heights, separated by a soft
gradient gap, like two strata of rock or two layers of paper. Ink grey and pale
warm grey. Minimal, geometric, quiet tension between the two levels.
+ coletilla común
```

### 4 · `liquidez.webp` — Dónde se vende de verdad
```
Scattered soft dots of varying density across a pale ground, denser toward one
side, like a map of activity or a long-exposure of movement. Sage green on very
pale green. Abstract, no map outlines.
+ coletilla común
```

### 5 · `metodo.webp` — Cómo valorar tu vivienda
```
Faint architectural drafting grid with a few construction lines and measurement
arcs, as if from an old blueprint, on warm sand paper. Precise but faded, mostly
empty space.
+ coletilla común
```

### 6 · `exposicion.webp` — Por qué tu casa no se vende
```
A long soft shadow slowly stretching across an empty pale surface, suggesting
time passing and light fading. Cool grey and pale warm grey. Melancholic, still,
almost nothing happening.
+ coletilla común
```

### 7 · `ciclo.webp` — Precios a diez años / estudio anual
```
Layered horizontal bands of subtly different tone stacked like geological strata
or annual growth rings, each band slightly thicker than the one below. Sage green
through pale green. Calm, cumulative.
+ coletilla común
```

### 8 · `juridico.webp` — Seguridad jurídica
```
Abstract close-up of heavy laid paper with a faint embossed seal impression and
a single deep fold, catching soft raking light. Ink grey on cool pale grey.
Sober, institutional, tactile.
+ coletilla común
```

### 9 · `proceso.webp` — Cómo vender una casa
```
A sequence of soft rounded steps or waypoints receding across a pale ground, each
one slightly fainter than the last, suggesting a path with stages. Warm sand tones.
Diagrammatic but organic.
+ coletilla común
```

### 10 · `zonas.webp` — De Adeje al Norte / zonas
```
Volcanic coastline seen from very high altitude and heavily abstracted: bands of
dark basalt, dry ochre slope and pale water, blurred into soft colour fields with
no recognisable landmark. Sage, sand and ink.
+ coletilla común
```

---

## Si alguna no encaja

El fondo que hay ahora lo genera `tools/build-figuras.js` (curvas de nivel en SVG,
~7 KB cada una, deterministas). Si una imagen generada no funciona, borra el `.webp`
y vuelve a verse el SVG automáticamente.

Para cambiar qué tema le toca a cada entrada: campo `bg` en `blog-data.js`.
**No** en `insights.html` — ese listado se repinta en el navegador y el atributo
escrito a mano se pierde al cargar.
