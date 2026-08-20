# Prompts de las imágenes del blog

> Para generar en ChatGPT (GPT Image), Higgsfield o donde haya crédito.
> Las cuatro primeras ya están hechas; las nueve siguientes, no.

## Cómo usarlos

1. Pega el prompt tal cual. Están en inglés a propósito: todos estos modelos
   entienden mejor la descripción fotográfica en inglés y respetan más el "no
   people, no text".
2. Pide **formato apaisado 16:9**. En ChatGPT: *"formato apaisado"* o *"landscape"*.
3. Descarga el resultado y guárdalo en `assets/blog/` con el nombre que indica
   cada ficha, en `.png` o `.jpg` — da igual, yo lo convierto.
4. Avísame y lo instalo con `node tools/imagenes-blog.js --aplicar`, que
   actualiza `og:image`, `twitter:image` y el JSON-LD de golpe.

## El ADN común

Todos comparten esto, y por eso el blog se ve de una pieza:

- **Fotografía documental o editorial**, nunca ilustración ni render 3D
- **Sur de Tenerife / Canarias** explícito: roca volcánica, palmeras, casas
  blancas de cubierta plana, Atlántico
- **Luz natural** con la hora del día declarada
- **Paleta contenida**: blanco, ocre, basalto, verde seco, azul océano
- **Sin gente, sin texto, sin logotipos, sin carteles, sin marcas de agua**

Lo último importa más de lo que parece: sin decirlo, estos modelos meten
carteles de "Se vende" en español macarrónico y logotipos inventados.

> ⚠️ **Aviso por experiencia:** el filtro de seguridad de Nano Banana rechazó
> **tres veces seguidas** cualquier vista aérea de solares vacíos. Si pasa,
> baja el encuadre a nivel de suelo en vez de insistir.

---

## Ya hechas

| Artículo | Fichero | Qué se ve |
|---|---|---|
| El mapa del metro cuadrado | `mapa-metro-cuadrado.webp` | aérea de la costa, cala turquesa |
| Por qué tu casa no se vende | `casa-no-se-vende.webp` | villa cerrada, jardín seco |
| Cuánto vale mi villa | `valor-villa.webp` | piscina infinita al atardecer |
| Suelo urbano en Canarias | `suelo-urbano.webp` | estructura a medio hacer, grúa parada |

---

## Las nueve que faltan

### 1. `anuncio-vs-escritura` — Lo que pides y lo que se firma

> Editorial still life photograph on a dark wooden desk in a notary office in the Canary Islands: two stacked property documents side by side under a desk lamp, a fountain pen resting on one of them, a small brass scale slightly out of balance in the background, warm shallow depth of field. Late afternoon light through a shuttered window, calm and formal mood, muted palette of dark wood, cream paper and brass. Documentary photography, sharp on the foreground, no readable text, no people, no logos, no watermarks.

### 2. `como-valorar` — Cómo valorar tu vivienda sin engañarte

> Editorial photograph of a measuring tape and a folded floor plan lying on the pale tiled floor of an empty, sunlit Canarian apartment: white walls, a balcony door open to the Atlantic, volcanic hillside visible outside. Bright morning light casting a clean rectangle on the floor, quiet and precise mood, muted palette of white, pale tile and blue sea. Architectural documentary photography, no people, no readable text, no logos, no watermarks.

### 3. `vender-casa-1` — Cómo vender una casa

> Editorial photograph of the entrance of a white Canarian house seen from the garden path: open front door letting warm interior light spill onto volcanic gravel, terracotta pots with succulents, a low white wall and the ocean far below. Golden hour, welcoming and calm mood, muted palette of white, terracotta, basalt and warm light. Documentary architectural photography, no people, no text, no signage, no logos, no watermarks.

### 4. `vender-casa-2` — Cómo vender una casa, fase 2

> Editorial photograph of a bright empty living room in a Canarian house prepared for viewings: neutral furniture, sofa perfectly aligned, cushions in order, a vase with dry branches, floor-to-ceiling window opening to a terrace and the Atlantic. Clear midday light, orderly and slightly staged mood, muted palette of white, sand, pale wood and sea blue. Interior documentary photography, no people, no text, no logos, no watermarks.

### 5. `zonas-revalorizacion` — Zonas de Tenerife que más se revalorizan

> Aerial editorial photograph of the south Tenerife coastline at golden hour: several distinct residential areas visible at once along the shore, separated by dark volcanic ravines, terraced white buildings climbing the hillside, the Teide silhouette faint in the distance. Warm low sun, long shadows marking the ridges, muted palette of white, ochre, basalt and amber sky. Drone documentary photography, wide and detailed, no people, no text, no logos, no watermarks.

### 6. `donde-se-vende` — Dónde se vende de verdad en el sur

> Editorial photograph of a quiet residential street in a Canarian town at midday: white and pale terracotta houses with flat roofs, parked cars, a bougainvillea over a wall, the dry volcanic hillside closing the street at the far end. Hard midday light, ordinary everyday mood, muted palette of white, terracotta, magenta bougainvillea and dusty ochre. Documentary street photography, no people, no readable text, no logos, no watermarks.

### 7. `precio-vivienda-espana` — La vivienda en España sube un 45 %

> Editorial photograph of a dense hillside of white Canarian apartment buildings stacked in terraces, photographed from below with a long lens so the volumes compress and repeat upward, a strip of blue sky at the top. Clear hard light, graphic and slightly overwhelming composition, muted palette of white render, grey shadow and blue. Architectural documentary photography, sharp, no people, no text, no logos, no watermarks.

### 8. `estudio-mercado` — Estudio anual del mercado inmobiliario

> Editorial photograph of a wide balcony table in the Canary Islands at dawn: printed charts and a notebook weighted down by a stone against the breeze, a cup of coffee, the sleeping coastline and the Atlantic beyond the railing. Soft blue hour light turning warm, analytical and calm mood, muted palette of paper white, basalt, deep blue and a touch of amber. Documentary photography, shallow depth of field, no readable text, no people, no logos, no watermarks.

### 9. `seguridad-juridica` — Invertir en Tenerife: seguridad jurídica

> Editorial photograph of the stone facade of a historic public building in the Canary Islands: carved volcanic stone doorway, dark wooden double doors closed, a worn stone step, deep shadow under the lintel and bright sunlight on the wall. Late morning light, solid and reassuring mood, muted palette of dark basalt, cream stucco and aged wood. Architectural documentary photography, symmetrical composition, no people, no text, no signage, no logos, no watermarks.

---

## Una vez descargadas

```bash
# guardar en assets/blog/ con el nombre de la ficha, luego:
node tools/imagenes-blog.js --aplicar
./tools/sellar.sh
```

El registro de `tools/imagenes-blog.js` hay que ampliarlo con las nuevas
entradas: el fichero avisa por pantalla de cuáles siguen sin imagen propia.
