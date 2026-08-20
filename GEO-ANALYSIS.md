# Análisis GEO — antes de pasar a villasproperties.es

> 20-08-2026. Todo lo que aquí se afirma está **medido** contra la web real
> (31 páginas HTML, 9 formularios, la URL en vivo). Donde no se ha podido
> medir, se dice.
>
> Complementa a [LANZAMIENTO.md](LANZAMIENTO.md), que cubre la migración, la
> seguridad y la compatibilidad.

## Puntuación GEO: 57/100

| Criterio | Peso | Nota | Por qué |
|---|---|---|---|
| Citabilidad | 25% | 55 | cifras con fuente, pero casi no hay bloques largos que citar |
| Legibilidad estructural | 20% | 70 | jerarquía correcta, 41 preguntas en FAQ, casi ninguna tabla |
| Multi-modal | 15% | 55 | vídeo propio sí, imágenes muy desiguales |
| Autoridad y marca | 20% | 45 | dato de primera mano fuerte, entidad inexistente |
| Accesibilidad técnica | 20% | 60 | HTML estático salvo dos páginas clave |

---

## 0. El marco: Google dice que GEO **es** SEO

La [guía oficial de optimización para IA de Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
es explícita, y conviene tenerla delante porque contradice medio sector:

> No hay un "índice de IA" aparte. Una página aparece en AI Overviews o AI Mode
> **solo si está indexada y es elegible para mostrarse con snippet en Search**.

Y Google dice explícitamente que **NO hace falta**: crear `llms.txt`, trocear el
contenido en bloques, reescribir con frases pensadas para IA, perseguir
menciones en foros, ni sobreinvertir en datos estructurados para IA.

Lo que sí importa, según ellos: **contenido único, de primera mano y no
genérico**. Su propio ejemplo contrapone "7 consejos para comprar tu primera
casa" (genérico) con "Por qué renunciamos a la inspección y nos salió bien"
(vivido).

**Esto es una buena noticia para Villa's**, y conviene decirlo antes que los
problemas: el activo diferencial —el €/m² **real de escritura** del Notariado
contrastado con el precio de anuncio de idealista, por municipio y microzona—
es exactamente lo que Google describe como no-genérico. Ninguna inmobiliaria
del sur publica eso. El problema no es qué se cuenta, es que buena parte no se
puede leer o no se puede atribuir.

---

## 1. 🔴 CRÍTICO — el catálogo de inmuebles es invisible para las IA

**Los crawlers de IA no ejecutan JavaScript.** Medido comparando el HTML que
llega por la red con el DOM ya renderizado:

| Página | HTML crudo | Renderizado | Lo pinta JS |
|---|---|---|---|
| **properties.html** | 198 palabras | 560 | **65%** 🔴 |
| **insights.html** | 206 palabras | 604 | **66%** 🔴 |
| buy.html | 515 | 840 | 39% |
| finance.html | 174 | 284 | 39% |
| intelligence.html | 206 | 293 | 30% |
| invest.html | 499 | 705 | 29% |
| index.html | 1.132 | 1.121 | 0% ✔ |
| sell.html | 661 | 874 | 24% ✔ |

En `properties.html` el `<div id="catalogueGrid">` llega **vacío**. Los
inmuebles se inyectan después con JavaScript. Consecuencia:

- **ChatGPT, Claude y Perplexity no ven ni un solo inmueble.** Para ellos,
  Villa's es una inmobiliaria sin inventario.
- **Googlebot sí renderiza** JS, así que AI Overviews sí lo verá — pero con
  retraso y sin garantías.
- No existe **ninguna ficha de inmueble como página propia**: `property-brief`
  y `property-compare` son herramientas, no fichas. Un inmueble concreto no
  tiene URL, así que no se puede indexar, enlazar ni citar.
- Por eso no aparece **ni un solo `RealEstateListing`** en el schema de las 31
  páginas, aunque el sitio declare que lo tiene.

**Qué hacer.** Por orden de retorno:

1. Generar una **página por inmueble** (`property-<slug>.html`) con su
   `RealEstateListing`, igual que `tools/nuevo-post.js` hace con los artículos.
   Es lo que convierte el inventario en algo indexable y citable.
2. Mientras tanto, **volcar en el HTML** de `properties.html` e
   `insights.html` la lista que hoy pinta el JS. Es contenido que ya existe en
   `blog-data.js` y en los datos de propiedades: solo hay que escribirlo también
   en el HTML durante el build.

> **Cómo sabremos si esto falló:** si a las 4 semanas de publicar,
> `site:villasproperties.es` no devuelve ninguna ficha de inmueble, o si
> preguntar a ChatGPT "¿qué inmuebles tiene Villa's Properties en Adeje?" no
> devuelve ninguno.

---

## 2. 🔴 CRÍTICO — el suelo de elegibilidad: el móvil no llega

Sin indexación no hay IA, y sin rendimiento la indexación sufre. Medido contra
la URL en vivo (Chrome real, 4G a 1,6 Mbps con CPU x4):

| | escritorio | móvil 4G |
|---|---|---|
| **LCP** | 1.692 ms ✔ | **6.912 ms** 🔴 |
| **FCP** | 1.692 ms ✔ | **6.852 ms** 🔴 |
| CLS | 0 ✔ | 0 ✔ |
| TBT | 0 ms ✔ | 0 ms ✔ |
| TTFB | 151 ms ✔ | 244 ms ✔ |
| peso | 3,54 MB en 32 peticiones | — |

El objetivo de LCP es 2.500 ms: en móvil se tarda **2,8 veces más**. TBT y CLS
están perfectos, así que no es culpa del JavaScript ni de saltos de maquetación
— es **peso de descarga**, y el sospechoso es el vídeo del hero (1,68 MB) más el
póster.

**Qué hacer:** en móvil, no cargar el vídeo hasta que el póster haya pintado, o
directamente dejar solo el póster por debajo de cierto ancho. El póster pesa
80 KB y la portada dejaría de depender de 1,7 MB para su LCP.

> **Cómo sabremos si falló:** volver a medir con la misma emulación y ver si el
> LCP móvil baja de 2.500 ms. Indicador a vigilar sin repetir la auditoría:
> Search Console → Core Web Vitals móvil.

---

## 3. 🟡 ALTO — no hay entidad: nadie firma

Las menciones de marca **correlacionan tres veces más con la citación por IA
que los backlinks** (Ahrefs, 75.000 marcas). Y una entidad se construye con
autoría, no con enlaces.

Medido sobre las 31 páginas:

| Señal | Estado |
|---|---|
| `Person` schema (autoría) | **0 páginas** 🔴 |
| `sameAs` (identidad entre plataformas) | 1 página |
| `datePublished` / `dateModified` | 4 páginas (solo los artículos) |
| `RealEstateAgent` | 25 páginas ✔ |
| `BreadcrumbList` | 29 ✔ |
| `FAQPage` | 7 páginas, 41 preguntas ✔ |
| Errores de sintaxis JSON-LD | **0** ✔ |

**Valeria Villa existe en la web** (tiene biografía: Cernobbio, Antropología en
Milán, Century 21) **pero no existe como entidad**: ningún `Person`, ningún
`sameAs` a LinkedIn, ningún `author` en los artículos. Para un modelo, los
análisis de mercado de Villa's no los firma nadie.

**Qué hacer:**
1. `Person` con `sameAs` a LinkedIn y a cualquier perfil público, enlazado desde
   `RealEstateAgent` con `employee` / `founder`.
2. `author` en los 4 artículos apuntando a esa Person.
3. `dateModified` en las páginas de datos de mercado — se actualizan
   mensualmente y hoy no lo dicen.

---

## 4. 🟡 ALTO — las 6 landings municipales se parecen demasiado

Son la apuesta SEO local y están bien construidas —580-630 palabras, FAQ de 6
preguntas cada una, entre 17 y 35 cifras propias— pero:

**Comparten el 80% del vocabulario de media. El peor par, Granadilla ↔ San
Miguel de Abona, comparte el 86%.**

Lo único que cambia de verdad son los números. Google no penaliza esto por sí
solo con seis páginas (el umbral de alarma está en 30), pero sí decide que no
merece la pena mostrar más de una, y un modelo no tiene motivo para citar la de
Guía de Isora en vez de la de Arona.

**Qué hacer:** un párrafo genuinamente local por landing — qué tipo de comprador
va a ese municipio, qué se vende y qué no, cuánto tarda. Eso es exactamente el
"contenido de primera mano" que Google pide, y Villa's lo tiene: está en la
cabeza de quien vende allí, no en ningún portal.

---

## 5. 🟢 MEDIO — poco que citar, pero cuidado con la receta

Medido sobre 10 páginas: **130 encabezados, 18 con forma de pregunta (14%)** y
**2 bloques en el rango de 134-167 palabras que la literatura GEO considera
óptimo para citación**, de 125 secciones.

La media de palabras por párrafo es de 11 en la portada y 21-26 en las páginas
comerciales. Es una decisión de diseño editorial —y visualmente funciona— pero
para una IA significa que casi no hay pasaje autocontenido que extraer.

**Matiz importante, y es la razón de que esto sea MEDIO y no ALTO:** Google
rechaza explícitamente el "chunking" como técnica. Reescribir la web entera a
bloques de 150 palabras sería trabajar para una métrica, no para el lector.

Lo que sí tiene sentido, y es donde están los únicos dos bloques que ya
puntúan: **los artículos** (36-40 palabras por párrafo). Ahí es donde conviene
escribir, no en las páginas comerciales.

**Encabezados en forma de pregunta:** subir del 14% sí es barato y honesto —
"¿Cuánto vale mi casa en Adeje?" es cómo la gente pregunta de verdad.

---

## 6. 🟢 MEDIO — multi-modal desigual

El contenido con elementos multi-modales se selecciona un 156% más.

| Página | img | vídeo | tabla | listas |
|---|---|---|---|---|
| index.html | 4 | 2 | 0 | 14 |
| finance.html | 18 | 0 | 0 | 4 |
| sell.html | 0 | 1 | 0 | 17 |
| **buy.html** | **0** | 0 | 0 | 9 |
| **valuation.html** | **0** | 0 | 0 | 7 |
| vender-casa-adeje.html | 0 | 0 | 1 | 2 |

**Casi no hay tablas en toda la web**, y los datos de mercado por municipio y
microzona son justo lo que se representa en tabla y lo que una IA extrae mejor.
Es la mejora con mejor relación esfuerzo/resultado de esta lista.

---

## 7. ✅ RESUELTO HOY — WebMCP en los formularios

El informe de PageSpeed avisaba de esto y era real: Lighthouse 13.3 incorporó
la categoría **Agentic Browsing**, con tres auditorías WebMCP de las que solo
`webmcp-schema-validity` puede fallar — y falla cuando hay campos sin `name`.

**8 de los 9 formularios tenían campos sin `name`: 59 en total**, incluidos los
18 del valorador. Un campo sin `name` no lo puede rellenar ni un agente de IA
ni el autocompletado del propio navegador.

Corregido:
- **59 campos** con `name` añadido (tomado del `id`, que ya era único).
- **5 formularios anotados** con `toolname` y `tooldescription`:
  `valorar_vivienda`, `contactar_agente_inmobiliario`,
  `calcular_precio_realista_de_compra`, `crear_brief_de_busqueda`,
  `calcular_capacidad_de_compra`.

Se dejaron sin anotar los laboratorios internos (`decision-lab`,
`market-impact`, `property-compare`): no son puertas de entrada.

Verificado que no rompe nada: el grupo de radios `vType` sigue agrupado, el
desplegable de zonas devuelve las mismas 13 zonas de Adeje que la versión en
vivo, y las 7 páginas con formulario cargan sin un solo error de JavaScript.

> **Perspectiva honesta:** WebMCP está detrás de un flag en Chrome y casi ningún
> agente lo usa todavía. Lo que sí vale desde hoy es el `name` en los campos —
> eso es autocompletado y accesibilidad, no una apuesta de futuro.

---

## 8. Dos falsos positivos del informe de PageSpeed

**"noindex,nofollow bloquea la indexación".** Es intencional: esto es un
preview. Están las 31 páginas. El interruptor los quita todos:

```bash
node tools/abrir-indexacion.cjs --dominio=https://villasproperties.es --aplicar
```

Simulado hoy: **31 noindex fuera, 288 URLs de dominio reescritas, robots.txt
reescrito a Allow + Sitemap, 65 ficheros afectados.** Cubre todo.

**"llms.txt debe ser Markdown con al menos un H1".** Lo es: responde 200 y su
primera línea es `# Villa's Properties`. El aviso salta porque GitHub Pages lo
sirve como `text/plain` y no como `text/markdown`, y desde Pages no se puede
cambiar la cabecera. En el VPS con Traefik sí.

> Y conviene recordar que Google dice que `llms.txt` **no es** una palanca de
> citación. El de Villa's está bien hecho —cifras con fuente, criterio
> editorial, nota metodológica— pero no hay que esperar nada de él por sí solo.

---

## 9. Orden recomendado

**Antes de tocar el dominio**
1. Volcar en HTML el catálogo de `properties.html` y el índice de `insights.html`
2. Bajar el LCP móvil: no cargar el vídeo del hero hasta después del póster
3. `Person` + `sameAs` de Valeria Villa, y `author` en los 4 artículos

**Primeras semanas**
4. Una página por inmueble con `RealEstateListing`
5. Un párrafo genuinamente local en cada una de las 6 landings
6. Tablas para los datos de mercado por municipio
7. Encabezados en forma de pregunta donde encaje

**Medición, que hoy no existe**
8. Preguntar a ChatGPT, Perplexity y Google AI Overviews por "vender casa en
   Tenerife Sur", "cuánto vale mi casa en Adeje" y "precio real de escritura
   Tenerife" **al mes de publicar**, y anotar si aparece Villa's. Sin esa
   medición, todo lo anterior es fe.
