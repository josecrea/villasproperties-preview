#!/usr/bin/env node
/* imagenes-blog.js — Una imagen propia por artículo, en lugar de la misma para todos.
 *
 * POR QUÉ
 * -------
 * Los trece artículos compartían dos imágenes: nueve usaban `tenerife-mercado.webp`
 * y cuatro `venta-notaria.webp`. Eso es lo que se ve **al compartir un enlace**
 * en WhatsApp, en LinkedIn o en cualquier sitio que lea `og:image`, así que
 * media docena de artículos distintos llegaban al destinatario con la misma
 * foto. Y es también lo que muestra una IA cuando cita la página.
 *
 * Las tarjetas del blog no lo notaban porque se ilustran con figuras dibujadas
 * en CSS, no con fotos: por eso el problema estaba escondido.
 *
 * CÓMO
 * ----
 * Este fichero es el REGISTRO de qué imagen lleva cada artículo. Las imágenes se
 * generan aparte —con Nano Banana en Higgsfield— y se guardan en `assets/blog/`
 * a 1200x630, que es la medida que esperan las redes. Aquí solo se asigna.
 *
 * Un artículo sin imagen propia se queda con la genérica y se avisa por pantalla:
 * mejor eso que asignarle en silencio la de otro.
 *
 * USO
 * ---
 *   node tools/imagenes-blog.js            # informa de qué falta
 *   node tools/imagenes-blog.js --aplicar
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const CARPETA = 'assets/blog';
const APLICAR = process.argv.includes('--aplicar');

const DOMINIO = (() => {
  try {
    const m = fs.readFileSync(path.join(RAIZ, 'sitemap.xml'), 'utf8').match(/<loc>(https?:\/\/[^/<]+)/);
    if (m) return m[1];
  } catch { /* sin sitemap */ }
  return 'https://villasproperties.es';
})();

/* Artículo → imagen. El comentario dice qué se ve, para que dentro de un año se
   pueda decidir si sigue encajando sin abrir el fichero. */
const REGISTRO = {
  'post-mapa-metro-cuadrado.html': ['mapa-metro-cuadrado', 'aérea de la costa: cala turquesa y mosaico de tejados'],
  'post-por-que-tu-casa-no-se-vende-en-tenerife-8.html': ['casa-no-se-vende', 'villa blanca cerrada, jardín seco, luz plana'],
  'post-cuanto-vale-realmente-mi-villa-en-tenerife-la-clave-esta-en-la-precision-no-en-la-prisa-2.html': ['valor-villa', 'villa con piscina infinita al atardecer'],
  'post-suelo-urbano-canarias-125000-viviendas.html': ['suelo-urbano', 'estructura de hormigón a medio construir con la grúa parada'],
};

let puestas = 0; const sinImagen = [];

for (const f of fs.readdirSync(RAIZ).filter((x) => /^post-.*\.html$/.test(x))) {
  const entrada = REGISTRO[f];
  if (!entrada) { sinImagen.push(f); continue; }

  const [nombre, descripcion] = entrada;
  const rel = `${CARPETA}/${nombre}.webp`;
  if (!fs.existsSync(path.join(RAIZ, rel))) {
    console.log(`  ✘ ${f.slice(0, 44)}: falta ${rel}`);
    continue;
  }

  const url = `${DOMINIO}/${rel}`;
  console.log(`  ✔ ${f.slice(0, 46).padEnd(48)} ${nombre} — ${descripcion}`);
  puestas += 1;

  if (!APLICAR) continue;

  let html = fs.readFileSync(path.join(RAIZ, f), 'utf8');
  /* og:image y twitter:image son dos etiquetas distintas y hay clientes que
     solo leen una: se cambian las dos o el enlace sale bien en unos sitios y
     mal en otros. */
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${url}$2`);
  /* Y en el JSON-LD del artículo, que es de donde lo toma Google Discover y
     buena parte de las respuestas de IA. */
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (todo, cuerpo) => {
    let d; try { d = JSON.parse(cuerpo); } catch { return todo; }
    const nodos = d['@graph'] || (Array.isArray(d) ? d : [d]);
    let tocado = false;
    for (const n of nodos) {
      if (n['@type'] !== 'Article') continue;
      n.image = [url];
      tocado = true;
    }
    if (!tocado) return todo;
    const salida = d['@graph'] ? { ...d, '@graph': nodos } : { '@context': 'https://schema.org', '@graph': nodos };
    return `<script type="application/ld+json">${JSON.stringify(salida)}</script>`;
  });
  fs.writeFileSync(path.join(RAIZ, f), html, 'utf8');
}

console.log(`\n  ${puestas} artículos con imagen propia`);
if (sinImagen.length) {
  console.log(`  ⚠ ${sinImagen.length} siguen con la genérica —se comparten todos con la misma foto—:`);
  sinImagen.forEach((f) => console.log(`     ${f}`));
  console.log('  Genera la imagen, guárdala en assets/blog/ y añádela al REGISTRO de arriba.');
}
if (!APLICAR) console.log('\n  Para aplicarlo:  node tools/imagenes-blog.js --aplicar');
