/* Pruebas del fichero de Spainhouses. Ejecutar: node tools/tests/feed-spainhouses.test.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const g = require('../feeds/build-feed-spainhouses.js');

const RAIZ = path.resolve(__dirname, '..', '..');
const fichas = g.leerFichas();
const traducciones = JSON.parse(fs.readFileSync(path.join(RAIZ, 'tools', 'i18n', 'viviendas_i18n.json'), 'utf8'));
const AHORA = '2026-11-12T10:00:00';
const base = () => g.construir({ fichas, traducciones, ahora: AHORA });
// Solo se publican las viviendas con textos Y con fotos sin marca de agua de otro portal.
const LIMPIAS = new Set(g.fotosLimpias());
const ESPERADAS = fichas.filter((f) => traducciones[f.ref] && LIMPIAS.has(f.slug)).map((f) => f.ref);

const pruebas = {
  'entran las viviendas con textos y fotos limpias, y ninguna más': () => {
    // Array.from: las fichas vienen de otro contexto de ejecución y su Array no es el de aquí.
    assert.ok(ESPERADAS.length > 0);
    assert.deepStrictEqual(Array.from(base().referencias).sort(), Array.from(ESPERADAS).sort());
  },
  'una vivienda con fotos de idealista no entra aunque tenga JPG y textos': () => {
    const fuera = fichas.find((f) => traducciones[f.ref] && !LIMPIAS.has(f.slug));
    assert.ok(fuera, 'hace falta al menos una vivienda fuera de fotosLimpias para probarlo');
    assert.ok(!base().xml.includes(`<referencia>${fuera.ref}</referencia>`));
    assert.ok(!/assets\/(feed|img)\//.test(base().xml), 'las fotos salen solo de feeds/img/');
    const sinNinguna = g.construir({ fichas, traducciones, ahora: AHORA, limpias: [] });
    assert.strictEqual(sinNinguna.referencias.length, 0);
  },
  'el fichero valida contra el esquema oficial del portal': () => {
    const tmp = path.join(require('os').tmpdir(), `feed-sh-${process.pid}.xml`);
    fs.writeFileSync(tmp, base().xml);
    try {
      execFileSync('xmllint', ['--noout', '--schema', path.join(RAIZ, 'tools', 'feeds', 'spainhouses-cartera.xsd'), tmp], { stdio: 'pipe' });
    } finally { fs.unlinkSync(tmp); }
  },
  'lo publicado coincide con lo generado': () => {
    const estado = JSON.parse(fs.readFileSync(path.join(RAIZ, 'tools', 'feeds', 'estado-spainhouses.json'), 'utf8'));
    const { xml } = g.construir({ fichas, traducciones, estadoPrevio: estado, ahora: AHORA });
    assert.strictEqual(xml, fs.readFileSync(path.join(RAIZ, 'feed', 'spainhouses.xml'), 'utf8'));
  },
  'cada vivienda lleva su precio del catálogo y los cinco idiomas': () => {
    const { xml } = base();
    for (const ref of ESPERADAS) {
      const f = fichas.find((x) => x.ref === ref);
      const bloque = xml.split('<propiedad>').find((b) => b.includes(`<referencia>${ref}</referencia>`));
      assert.ok(bloque.includes(`<precio>${f.price}</precio>`), ref);
      for (const idioma of ['es', 'de', 'nl', 'it', 'fr']) assert.ok(bloque.includes(`<idioma>${idioma}</idioma>`), `${ref} ${idioma}`);
    }
  },
  'no publica la calle: la dirección es solo la zona y va oculta': () => {
    const { xml } = base();
    assert.strictEqual((xml.match(/<mostrarDireccion>0<\/mostrarDireccion>/g) || []).length, ESPERADAS.length);
    assert.ok(!/<direccion>[^<]*(calle|avenida|avda|c\/|nº|\d)/i.test(xml));
  },
  'las coordenadas van redondeadas a la zona': () => {
    for (const m of base().xml.matchAll(/<geoLocalizacion>([^<]+)</g)) assert.ok(/^-?\d+\.\d{3},-?\d+\.\d{3}$/.test(m[1]), m[1]);
  },
  'todas las fotos existen en el repositorio': () => {
    for (const m of base().xml.matchAll(/<url>https:\/\/villasproperties\.es\/([^<]+)</g)) assert.ok(fs.existsSync(path.join(RAIZ, m[1])), m[1]);
  },
  'no promete alquiler vacacional ni lleva registro turístico': () => {
    const { xml } = base();
    assert.ok(!xml.includes('registroTurismo'));
    assert.ok(!/<tipoOferta>(?!Venta)/.test(xml));
  },
  'la fecha solo cambia si cambia el contenido': () => {
    const uno = base();
    const dos = g.construir({ fichas, traducciones, estadoPrevio: uno.estado, ahora: '2027-01-01T00:00:00' });
    assert.deepStrictEqual(dos.estado, uno.estado);
    const cambiadas = fichas.map((f) => (f.ref === '14541' ? { ...f, price: f.price - 1000 } : f));
    const tres = g.construir({ fichas: cambiadas, traducciones, estadoPrevio: uno.estado, ahora: '2027-01-01T00:00:00' });
    assert.strictEqual(tres.estado['14541'].fecha, '2027-01-01T00:00:00');
  },
  'tipos de inmueble del portal': () => {
    assert.deepStrictEqual(g.tipoInmueble('Ático'), { tipo: 'Piso', ext: 'Ático' });
    assert.deepStrictEqual(g.tipoInmueble('Apartamento · loft'), { tipo: 'Loft' });
    assert.deepStrictEqual(g.tipoInmueble('Apartamento'), { tipo: 'Apartamento' });
  },
  'energía: letra y consumo solo cuando hay etiqueta': () => {
    assert.deepStrictEqual(g.energia('F · 257,95 kWh/m² año · 74,62 kg CO2/m² año'), { letra: 'F', consumo: '257.95' });
    assert.deepStrictEqual(g.energia('Inmueble exento'), {});
    assert.deepStrictEqual(g.energia('Consumo 382,6 kWh/m² año'), {});
  },
  'escapa los caracteres especiales del texto': () => {
    assert.strictEqual(g.escapar('a < b & "c" > d'), 'a &lt; b &amp; "c" &gt; d');
  },
  'falla claro si una zona no tiene código postal': () => {
    const rara = fichas.map((f) => (f.ref === '14541' ? { ...f, zone: 'Zona Nueva' } : f));
    assert.throws(() => g.construir({ fichas: rara, traducciones, ahora: AHORA }), /código postal/);
  },
};

let fallos = 0;
for (const [nombre, fn] of Object.entries(pruebas)) {
  try { fn(); console.log('ok   ' + nombre); } catch (e) { fallos++; console.log('FALLA ' + nombre + '\n      ' + String(e.message).slice(0, 300)); }
}
console.log(`${Object.keys(pruebas).length - fallos} pasan, ${fallos} fallan, 0 omitidas`);
process.exit(fallos ? 1 : 0);
