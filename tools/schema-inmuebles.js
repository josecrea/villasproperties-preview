#!/usr/bin/env node
/* schema-inmuebles.js — Publicar el inventario como datos estructurados.
 *
 * POR QUÉ
 * -------
 * El sitio declaraba tener `RealEstateListing` en cada ficha, pero no había ni
 * uno en las 31 páginas: las tarjetas del catálogo las pintaba JavaScript, así
 * que tampoco había schema que leer. Un rastreador que no ejecuta JS —los de
 * las IA no lo hacen— veía una inmobiliaria sin inmuebles.
 *
 * Con el catálogo ya volcado al HTML por `prerender.js`, esto añade la capa
 * legible por máquina: precio, superficie, dormitorios, municipio y
 * coordenadas de cada inmueble, en el formato que Google y los modelos
 * entienden sin tener que interpretar el maquetado.
 *
 * SE REGENERA, NO SE EDITA
 * ------------------------
 * Sale de `properties-data.js`. Si mañana cambia un precio ahí, se vuelve a
 * ejecutar esto y el schema queda al día; editarlo a mano en el HTML lo
 * condena a quedarse viejo en silencio.
 *
 * USO
 * ---
 *   node tools/schema-inmuebles.js
 *   ./tools/sellar.sh
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DOMINIO = 'https://josecrea.github.io/villasproperties-preview';
const MARCA = 'data-schema="inmuebles"';

global.window = {};
require(path.join(RAIZ, 'properties-data.js'));
const inmuebles = global.window.VP_PROPERTIES || [];
if (!inmuebles.length) { console.error('  No hay inmuebles en properties-data.js'); process.exit(1); }

/* schema.org separa el anuncio (RealEstateListing) del bien anunciado
   (Apartment / House). Mezclarlos en un solo nodo es el error habitual y hace
   que el precio quede colgando de algo que no es una oferta. */
const TIPO = { Apartamento: 'Apartment', Piso: 'Apartment', Ático: 'Apartment',
  Casa: 'House', Chalet: 'House', Villa: 'House', Dúplex: 'Apartment' };

const ficha = (p) => {
  const bien = {
    '@type': TIPO[p.type] || 'Accommodation',
    name: p.title || p.titleShort,
    numberOfRooms: p.beds,
    numberOfBathroomsTotal: p.baths,
    floorSize: { '@type': 'QuantitativeValue', value: p.built, unitCode: 'MTK' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: p.address || undefined,
      addressLocality: p.town,
      addressRegion: 'Santa Cruz de Tenerife',
      addressCountry: 'ES',
    },
  };
  if (p.year) bien.yearBuilt = p.year;
  if (Array.isArray(p.equipment) && p.equipment.length) bien.amenityFeature = p.equipment.map((a) => ({
    '@type': 'LocationFeatureSpecification', name: a, value: true,
  }));
  if (Array.isArray(p.coords) && p.coords.length === 2) bien.geo = {
    '@type': 'GeoCoordinates', latitude: p.coords[0], longitude: p.coords[1],
  };

  return {
    '@type': 'RealEstateListing',
    '@id': `${DOMINIO}/properties.html#${p.slug || p.ref}`,
    url: p.url || `${DOMINIO}/properties.html`,
    name: p.titleShort || p.title,
    description: Array.isArray(p.description) ? p.description[0] : (p.description || undefined),
    about: bien,
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: 'EUR',
      /* "En venta" es el único estado que se anuncia como disponible; el resto
         (vendido, reservado) no debe declararse InStock o el dato miente. */
      availability: p.status === 'En venta'
        ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      seller: { '@type': 'RealEstateAgent', name: "Villa's Properties" },
    },
  };
};

const grafo = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Inmuebles en venta — Villa’s Properties, Tenerife Sur',
  numberOfItems: inmuebles.length,
  itemListElement: inmuebles.map((p, i) => ({
    '@type': 'ListItem', position: i + 1, item: ficha(p),
  })),
};

const json = JSON.stringify(grafo, (k, v) => (v === undefined ? undefined : v));
const bloque = `<script type="application/ld+json" ${MARCA}>${json}</script>`;

const ruta = path.join(RAIZ, 'properties.html');
let html = fs.readFileSync(ruta, 'utf8');
const re = new RegExp(`<script type="application/ld\\+json" ${MARCA}>[\\s\\S]*?</script>`);
html = re.test(html) ? html.replace(re, bloque) : html.replace('</head>', `${bloque}\n</head>`);
fs.writeFileSync(ruta, html, 'utf8');

const venta = inmuebles.filter((p) => p.status === 'En venta').length;
console.log(`  ✔ ${inmuebles.length} inmuebles en RealEstateListing (${venta} en venta)`);
console.log(`     ${(json.length / 1024).toFixed(1)} KB añadidos a properties.html`);
console.log('  Ahora:  ./tools/sellar.sh');
