#!/usr/bin/env node
/* importar-idealista.js — Traer los anuncios NUEVOS de Villa's en idealista.
 *
 * POR QUÉ NO ES UN BOTÓN DE LA WEB
 * --------------------------------
 * idealista bloquea el scraping directo (DataDome) y un navegador no puede leer
 * idealista.com desde villasproperties.es (CORS). Por eso el catálogo se hizo,
 * y se sigue haciendo, con **Firecrawl**: un servicio con proxies propios que sí
 * atraviesa el bloqueo. Su clave de API no puede vivir en el código de una web
 * pública, así que esto corre desde el ordenador, no desde el back office.
 *
 * QUÉ HACE
 * --------
 *   1. Lee la página pro de Villa's y saca las referencias publicadas.
 *   2. Las compara con properties-data.js y se queda con las que faltan.
 *   3. Descarga cada ficha nueva y extrae lo que se puede leer del anuncio:
 *      título, precio, m², dormitorios, baños, zona, descripción.
 *   4. Añade la ficha al catálogo — SIN fotos: las de idealista llevan marca de
 *      agua, así que se suben aparte desde el back office.
 *
 * Lo que saca es un BORRADOR: hay que revisarlo antes de publicar, porque el
 * scraping acierta el 90% y se inventa el 10%. Ver [feedback_no_alucinar].
 *
 * USO
 * ---
 *   node tools/importar-idealista.js            # solo dice qué hay nuevo
 *   node tools/importar-idealista.js --aplicar  # lo añade al catálogo
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const PRO = 'https://www.idealista.com/pro/villas-properties/';
const APLICAR = process.argv.includes('--aplicar');

const firecrawl = (url) => {
  const salida = path.join('/tmp', `imp-${Date.now()}.md`);
  execFileSync('firecrawl', ['scrape', url, '--format', 'markdown', '-o', salida],
    { stdio: 'pipe', timeout: 120000 });
  const md = fs.readFileSync(salida, 'utf8');
  fs.unlinkSync(salida);
  return md;
};

/* ---- 1 y 2. Qué referencias hay y cuáles faltan ---- */
global.window = {};
require(path.join(RAIZ, 'properties-data.js'));
const catalogo = global.window.VP_PROPERTIES || [];
const yaEstan = new Set(catalogo.map((p) => p.ref));

console.log('  Leyendo la página de Villa’s en idealista…');
let listado;
try { listado = firecrawl(PRO); } catch (e) {
  console.error('  ✘ Firecrawl no respondió:', e.message.slice(0, 80));
  console.error('    Comprueba que está configurado:  firecrawl config');
  process.exit(1);
}
const refs = [...new Set((listado.match(/inmueble\/(\d{6,})/g) || []).map((x) => x.replace('inmueble/', '')))];
const nuevas = refs.filter((r) => !yaEstan.has(r));

console.log(`  En idealista: ${refs.length} · en el catálogo: ${yaEstan.size} · nuevas: ${nuevas.length}`);
if (!nuevas.length) { console.log('\n  ✔ El catálogo está al día. Nada que importar.'); process.exit(0); }

/* ---- 3. Extraer los datos legibles de cada ficha nueva ---- */
const num = (s) => (s ? Number(String(s).replace(/[^\d]/g, '')) : 0);

const parsear = (md, ref) => {
  const titulo = (md.match(/^#\s+(.+)$/m) || [, ''])[1].trim();
  const precio = num((md.match(/([\d.]+)\s*€/) || [])[1]);
  /* idealista lista los rasgos en líneas sueltas: "88 m²", "2 hab.", "1 baño". */
  const m2 = num((md.match(/([\d.]+)\s*m²/) || [])[1]);
  const beds = num((md.match(/(\d+)\s*(?:hab|dormitor)/i) || [])[1]);
  const baths = num((md.match(/(\d+)\s*baño/i) || [])[1]);
  /* La zona suele venir bajo el título: "San Isidro, Granadilla de Abona". */
  let zona = (md.match(/^#\s+.+\n+([^\n#!]+?,\s*[^\n#!]+)$/m) || [, ''])[1].trim();
  zona = zona.replace(/Ver mapa.*$/i, '').trim();   // idealista pega "Ver mapa" al final
  const town = zona.split(',').pop().trim();
  /* La descripción es el bloque largo de prosa; se coge el primer párrafo
     sustancioso, no los rótulos de la interfaz. */
  const desc = (md.split('\n').filter((l) => l.trim().length > 120)[0] || '').trim();
  return { titulo, precio, m2, beds, baths, zona, town, desc };
};

const nuevosItems = [];
for (const ref of nuevas) {
  console.log(`  Descargando el anuncio ${ref}…`);
  let d;
  try { d = parsear(firecrawl(`${PRO}inmueble/${ref}/`), ref); } catch (e) {
    console.log(`    ✘ ${ref}: ${e.message.slice(0, 50)} — se salta`);
    continue;
  }
  const slug = `idealista-${ref}`;
  nuevosItems.push({
    ref, slug,
    titleShort: d.titulo.slice(0, 60) || `Inmueble ${ref}`,
    title: d.titulo || 'Completar',
    town: d.town || '', zone: d.zona || '', address: '',
    type: /piso|apartament|ático/i.test(d.titulo) ? 'Apartamento' : 'Casa',
    status: 'En venta', strategy: 'Vivienda / segunda residencia',
    price: d.precio, pricePerM2: d.precio && d.m2 ? Math.round(d.precio / d.m2) : 0,
    built: d.m2, useful: 0, beds: d.beds, baths: d.baths,
    floor: '', lift: false, orientation: '', year: null,
    condition: '', community: 0, energy: 'Pendiente de etiqueta',
    features: [], equipment: [], highlight: '',
    description: d.desc ? [d.desc] : ['Completar la descripción.'],
    coords: [], images: [], video: null, floorplans: [], tour: null, documents: [],
    url: `${PRO}inmueble/${ref}/`,
  });
  console.log(`    ✔ ${d.titulo.slice(0, 42)} · ${d.precio.toLocaleString('es')} € · ${d.m2} m² · ${d.beds}h`);
}

if (!APLICAR) {
  console.log(`\n  ${nuevosItems.length} listas para importar. Para añadirlas:`);
  console.log('    node tools/importar-idealista.js --aplicar');
  console.log('  Luego revisa cada ficha en el back office y sube sus fotos antes de publicar.');
  process.exit(0);
}

/* ---- 4. Añadir al catálogo, delante ---- */
const src = fs.readFileSync(path.join(RAIZ, 'properties-data.js'), 'utf8');
const nuevoArray = [...nuevosItems, ...catalogo].map((p) => { const { photos, ...r } = p; return r; });
const salida = src.replace(
  /window\.VP_PROPERTIES\s*=\s*\[[\s\S]*?\];/,
  `window.VP_PROPERTIES = ${JSON.stringify(nuevoArray, null, 2)};`,
);
fs.writeFileSync(path.join(RAIZ, 'properties-data.js'), salida, 'utf8');
console.log(`\n  ✔ ${nuevosItems.length} inmuebles añadidos al catálogo (sin fotos).`);
console.log('  Ahora, ANTES de publicar:');
console.log('    1. Revisa cada ficha: el scraping acierta el 90%, comprueba precio y zona.');
console.log('    2. Sube las fotos desde el back office (las de idealista llevan marca de agua).');
console.log('    3. node tools/schema-inmuebles.js && node tools/prerender.js && ./tools/sellar.sh');
