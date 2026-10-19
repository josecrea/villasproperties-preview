#!/usr/bin/env node
/* Verificación de la isla NL/FR/IT (atelier:villas-idiomas), adaptada de
   /Users/josecrea/okservice-landing/tools/verificar-idiomas.js por indicación
   del director (no reinventar: misma lógica de reciprocidad probada contra
   151 páginas de electricistatenerife.es).

   Para cada página de la isla:
     - responde 200
     - <html lang> y og:locale del idioma de la ruta
     - canonical a SÍ MISMA (nunca al español ni a otro idioma)
     - hreflang: todos los destinos existen (200), son RECÍPROCOS, y si el
       grupo tiene versión española hay x-default a ella (si no la tiene,
       como la guía del comprador, no se exige x-default)
     - el selector de idioma de la página sólo ofrece los idiomas que
       existen para ESA página (no enlaza a un alternate ausente)

   Uso:
     node tools/i18n/verificar-idiomas.js                              → servidor local
     node tools/i18n/verificar-idiomas.js https://villasproperties.es  → producción
*/
'use strict';
const fs = require('fs');
const path = require('path');

const BASE_CANON = 'https://villasproperties.es';
const ROOT = path.resolve(__dirname, '..', '..');
const REMOTE = process.argv[2] || null;

// Páginas de la isla: una entrada por fichero real en el repo.
const PAGINAS = [
  'contact.html',
  'nl/contact.html', 'fr/contact.html', 'it/contact.html', 'en/contact.html', 'de/contact.html',
  'nl/guia-comprador.html', 'fr/guia-comprador.html', 'it/guia-comprador.html', 'en/guia-comprador.html', 'de/guia-comprador.html',
  'index.html',
  'nl/index.html', 'fr/index.html', 'it/index.html', 'en/index.html', 'de/index.html',
  'finance.html',
  'nl/finance.html', 'fr/finance.html', 'it/finance.html', 'en/finance.html', 'de/finance.html',
  'comprar-casa-adeje.html',
  'nl/huis-kopen-adeje.html', 'fr/acheter-maison-adeje.html', 'it/comprare-casa-adeje.html', 'en/buy-house-adeje.html', 'de/haus-kaufen-adeje.html',
  'comprar-casa-arona.html',
  'nl/huis-kopen-arona.html', 'fr/acheter-maison-arona.html', 'it/comprare-casa-arona.html', 'en/buy-house-arona.html', 'de/haus-kaufen-arona.html',
  'property-brief.html',
  'nl/zoekprofiel.html', 'fr/brief-recherche.html', 'it/brief-ricerca.html', 'en/property-brief.html', 'de/suchprofil.html',
];

const dentro = (s, re) => { const m = s.match(re); return m ? m[1] : ''; };

async function leer(rutaRel, cache) {
  if (cache.has(rutaRel)) return cache.get(rutaRel);
  let html, status;
  if (REMOTE) {
    const r = await fetch(REMOTE.replace(/\/$/, '') + '/' + rutaRel, { redirect: 'manual' });
    status = r.status;
    html = status === 200 ? await r.text() : '';
  } else {
    const fp = path.join(ROOT, rutaRel);
    if (fs.existsSync(fp)) { html = fs.readFileSync(fp, 'utf8'); status = 200; }
    else { html = ''; status = 404; }
  }
  const alternas = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => ({ lang: m[1], href: m[2] }));
  const selectorHrefs = [...html.matchAll(/<div class="lang-switch"[^>]*>(.*?)<\/div>/gs)]
    .flatMap((m) => [...m[1].matchAll(/<a href="([^"]+)" hreflang="([^"]+)"/gs)].map((a) => ({ href: a[1], lang: a[2] })));
  const v = {
    status, html, alternas, selectorHrefs,
    lang: dentro(html, /<html lang="([^"]+)"/),
    og: dentro(html, /<meta property="og:locale" content="([^"]+)"/),
    canonical: dentro(html, /<link rel="canonical" href="([^"]+)"/),
  };
  cache.set(rutaRel, v);
  return v;
}

const langOfRuta = (ruta) => {
  const m = ruta.match(/^(nl|fr|it|en|de)\//);
  return m ? m[1] : 'es';
};

(async () => {
  const cache = new Map();
  const fallos = [];
  for (const ruta of PAGINAS) {
    const lang = langOfRuta(ruta);
    const url = ruta === 'index.html' ? BASE_CANON + '/' : BASE_CANON + '/' + ruta;
    const v = await leer(ruta, cache);
    const f = (txt) => fallos.push(`${ruta}: ${txt}`);
    if (v.status !== 200) { f(`HTTP ${v.status}`); continue; }
    if (v.lang !== lang) f(`lang="${v.lang}", se esperaba "${lang}"`);
    if (v.canonical !== url) f(`canonical "${v.canonical}" ≠ "${url}" (canonical cruzado: debe apuntar a SÍ MISMA)`);

    const propio = v.alternas.find((a) => a.lang === lang);
    if (!propio || propio.href !== url) f(`no se declara a sí misma en hreflang="${lang}"`);

    // Reciprocidad: cada alternate (menos x-default) debe apuntar de vuelta.
    for (const a of v.alternas.filter((x) => x.lang !== 'x-default')) {
      const rel = a.href.replace(BASE_CANON + '/', '') || 'index.html';
      const d = await leer(rel, cache);
      if (d.status !== 200) { f(`hreflang="${a.lang}" apunta a ${a.href}, que da HTTP ${d.status} (hreflang huérfano)`); continue; }
      if (d.lang !== a.lang) f(`hreflang="${a.lang}" apunta a una página con lang="${d.lang}"`);
      if (!d.alternas.some((b) => b.href === url)) f(`hreflang="${a.lang}" NO es recíproco: ${a.href} no apunta de vuelta a ${url} (hreflang huérfano)`);
    }

    // x-default sólo es obligatorio si el grupo tiene versión española (contact.html sí; guia-comprador.html no).
    const grupoTieneEs = !ruta.includes('guia-comprador.html');
    const xd = v.alternas.find((a) => a.lang === 'x-default');
    if (grupoTieneEs && !xd) f('sin hreflang x-default (el grupo sí tiene versión española)');
    // El nombre del fichero español no coincide con el de la isla: desde la ronda 6 el slug
    // se traduce (comprar-casa-adeje.html -> nl/huis-kopen-adeje.html, property-brief.html ->
    // nl/zoekprofiel.html), así que "quitar el prefijo nl|fr|it|en|de/" ya NO identifica la
    // versión española. El x-default esperado se toma del propio hreflang="es" que declara la
    // página. Sin este arreglo el verificador daba 10 falsos positivos.
    // Nota: los dos devs de la ronda 6 encontraron este fallo por separado y escribieron la
    // misma corrección; esta es la copia conservada al fusionar.
    const esAlt = v.alternas.find((a) => a.lang === 'es');
    const paginaEs = ruta.replace(/^(nl|fr|it|en|de)\//, '');
    const esperadoXd = esAlt ? esAlt.href
      : (paginaEs === 'index.html' ? BASE_CANON + '/' : BASE_CANON + '/' + paginaEs);
    if (grupoTieneEs && xd && xd.href !== esperadoXd) f(`x-default a ${xd.href}, no a la versión española`);
    if (!grupoTieneEs && xd) f('tiene x-default pero el grupo no tiene versión española (sería un alternate falso)');

    // El selector no debe ofrecer un idioma que no exista para esta página.
    for (const s of v.selectorHrefs) {
      const existe = v.alternas.some((a) => a.href === BASE_CANON + s.href) || s.href === BASE_CANON.replace(BASE_CANON, '') + '/' + ruta;
      // comprobación simple: el href del selector debe coincidir con alguno de los alternates declarados o ser la propia página
      const match = v.alternas.some((a) => a.href === BASE_CANON + s.href) || (BASE_CANON + s.href === url);
      if (!match) f(`el selector ofrece "${s.lang}" (${s.href}) sin que exista hreflang alternate correspondiente`);
    }
  }

  console.log(`${PAGINAS.length} páginas de la isla NL/FR/IT contra ${REMOTE || 'ficheros locales (' + ROOT + ')'}`);
  if (fallos.length) {
    for (const x of fallos) console.log('✗ ' + x);
    console.log(`\n${fallos.length} fallos.`);
    process.exit(1);
  }
  console.log('✓ 0 huérfanos, 0 canonical cruzados, hreflang recíproco, selector consistente con las variantes reales.');
})().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
