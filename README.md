# Villa’s Properties — Web V2 Preview

Public static preview for review purposes only.

- Source-of-truth development repository remains private.
- This repository contains only the static preview build.
- `noindex,nofollow` is enabled.
- Back Office access is protected by a client-side preview gate only.
- Production authentication must be server-side/Odoo.

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
