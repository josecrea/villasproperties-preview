#!/usr/bin/env node
'use strict';

/**
 * build-nearby.cjs — Servicios REALES alrededor de cada inmueble.
 *
 * Consulta OpenStreetMap (Overpass) con las coordenadas de cada propiedad y
 * genera nearby-data.js con lo que hay de verdad a la redonda: supermercado,
 * farmacia, colegio, centro de salud, parada de guagua, playa, restaurantes…
 *
 * Por qué así y no a mano: escribir "cerca de todos los servicios" es lo que
 * hace cualquier portal y no dice nada. El ADN de Villa's es el dato
 * comprobable, así que aquí también: cada servicio sale con su distancia y su
 * nombre real, y quien quiera puede ir a mirarlo.
 *
 * OJO con la precisión: properties-data.js avisa de que `coords` es la ZONA, no
 * el portal exacto —en una ficha pública no se publica la puerta del vendedor—.
 * Las distancias son por tanto aproximadas y así se dicen en la ficha.
 *
 * Uso:  node tools/build-nearby.cjs [--radio=1200]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const RAIZ = path.join(__dirname, '..');
const RADIO = Number((process.argv.find(a => a.startsWith('--radio=')) || '').split('=')[1] || 1200);
/* Overpass es gratuito y se satura: en la primera pasada 3 de 5 consultas
   devolvieron 504. Se rota entre espejos y se reintenta con espera creciente. */
const ESPEJOS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];
const INTENTOS = 4;

/* Qué se busca y cómo se llama en castellano. El orden manda en la ficha:
   primero lo que de verdad decide una compra. */
const CATEGORIAS = [
  { id: 'supermercado', etiqueta: 'Supermercado', q: 'nwr["shop"~"^(supermarket|convenience)$"]' },
  { id: 'farmacia', etiqueta: 'Farmacia', q: 'nwr["amenity"="pharmacy"]' },
  { id: 'salud', etiqueta: 'Centro de salud', q: 'nwr["amenity"~"^(clinic|doctors|hospital)$"]' },
  { id: 'colegio', etiqueta: 'Colegio', q: 'nwr["amenity"~"^(school|kindergarten)$"]' },
  { id: 'guagua', etiqueta: 'Parada de guagua', q: 'nwr["highway"="bus_stop"]' },
  { id: 'playa', etiqueta: 'Playa', q: 'nwr["natural"="beach"]' },
  { id: 'restauracion', etiqueta: 'Bar o restaurante', q: 'nwr["amenity"~"^(restaurant|cafe|bar)$"]' },
  { id: 'banco', etiqueta: 'Banco o cajero', q: 'nwr["amenity"~"^(bank|atm)$"]' },
  { id: 'gasolinera', etiqueta: 'Gasolinera', q: 'nwr["amenity"="fuel"]' },
  { id: 'deporte', etiqueta: 'Instalación deportiva', q: 'nwr["leisure"~"^(sports_centre|fitness_centre|pitch)$"]' },
];

function metros(a, b) {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}

function pedir(url, cuerpo) {
  return new Promise((res, rej) => {
    const datos = `data=${encodeURIComponent(cuerpo)}`;
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(datos),
        'User-Agent': 'villasproperties-nearby/1.0',
      },
      timeout: 90000,
    }, (r) => {
      let d = '';
      r.on('data', (c) => { d += c; });
      r.on('end', () => {
        if (r.statusCode !== 200) return rej(new Error(`Overpass ${r.statusCode}`));
        try { res(JSON.parse(d)); } catch (e) { rej(e); }
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout Overpass')));
    req.on('error', rej);
    req.write(datos); req.end();
  });
}

async function consultar(cuerpo) {
  let ultimo;
  for (let i = 0; i < INTENTOS; i++) {
    const url = ESPEJOS[i % ESPEJOS.length];
    try {
      return await pedir(url, cuerpo);
    } catch (e) {
      ultimo = e;
      const espera = 3000 * (i + 1);
      process.stdout.write(`(${e.message}, reintento en ${espera / 1000}s) `);
      await new Promise((r) => setTimeout(r, espera));
    }
  }
  throw ultimo;
}

async function serviciosDe(coords) {
  const [lat, lon] = coords;
  const bloques = CATEGORIAS
    .map((c) => `${c.q}(around:${RADIO},${lat},${lon})->.${c.id};.${c.id} out center tags;`)
    .join('\n');
  const q = `[out:json][timeout:60];\n${bloques}`;
  const r = await consultar(q);

  // Overpass devuelve todo junto; se reparte por categoría según sus etiquetas.
  const porCat = {};
  for (const el of r.elements || []) {
    const t = el.tags || {};
    const punto = [el.lat ?? el.center?.lat, el.lon ?? el.center?.lon];
    if (punto[0] == null) continue;

    let cat = null;
    if (/^(supermarket|convenience)$/.test(t.shop || '')) cat = 'supermercado';
    else if (t.amenity === 'pharmacy') cat = 'farmacia';
    else if (/^(clinic|doctors|hospital)$/.test(t.amenity || '')) cat = 'salud';
    else if (/^(school|kindergarten)$/.test(t.amenity || '')) cat = 'colegio';
    else if (t.highway === 'bus_stop') cat = 'guagua';
    else if (t.natural === 'beach') cat = 'playa';
    else if (/^(restaurant|cafe|bar)$/.test(t.amenity || '')) cat = 'restauracion';
    else if (/^(bank|atm)$/.test(t.amenity || '')) cat = 'banco';
    else if (t.amenity === 'fuel') cat = 'gasolinera';
    else if (/^(sports_centre|fitness_centre|pitch)$/.test(t.leisure || '')) cat = 'deporte';
    if (!cat) continue;

    (porCat[cat] = porCat[cat] || []).push({
      nombre: t.name || null,
      d: metros(coords, punto),
    });
  }

  // De cada categoría: cuántas hay y la más cercana con nombre.
  return CATEGORIAS.map((c) => {
    const lista = (porCat[c.id] || []).sort((a, b) => a.d - b.d);
    if (!lista.length) return null;
    const conNombre = lista.find((x) => x.nombre) || lista[0];
    return {
      id: c.id,
      etiqueta: c.etiqueta,
      total: lista.length,
      distancia: lista[0].d,
      nombre: conNombre.nombre,
      nombreDistancia: conNombre.d,
    };
  }).filter(Boolean);
}

(async () => {
  global.window = {};
  require(path.join(RAIZ, 'properties-data.js'));
  const props = global.window.VP_PROPERTIES || [];
  console.log(`${props.length} inmuebles · radio ${RADIO} m\n`);

  const salida = {};
  for (const p of props) {
    process.stdout.write(`  ${p.ref} ${p.town}… `);
    try {
      const s = await serviciosDe(p.coords);
      salida[p.ref] = { radio: RADIO, servicios: s };
      console.log(`${s.length} categorías`);
    } catch (e) {
      console.log(`✘ ${e.message}`);
      salida[p.ref] = { radio: RADIO, servicios: [], error: e.message };
    }
    await new Promise((r) => setTimeout(r, 2500));   // Overpass es gratis: no castigarlo
  }

  const cabecera = `/* nearby-data.js — GENERADO por tools/build-nearby.cjs. No editar a mano.
   Servicios reales de OpenStreetMap alrededor de cada inmueble (radio ${RADIO} m).
   Fecha: ${new Date().toISOString().slice(0, 10)}
   Las coordenadas son de ZONA, no del portal exacto: las distancias son
   aproximadas y así se indican en la ficha.
   Datos © colaboradores de OpenStreetMap (ODbL). */\n`;
  fs.writeFileSync(path.join(RAIZ, 'nearby-data.js'),
    `${cabecera}window.VP_NEARBY = ${JSON.stringify(salida, null, 1)};\n`, 'utf8');
  console.log('\nnearby-data.js escrito');
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
