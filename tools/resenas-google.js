#!/usr/bin/env node
/* resenas-google.js — Traer las reseñas REALES de la ficha de Google.
 *
 * POR QUÉ
 * -------
 * La portada mostraba tres testimonios firmados como "Reseña de cliente ·
 * Google", sin nombre y sin fecha. No eran reseñas: eran textos escritos para
 * rellenar. En una sección titulada "Google Reviews" eso no se sostiene, y
 * además desperdicia lo que hay de verdad: **11 reseñas, todas de 5 estrellas**,
 * y casi todas nombrando a Valeria.
 *
 * Este script lee la ficha real y guarda lo que devuelve en `reviews-data.js`,
 * con nombre, fecha, puntuación y texto. Si algún día cambia una reseña o entra
 * una nueva, se vuelve a ejecutar.
 *
 * LÍMITE QUE CONVIENE SABER
 * -------------------------
 * La API de Google devuelve **cinco** reseñas, no las once. No hay forma
 * legítima de sacar el resto por API: para verlas todas hay que ir a la ficha,
 * y por eso la sección lleva un enlace directo.
 *
 * Los términos de Google exigen atribuir las reseñas a Google y no alterarlas.
 * El texto se guarda tal cual, sin corregir la ortografía ni recortar frases a
 * media idea.
 *
 * USO
 * ---
 *   node tools/resenas-google.js
 *   ./tools/sellar.sh
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const PLACE_ID = 'ChIJkcDczhOfagwRSv32btUqEDM';   // Villa's Properties, Las Chafiras
const RUTA_CLAVE = path.join(process.env.HOME, '.claude/credentials/google_maps_key.txt');

let clave;
try { clave = fs.readFileSync(RUTA_CLAVE, 'utf8').trim(); } catch {
  console.error(`  No se pudo leer la clave de Google Maps en ${RUTA_CLAVE}`);
  process.exit(1);
}

const url = 'https://maps.googleapis.com/maps/api/place/details/json'
  + `?place_id=${PLACE_ID}`
  + '&fields=name,rating,user_ratings_total,url,reviews'
  + '&reviews_sort=newest&language=es'
  + `&key=${clave}`;

let datos;
try {
  datos = JSON.parse(execFileSync('curl', ['-s', '--max-time', '60', url], { maxBuffer: 8e6 }).toString());
} catch (e) { console.error('  Error de red:', e.message); process.exit(1); }

if (datos.status !== 'OK') {
  console.error(`  Google respondió ${datos.status}: ${datos.error_message || 'sin detalle'}`);
  process.exit(1);
}

const r = datos.result;
const resenas = (r.reviews || [])
  .filter((x) => x.rating >= 4 && (x.text || '').trim().length > 30)
  .map((x) => ({
    autor: x.author_name,
    puntuacion: x.rating,
    fecha: new Date(x.time * 1000).toISOString().slice(0, 10),
    /* Se limpian los emojis de estrellas que algunos escriben al principio
       —"⭐⭐⭐⭐⭐ Quedamos muy satisfechos"— porque la puntuación ya se pinta
       aparte y verlo dos veces queda raro. El texto no se toca más. */
    texto: (x.text || '').replace(/^[\s⭐★*]+/, '').replace(/\s+/g, ' ').trim(),
  }));

const salida = `/* Reseñas reales de la ficha de Google de Villa's Properties.
   GENERADO por tools/resenas-google.js — no editar a mano.

   Google devuelve cinco de las ${r.user_ratings_total}; para verlas todas hay que ir a la ficha,
   y de ahí el enlace de la sección. Los textos van tal cual: los términos de
   Google no permiten alterarlos. */
window.VP_RESENAS = {
  /* Con un decimal siempre: Google devuelve 5 y "5" a secas parece un número
     redondeado a ojo, mientras que "5,0" se lee como la nota que es. */
  puntuacion: ${Number(r.rating).toFixed(1)},
  total: ${r.user_ratings_total},
  ficha: ${JSON.stringify(r.url)},
  actualizado: ${JSON.stringify(new Date().toISOString().slice(0, 10))},
  resenas: ${JSON.stringify(resenas, null, 2)},
};
`;

fs.writeFileSync(path.join(RAIZ, 'reviews-data.js'), salida, 'utf8');

/* ---- El schema de la portada ----
   Sin aggregateRating, ni Google ni un modelo saben que la ficha tiene 5,0 de
   11 reseñas: el dato solo existe como texto.

   Aviso honesto: desde 2019 Google no pinta estrellas en los resultados a
   partir de reseñas que un negocio publica sobre sí mismo, así que esto NO va
   a sacar estrellitas en la búsqueda. Sirve para lo otro — que el dato sea
   legible por máquina, que es de donde lo toman las respuestas de IA. */
const rutaIndex = path.join(RAIZ, 'index.html');
let index = fs.readFileSync(rutaIndex, 'utf8');
index = index.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (todo, cuerpo) => {
  let d; try { d = JSON.parse(cuerpo); } catch { return todo; }
  const nodos = d['@graph'] || [d];
  const org = nodos.find((n) => n['@type'] === 'RealEstateAgent');
  if (!org) return todo;
  org.aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: Number(r.rating).toFixed(1),
    reviewCount: r.user_ratings_total,
    bestRating: 5,
    worstRating: 1,
  };
  /* Las reseñas una a una, con su autor y su fecha. Se declara Google como
     publisher: son suyas, no de la web. */
  org.review = resenas.map((x) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: x.autor },
    datePublished: x.fecha,
    reviewBody: x.texto,
    reviewRating: { '@type': 'Rating', ratingValue: x.puntuacion, bestRating: 5, worstRating: 1 },
    publisher: { '@type': 'Organization', name: 'Google' },
  }));
  const salidaLd = d['@graph'] ? { ...d, '@graph': nodos } : { '@context': 'https://schema.org', '@graph': nodos };
  return `<script type="application/ld+json">${JSON.stringify(salidaLd)}</script>`;
});
fs.writeFileSync(rutaIndex, index, 'utf8');

console.log(`  ✔ ${r.name} · ${r.rating}★ · ${r.user_ratings_total} reseñas`);
console.log('  ✔ aggregateRating y las reseñas en el schema de la portada');
console.log(`  ✔ ${resenas.length} guardadas en reviews-data.js`);
resenas.forEach((x) => console.log(`     ★${x.puntuacion} ${x.autor.slice(0, 22).padEnd(24)} ${x.fecha}`));
console.log('\n  Ahora:  ./tools/sellar.sh');
