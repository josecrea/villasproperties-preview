#!/usr/bin/env node
/* La valoración en it / nl / fr / en / de.
   Regresión de: «en italiano pulso Valutazione gratuita y sale en español».
   Tres cosas tienen que seguir siendo verdad:
     1. cada idioma traduce TODAS las claves del español (si falta una, esa
        cadena sale en español sin avisar);
     2. cada <idioma>/valuation.html existe, declara su idioma y carga
        valuation-i18n.js antes que valuation.js y map.js;
     3. la cabecera (shell.js) manda el botón de valoración a la página del
        idioma, no a la española.
   Uso: node tools/tests/valuation-i18n.test.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..', '..');
const LANGS = ['it', 'nl', 'fr', 'en', 'de'];
const leer = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let pasan = 0;
const fallos = [];
const prueba = (nombre, fn) => {
  try { fn(); pasan += 1; } catch (e) { fallos.push(`✗ ${nombre}\n    ${e.message}`); }
};

/* Tabla española: vive dentro de valuation.js. */
const fuente = leer('valuation.js');
const ini = fuente.indexOf('const ES = {');
const fin = fuente.indexOf('\n  };', ini);
assert(ini > 0 && fin > ini, 'no encuentro la tabla ES en valuation.js');
const ES = vm.runInNewContext(`(${fuente.slice(ini + 'const ES = '.length, fin + 4).replace(/;\s*$/, '')})`);

const ventana = {};
vm.runInNewContext(leer('valuation-i18n.js'), { window: ventana });
const I18N = ventana.VP_VAL_I18N;

const forma = (obj) => Object.keys(obj).sort().map((k) => {
  const v = obj[k];
  if (typeof v === 'function') return `${k}:fn${v.length}`;
  if (v && typeof v === 'object') return `${k}:{${Object.keys(v).sort().join(',')}}`;
  return `${k}:${typeof v}`;
});

for (const lang of LANGS) {
  prueba(`${lang}: traduce todas las claves del español, con la misma forma`, () => {
    assert(I18N[lang], `falta el idioma ${lang} en valuation-i18n.js`);
    const { map, ...resto } = I18N[lang];
    assert.deepStrictEqual(forma(resto), forma(ES));
    assert.deepStrictEqual(Object.keys(map).sort(),
      ['cta', 'deed', 'deedSmall', 'down', 'fallback', 'foot', 'months', 'ops', 'up']);
  });

  prueba(`${lang}: ninguna cadena se ha quedado igual que en español`, () => {
    const iguales = Object.keys(ES).filter((k) => typeof ES[k] === 'string'
      && !['sep', 'refZone', 'dExtras', 'refMedian', 'dType', 'dSurface'].includes(k) && ES[k] === I18N[lang][k]);
    assert.deepStrictEqual(iguales, []);
  });

  prueba(`${lang}: las frases con datos siguen llevando el dato`, () => {
    const t = I18N[lang];
    assert(t.hookUpBody('Arona', 'oct 2026').includes('Arona'));
    assert(t.hookBuyStrong('1.234').includes('1.234'));
    assert(t.absBodyLujo('Adeje', '9.000 €/m²').includes('9.000 €/m²'));
    assert(t.errSurface(15, 2000).includes('2000'));
    assert(t.note('2026-11-01').includes('ECO/805/2003'));
  });

  prueba(`${lang}/valuation.html: existe, en su idioma y con los textos cargados antes del motor`, () => {
    const html = leer(`${lang}/valuation.html`);
    assert(html.includes(`<html lang="${lang}">`), 'lang incorrecto');
    assert(html.includes(`<link rel="canonical" href="https://villasproperties.es/${lang}/valuation.html">`), 'canonical no apunta a sí misma');
    const pos = (s) => html.indexOf(s);
    assert(pos('src="../valuation-i18n.js') > 0, 'no carga valuation-i18n.js');
    assert(pos('src="../valuation-i18n.js') < pos('src="../valuation.js'), 'valuation-i18n.js va después de valuation.js');
    assert(pos('src="../valuation-i18n.js') < pos('src="../map.js'), 'valuation-i18n.js va después de map.js');
    for (const es of ['Municipio</label>', 'Continuar ↗', '¿Dónde está la vivienda?', 'Enviar por WhatsApp', 'Preguntas honestas']) {
      assert(!html.includes(es), `queda español en la página: «${es}»`);
    }
    for (const id of ['vpValuation', 'vMunicipality', 'vZone', 'vSurface', 'vCondition', 'vName', 'vPhone', 'vPrivacy', 'vCalculate', 'priceMap', 'mapPanel']) {
      assert(html.includes(`id="${id}"`), `se ha perdido el id="${id}" que usa el JS`);
    }
    for (const v of ['value="reformar"', 'value="bueno"', 'value="reformado"', 'value="premium"', 'value="piso"', 'value="otro"']) {
      assert(html.includes(v), `se ha traducido un value interno: ${v}`);
    }
    assert(html.includes('href="contact.html"'), 'contacto debería quedarse en el idioma');
  });

  prueba(`${lang}: la cabecera lleva la valoración a la página del idioma`, () => {
    const cabecera = { innerHTML: '', querySelector: () => null };
    const documento = {
      documentElement: { getAttribute: () => lang },
      querySelector: (sel) => (sel === '.header' ? cabecera : null),
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {},
      createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }),
      head: { appendChild: () => {} },
      body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
    };
    const win = { addEventListener: () => {}, sessionStorage: { getItem: () => null }, localStorage: { getItem: () => null } };
    try {
      vm.runInNewContext(leer('shell.js'), { window: win, document: documento, location: { pathname: `/${lang}/index.html`, search: '' }, sessionStorage: win.sessionStorage, localStorage: win.localStorage, console });
    } catch (e) { /* lo de después de la cabecera (panel privado) no hace falta aquí */ }
    const m = cabecera.innerHTML.match(/<a class="advisor" href="([^"]+)"([^>]*)>/);
    assert(m, 'no se ha pintado el botón de valoración');
    assert.strictEqual(m[1], 'valuation.html', `el botón apunta a ${m[1]}`);
    assert(!m[2].includes('hreflang="es"'), 'el botón sigue marcado como página en español');
    assert(/<a href="finance\.html"[^>]*>/.test(cabecera.innerHTML), 'Finance debería quedarse en el idioma');
    assert(/<a href="\.\.\/sell\.html" hreflang="es"/.test(cabecera.innerHTML), 'Sell no está traducida: debe salir al español, marcada');
  });
}

prueba('es: la cabecera española no cambia de destino', () => {
  const cabecera = { innerHTML: '', querySelector: () => null };
  const documento = {
    documentElement: { getAttribute: () => 'es' },
    querySelector: (sel) => (sel === '.header' ? cabecera : null),
    querySelectorAll: () => [], getElementById: () => null, addEventListener: () => {},
    createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {} }),
    head: { appendChild: () => {} }, body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
  };
  const win = { addEventListener: () => {} };
  try { vm.runInNewContext(leer('shell.js'), { window: win, document: documento, location: { pathname: '/sell.html', search: '' }, console }); } catch (e) { /* idem */ }
  assert(cabecera.innerHTML.includes('<a class="advisor" href="valuation.html">Valoración gratis</a>'));
  assert(cabecera.innerHTML.includes('<a href="sell.html" class="is-current" aria-current="page">Sell</a>'));
});

console.log(`valuation-i18n: ${pasan} pasan, ${fallos.length} fallan, 0 omitidas`);
if (fallos.length) { console.log(fallos.join('\n')); process.exit(1); }
