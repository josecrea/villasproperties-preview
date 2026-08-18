# Villa’s Properties — Web V2 Preview

Public static preview for review purposes only.

- Source-of-truth development repository remains private.
- This repository contains only the static preview build.
- `noindex,nofollow` is enabled.
- Back Office access is protected by a client-side preview gate only.
- Production authentication must be server-side/Odoo.

## Indexación: BLOQUEADA a propósito

Todas las páginas van con `noindex,nofollow` y `robots.txt` con `Disallow: /`,
incluidos los crawlers de IA. **Se queda así hasta que la web esté acabada**:
indexar el preview lo pondría a competir con villasproperties.es por el mismo
contenido.

La capa SEO/GEO ya está construida y lista (canonical, Open Graph, Twitter Card,
JSON-LD, sitemap.xml, llms.txt, manifest). Para abrirla, cuando se decida:

```bash
node tools/build-seo.js --index --si-publicar   # requiere las dos banderas
```

Antes de abrirla hay que decidir a qué dominio apunta el canonical (`BASE` en
`tools/build-seo.js`) y sustituir las fotos de los inmuebles por los originales
sin la marca de agua de idealista.

## Back Office: el catálogo lo mantiene el equipo

El editor vive en `⚙ Back Office` (tras el gate) y está en todas las páginas. Se
carga bajo demanda: un visitante normal no descarga ni el editor ni el catálogo.

- **Fotos** — arrastrar o elegir archivos. Se reescalan a 1600 px y se convierten
  a webp en el propio navegador. Se reordenan con las flechas; la primera es la
  portada. Se guardan en IndexedDB (`vp-store.js`).
- **Datos** — precio, superficies, dormitorios, baños, zona, estado comercial,
  año, planta, comunidad… El €/m² se recalcula solo al cambiar precio o metros.
- **Textos** — titular, descripción por párrafos, características y equipamiento.
- **Publicar** — descarga `properties-data.js` (con las rutas ya apuntando a
  `assets/img/<slug>/NN.webp`) y un ZIP con **todas** las fotos, nuevas y viejas,
  en su carpeta. Se descomprime en `assets/img/`, se sustituye el
  `properties-data.js` y se hace commit.

Lo editado vive en el navegador donde se editó hasta que se exporta y se sube:
el sitio es estático y no hay servidor donde guardarlo. Publicar directamente
desde el navegador exigiría un token de escritura del repositorio, y con el gate
actual (comparación de hash en cliente) eso no es seguro.

## Datos de mercado

`market-data.js` está **generado**, no se edita a mano. Se regenera desde la fuente
única de la verdad de precios (repo privado `villasproperties-precios`):

```bash
node tools/build-market-data.js            # usa ~/villasproperties-precios/precios-tenerife-sur.json
node tools/build-market-data.js <ruta.json> # o una ruta explícita
```

Lo consumen el valorador (`valuation.html` + `valuation.js`) y los artículos con datos.
Cuando el scraper mensual actualice los precios, hay que volver a ejecutarlo y revisar
las cifras citadas en los `post-*.html`.

## Blog / News

- `blog-data.js` — índice único de artículos (metadatos). Añadir un post = añadir una entrada.
- `blog.js` — render del listado con filtros, del destacado y del bloque "seguir leyendo".
- `insights.html` — portada editorial. `post-*.html` — artículos.

GitHub Pages source: **main / (root)**

Preview URL:

`https://josecrea.github.io/villasproperties-preview/`
