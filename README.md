# Villa’s Properties — Web V2 Preview

Public static preview for review purposes only.

- Source-of-truth development repository remains private.
- This repository contains only the static preview build.
- `noindex,nofollow` is enabled.
- Back Office access is protected by a client-side preview gate only.
- Sitio estático sin dependencias de servidor: el catálogo se edita en el Back Office y se publica al repositorio.

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

### Publicar sin descargar nada

En la pestaña **Publicar** hay además publicación directa a GitHub: sube el
catálogo y las fotos en **un solo commit** (Git Data API: blobs → árbol →
commit → rama). Compara el SHA de Git de cada foto con la que ya está en el
repositorio, así solo viaja lo que ha cambiado.

Hace falta un **token de acceso personal de grano fino**:

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained
2. Repository access: **Only select repositories** → `villasproperties-preview`
3. Permissions → Repository permissions → **Contents: Read and write**
4. Pegarlo en el Back Office. No se guarda en el repositorio ni en localStorage:
   vive en memoria y, si se marca la casilla, en `sessionStorage` (se borra al
   cerrar la pestaña).

El campo **Rama** permite publicar a una rama de revisión antes de tocar `main`.

Si se han quitado fotos de un inmueble, el publicador pide confirmación con la
lista concreta antes de borrar nada, y **solo** dentro de `assets/img/<slug>/`:
el resto de `assets/img/` (la escena de zonas de la home) no se toca nunca.

### Dónde va cada cosa

| | Dónde | Por qué |
|---|---|---|
| Fotos | En el repositorio | 92 KB de media; 30 inmuebles × 15 fotos = 41 MB, un 4% del límite de 1 GB de Pages |
| Vídeo | Vimeo o YouTube (solo la URL en el catálogo) | Un vídeo de 30 MB agota los 100 GB/mes de Pages en 3.400 reproducciones |
| Planos y tour | URL o fichero en el repositorio | Pesan como una foto |

Límites oficiales de GitHub Pages: repositorio recomendado 1 GB, sitio publicado
máximo 1 GB, 100 GB/mes de ancho de banda y 10 builds/hora (los dos últimos,
límites blandos).

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
