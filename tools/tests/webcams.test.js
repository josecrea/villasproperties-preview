/* Pruebas de la página de cámaras. Ejecutar: node tools/tests/webcams.test.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { embed, CAMS } = require('../build-webcams.js');

const ROOT = path.join(__dirname, '..', '..');
const PAGINAS = ['webcams-playas-tenerife-sur.html', 'de/webcams.html', 'en/webcams.html', 'fr/webcams.html', 'it/webcams.html', 'nl/webcams.html'];
let pasan = 0;
const prueba = (nombre, fn) => { fn(); pasan += 1; console.log('  ✓ ' + nombre); };

prueba('el código insertado es el de «Embed» de SkylineWebcams, sin atributos añadidos', () => {
  const html = embed({ id: 1064, slug: 'playa-la-pinta', titulos: { es: 'Título' } }, 'es');
  assert.strictEqual(html, '<a href="https://www.skylinewebcams.com/es/webcam/espana/canarias/santa-cruz-de-tenerife/playa-la-pinta.html" target="_blank"><img src="https://embed.skylinewebcams.com/img/1064.jpg" alt="Título"></a>');
});

prueba('no hay cámaras repetidas y todas tienen título en los 5 idiomas de Skyline', () => {
  assert.strictEqual(new Set(CAMS.map((c) => c.id)).size, CAMS.length);
  for (const c of CAMS) for (const l of ['es', 'en', 'de', 'fr', 'it']) assert.ok(c.titulos[l], `${c.slug} sin título en ${l}`);
});

prueba('cada página trae todas las cámaras y ninguna imagen copiada a la web', () => {
  for (const p of PAGINAS) {
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const n = (h.match(/<img src="https:\/\/embed\.skylinewebcams\.com\/img\/\d+\.jpg"/g) || []).length;
    assert.strictEqual(n, CAMS.length, `${p}: ${n} cámaras`);
    assert.ok(!/<figure class="cam">(?!<a href="https:\/\/www\.skylinewebcams\.com\/)/.test(h), `${p}: cámara sin enlace a Skyline`);
  }
});

prueba('la página en neerlandés enlaza a la versión inglesa de Skyline (no existe /nl/)', () => {
  const h = fs.readFileSync(path.join(ROOT, 'nl/webcams.html'), 'utf8');
  assert.ok(!h.includes('skylinewebcams.com/nl/'));
});

prueba('las seis páginas están en el mapa del sitio y se enlazan entre sí', () => {
  const mapa = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  for (const p of PAGINAS) {
    assert.ok(mapa.includes(`<loc>https://villasproperties.es/${p}</loc>`), `${p} fuera del sitemap`);
    const h = fs.readFileSync(path.join(ROOT, p), 'utf8');
    for (const q of PAGINAS) assert.ok(h.includes(`href="https://villasproperties.es/${q}"`), `${p} no enlaza ${q}`);
  }
});

console.log(`${pasan} pasan, 0 fallan, 0 omitidas`);
