/* Pruebas del fichero para portales (tools/feed-portales.js).
   Ejecutar: node tools/tests/feed-portales.test.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const F = require('../feed-portales.js');

const RAIZ = path.join(__dirname, '..', '..');
const AHORA = '2026-11-12 10:00:00';
const CONFIG = { fotosLimpias: ['casa-a', 'casa-b'], codigosPostales: { 'casa-a': '38639' } };

const casa = (extra) => ({
  ref: '100', slug: 'casa-a', title: 'Ático con terraza & vistas', town: 'San Miguel de Abona',
  zone: 'Las Chafiras', type: 'Ático', status: 'En venta', price: 299000, built: 93, beds: 3, baths: 2,
  equipment: ['Aire acondicionado', 'Piscina comunitaria'],
  features: ['Armarios empotrados', 'Sin calefacción', 'Dos baños completos: bañera y ducha',
    'Terraza de 10 m² con vistas a la piscina y al jardín'],
  description: ['Primer párrafo con <b>símbolos</b> & comillas "dobles".', 'Segundo párrafo.'],
  coords: [28.058, -16.6168], images: ['assets/img/casa-a/2026-10/01.webp', 'assets/img/casa-a/2026-10/02.webp'],
  ...extra,
});

const pruebas = {
  'solo entran las viviendas en venta y con fotos limpias': () => {
    const { incluidas, excluidas } = F.seleccionar([
      casa(), casa({ ref: '200', slug: 'casa-b', status: 'Vendido' }),
      casa({ ref: '300', slug: 'casa-con-marca' }), casa({ ref: '400', slug: 'casa-b', images: [] }),
    ], CONFIG);
    assert.deepStrictEqual(incluidas.map((p) => p.ref), ['100']);
    assert.deepStrictEqual(excluidas.map((e) => e.ref), ['200', '300', '400']);
    assert.ok(/marca de agua|fotos limpias/.test(excluidas[1].motivo));
  },
  'la fecha solo cambia cuando cambia la vivienda': () => {
    const e1 = F.fechar([casa()], {}, AHORA);
    assert.strictEqual(e1['100'].fecha, AHORA);
    const e2 = F.fechar([casa()], e1, '2026-12-01 09:00:00');
    assert.strictEqual(e2['100'].fecha, AHORA);
    const e3 = F.fechar([casa({ price: 289000 })], e2, '2026-12-01 09:00:00');
    assert.strictEqual(e3['100'].fecha, '2026-12-01 09:00:00');
  },
  'una vivienda retirada desaparece del estado': () => {
    const e = F.fechar([], { 100: { huella: 'x', fecha: AHORA } }, AHORA);
    assert.deepStrictEqual(e, {});
  },
  'kyero: campos obligatorios, tipo traducido y piscina': () => {
    const x = F.kyero([casa()], F.fechar([casa()], {}, AHORA), CONFIG);
    for (const t of ['<feed_version>3</feed_version>', '<id>100</id>', `<date>${AHORA}</date>`,
      '<price>299000</price>', '<price_freq>sale</price_freq>', '<type>penthouse</type>',
      '<town>San Miguel de Abona</town>', '<province>Santa Cruz de Tenerife</province>',
      '<beds>3</beds>', '<baths>2</baths>', '<pool>1</pool>', '<built>93</built>',
      '<latitude>28.058</latitude>', '<es>https://villasproperties.es/property.html?ref=100</es>']) {
      assert.ok(x.includes(t), 'falta ' + t);
    }
  },
  'kyero: escapa el texto y separa los párrafos sin HTML ni CDATA': () => {
    const x = F.kyero([casa()], F.fechar([casa()], {}, AHORA), CONFIG);
    assert.ok(x.includes('&lt;b&gt;símbolos&lt;/b&gt; &amp; comillas &quot;dobles&quot;.&#13;&#13;Segundo párrafo.'));
    assert.ok(!x.includes('CDATA') && !x.includes('<b>'));
  },
  'kyero: las características largas, con puntuación o negativas se quedan fuera': () => {
    const x = F.kyero([casa()], F.fechar([casa()], {}, AHORA), CONFIG);
    assert.ok(x.includes('<feature>Armarios empotrados</feature>'));
    assert.ok(x.includes('<feature>Aire acondicionado</feature>'));
    assert.ok(!x.includes('Sin calefacción') && !x.includes('bañera y ducha') && !x.includes('y al jardín'));
  },
  'las fotos van en JPG, numeradas y con dirección absoluta': () => {
    const x = F.kyero([casa()], F.fechar([casa()], {}, AHORA), CONFIG);
    assert.ok(x.includes('<image id="1">'));
    assert.ok(x.includes('<url>https://villasproperties.es/feeds/img/casa-a/01.jpg</url>'));
    assert.ok(x.includes('<url>https://villasproperties.es/feeds/img/casa-a/02.jpg</url>'));
    assert.ok(!x.includes('.webp'));
  },
  'kyero: nunca más de 50 fotos': () => {
    const muchas = Array.from({ length: 60 }, (_, i) => `assets/img/casa-a/${i}.webp`);
    const x = F.kyero([casa({ images: muchas })], F.fechar([casa({ images: muchas })], {}, AHORA), CONFIG);
    assert.strictEqual((x.match(/<image id=/g) || []).length, 50);
  },
  'tuad: su propio formato, con código postal si se conoce': () => {
    const x = F.tuad([casa()], F.fechar([casa()], {}, AHORA), CONFIG);
    for (const t of ['<tuad>', '<external_id>100</external_id>', '<negotiation_type>sale</negotiation_type>',
      '<type>penthouse</type>', '<city>San Miguel de Abona</city>', '<postcode>38639</postcode>',
      '<rooms>3</rooms>', '<m2>93</m2>', '<pool>1</pool>']) assert.ok(x.includes(t), 'falta ' + t);
    const sinCp = F.tuad([casa({ slug: 'casa-b' })], F.fechar([casa()], {}, AHORA), CONFIG);
    assert.ok(!sinCp.includes('<postcode>'));
  },
  'un tipo de vivienda desconocido para el generador es un error, no un invento': () => {
    assert.throws(() => F.kyero([casa({ type: 'Palacio' })], F.fechar([casa()], {}, AHORA), CONFIG), /tipo/i);
  },
  'los ficheros publicados están al día con properties-data.js': () => {
    const esperado = F.generar({ soloCalcular: true });
    for (const [nombre, texto] of Object.entries(esperado.ficheros)) {
      const real = fs.readFileSync(path.join(RAIZ, 'feeds', nombre), 'utf8');
      assert.strictEqual(real, texto, `feeds/${nombre} está viejo: ejecuta node tools/feed-portales.js`);
    }
    for (const foto of esperado.fotos) assert.ok(fs.existsSync(path.join(RAIZ, foto.destino)), 'falta ' + foto.destino);
  },
};

let fallos = 0;
for (const [nombre, fn] of Object.entries(pruebas)) {
  try { fn(); console.log('ok   -', nombre); } catch (e) { fallos += 1; console.log('FALLA -', nombre, '\n      ', e.message); }
}
console.log(fallos ? `\n${fallos} fallo(s)` : '\nTODO OK');
process.exit(fallos ? 1 : 0);
