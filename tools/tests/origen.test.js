/* Pruebas del origen del contacto (vp-lead.js). Ejecutar: node tools/tests/origen.test.js */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codigo = fs.readFileSync(path.join(__dirname, '..', '..', 'vp-lead.js'), 'utf8');
const escuchas = [];
const ventana = {};
const contexto = {
  window: ventana, URL, URLSearchParams, Promise,
  location: { search: '', host: 'villasproperties.es', href: 'https://villasproperties.es/de/' },
  document: {
    readyState: 'complete', documentElement: { lang: 'de' }, referrer: '',
    addEventListener: (tipo, fn) => escuchas.push(tipo),
  },
  fetch: () => Promise.resolve({}),
};
vm.createContext(contexto);
vm.runInContext(codigo, contexto);
const O = ventana.VPLead.origen;
const BASE = 'https://villasproperties.es/de/';

const pruebas = {
  'lee canal, campaña, idioma y web de procedencia': () => {
    const o = O.leer('?utm_source=fb-grupo&utm_campaign=de-s1', 'de',
      'https://www.facebook.com/groups/x', 'villasproperties.es');
    assert.deepStrictEqual(JSON.parse(JSON.stringify(o)), {
      marcas: { utm_source: 'fb-grupo', utm_campaign: 'de-s1' }, idioma: 'de', viene: 'www.facebook.com' });
  },
  'no cuenta como procedencia la propia web': () => {
    const o = O.leer('', 'es', 'https://villasproperties.es/buy.html', 'villasproperties.es');
    assert.strictEqual(o.viene, '');
  },
  'limpia marcas con caracteres raros y las acorta': () => {
    const o = O.leer('?utm_source=' + encodeURIComponent('<script>x</script>' + 'a'.repeat(200)), 'de', '', 'h');
    assert.ok(!/[<>\/]/.test(o.marcas.utm_source));
    assert.ok(o.marcas.utm_source.length <= 60);
  },
  'un referente inválido no rompe nada': () => {
    assert.strictEqual(O.leer('', 'de', 'no es una url', 'h').viene, '');
  },
  'añade el bloque ORIGEN a la descripción': () => {
    const o = O.leer('?utm_source=linkedin&utm_campaign=de-s1', 'de', '', 'h');
    const d = O.conOrigen('Consulta', o);
    assert.ok(d.startsWith('Consulta\n\nORIGEN\nCanal: linkedin\nCampaña: de-s1'));
    assert.ok(d.includes('Idioma de la página: de'));
  },
  'sin marca ni idioma deja la descripción igual': () => {
    assert.strictEqual(O.conOrigen('Consulta', O.leer('', '', '', 'h')), 'Consulta');
  },
  'arrastra la marca a un enlace interno': () => {
    const o = O.leer('?utm_source=fb-grupo&utm_campaign=de-s1', 'de', '', 'h');
    const u = new URL(O.enlaceConMarca('contact.html', o, BASE));
    assert.strictEqual(u.pathname, '/de/contact.html');
    assert.strictEqual(u.searchParams.get('utm_source'), 'fb-grupo');
    assert.strictEqual(u.searchParams.get('utm_campaign'), 'de-s1');
  },
  'no toca enlaces externos, PDF ni enlaces ya marcados': () => {
    const o = O.leer('?utm_source=fb-grupo', 'de', '', 'h');
    assert.strictEqual(O.enlaceConMarca('https://www.idealista.com/x', o, BASE), null);
    assert.strictEqual(O.enlaceConMarca('/assets/informes/informe-adeje.pdf', o, BASE), null);
    assert.strictEqual(O.enlaceConMarca('contact.html?utm_source=otro', o, BASE), null);
  },
  'sin marca no reescribe enlaces': () => {
    assert.strictEqual(O.enlaceConMarca('contact.html', O.leer('', 'de', '', 'h'), BASE), null);
  },
  'pone la referencia en el texto del WhatsApp, una sola vez': () => {
    const o = O.leer('?utm_source=fb-grupo&utm_campaign=de-s1', 'de', '', 'h');
    const uno = O.whatsappConRef('https://wa.me/34667384965?text=Hallo', o);
    assert.strictEqual(new URL(uno).searchParams.get('text'), 'Hallo\n(Ref. fb-grupo / de-s1)');
    assert.strictEqual(O.whatsappConRef(uno, o), null);
  },
  'no confunde con WhatsApp una web ajena que lleve «wa.me» en la dirección': () => {
    const o = O.leer('?utm_source=fb-grupo&utm_campaign=de-s1', 'de', '', 'h');
    assert.strictEqual(O.whatsappConRef('https://kiwa.me/pagina', o), null);
    assert.strictEqual(O.whatsappConRef('https://otra.com/?r=wa.me', o), null);
    assert.ok(O.whatsappConRef('https://api.whatsapp.com/send?phone=34667384965', o));
  },
  'WhatsApp sin texto previo y sin marca': () => {
    const o = O.leer('?utm_source=linkedin', 'de', '', 'h');
    assert.strictEqual(new URL(O.whatsappConRef('https://wa.me/34667384965', o)).searchParams.get('text'), '(Ref. linkedin)');
    assert.strictEqual(O.whatsappConRef('https://wa.me/34667384965', O.leer('', 'de', '', 'h')), null);
  },
};

let fallos = 0;
for (const [nombre, fn] of Object.entries(pruebas)) {
  try { fn(); console.log('ok   ' + nombre); }
  catch (e) { fallos++; console.log('FALLA ' + nombre + '\n      ' + e.message); }
}
console.log(`${Object.keys(pruebas).length - fallos} pasan, ${fallos} fallan, 0 omitidas`);
process.exit(fallos ? 1 : 0);
