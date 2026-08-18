#!/usr/bin/env node
/* Genera market-data.js del preview desde la fuente única de la verdad de precios.
   Fuente: ~/villasproperties-precios/precios-tenerife-sur.json (repo privado, lo
   regenera el scraper mensual). Este script solo copia y aplana: no inventa datos.

   Uso:  node tools/build-market-data.js [ruta-al-json]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const SOURCE = process.argv[2] || path.join(os.homedir(), 'villasproperties-precios', 'precios-tenerife-sur.json');
const TARGET = path.join(__dirname, '..', 'market-data.js');

/* Municipios publicados en el valorador, en orden de aparición. */
const ORDER = ['adeje', 'arona', 'granadilla', 'san-miguel', 'guia-isora', 'santiago-teide'];
const KEEP = ['name', 'eurM2', 'var1a', 'piso', 'casa', 'fc', 'ra', 'notaria', 'catastro', 'catastroCV', 'zonas'];

const pick = (town) =>
  KEEP.reduce((acc, key) => (town[key] === undefined ? acc : { ...acc, [key]: town[key] }), {});

const main = () => {
  if (!fs.existsSync(SOURCE)) {
    console.error(`[market-data] No encuentro la fuente: ${SOURCE}`);
    console.error('[market-data] Clona el repo privado villasproperties-precios o pasa la ruta como argumento.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const missing = ORDER.filter((key) => !raw.municipios[key]);
  if (missing.length) {
    console.error(`[market-data] Faltan municipios en la fuente: ${missing.join(', ')}`);
    process.exit(1);
  }

  const municipios = ORDER.reduce((acc, key) => ({ ...acc, [key]: pick(raw.municipios[key]) }), {});
  const payload = {
    meta: {
      updated: raw.meta.updated,
      dates: raw.meta.dates,
      region: raw.meta.region,
    },
    municipios,
  };

  const body = `/* Villa's Properties — datos de mercado Tenerife Sur.
   GENERADO por tools/build-market-data.js desde la fuente única de la verdad
   (villasproperties-precios/precios-tenerife-sur.json). NO editar a mano.

   eurM2 / var1a / zonas .... idealista, precio medio de OFERTA por m²
   piso / casa / ra ......... RealAdvisor, mediana por tipología
   fc ....................... Fotocasa, índice de compra de pisos
   notaria .................. €/m² REAL de escritura (Portal Estadístico del Notariado)
   catastro / catastroCV .... Catastro: €/m² de referencia y nº de compraventas del año
*/
window.VP_MARKET = ${JSON.stringify(payload, null, 2)};
`;

  fs.writeFileSync(TARGET, body, 'utf8');
  console.log(`[market-data] ${path.relative(process.cwd(), TARGET)} generado · datos de ${raw.meta.updated} · ${ORDER.length} municipios`);
};

main();
