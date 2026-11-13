#!/usr/bin/env node
/* Aplica reglas de títulos a las URL del sitemap: título con la palabra clave y ≤60 caracteres,
   H1 en el idioma de la página que dice lo mismo que el título (el eslogan pasa a subtítulo
   <p class="h1-sub">), título y descripción únicos (≤155).
   Idempotente: solo toca lo que tools/audit-titulos.js marca como problema.
   Uso: node tools/aplicar-titulos.js [--dry]    · después: node tools/audit-titulos.js
   Orden en el refresco: generadores → build-seo.js → aplicar-titulos.js (build-seo ya respeta
   las descripciones existentes, así que el orden solo importa para los títulos). */
'use strict';
const fs = require('fs'), path = require('path');
const { analyze, strip } = require('./audit-titulos');
const ROOT = path.join(__dirname, '..');
const ERR = [];
const DRY = process.argv.includes('--dry');
const E = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BRAND_RE = /\s*(?:—|\||-)\s*Villa(?:’|'|&#x27;|&#39;)s(?: Properties)?\s*$/;
const baseOf = (t) => t.replace(BRAND_RE, '').trim();
function fit(bases, lang) {
  const ap = lang === 'es' ? '’' : "'";
  for (const b of [].concat(bases)) for (const suf of [` | Villa${ap}s Properties`, ` | Villa${ap}s`]) if ((b + suf).length <= 60) return b + suf;
  ERR.push('no cabe en 60: ' + bases); return [].concat(bases)[0];
}

const MUNI = {
  'adeje': 'Adeje', 'arona': 'Arona', 'costa-adeje': 'Costa Adeje', 'el-medano': 'El Médano',
  'granadilla-de-abona': 'Granadilla de Abona', 'guia-de-isora': 'Guía de Isora', 'los-cristianos': 'Los Cristianos',
  'san-miguel-de-abona': 'San Miguel de Abona', 'santiago-del-teide': 'Santiago del Teide',
};
/* Familias de landings municipales: [regex de fichero, títulos candidatos, descripción]. */
const FAM = [
  { re: /^comprar-casa-(.+)\.html$/, lang: 'es', t: (M) => [`Comprar casa en ${M}: precios reales`, `Comprar casa en ${M}`], d: (M, a, b) => `Comprar casa en ${M}: se piden ${a} €/m² y se firman ${b} €/m². Precio por zona y qué comprobar antes de firmar.` },
  { re: /^vender-casa-(.+)\.html$/, lang: 'es', t: (M) => [`Vender casa en ${M}: precio real`, `Vender casa en ${M}`], d: (M, a, n) => `Vender casa en ${M}: se piden ${a} €/m² de media y se venden ${n} viviendas al año. Valoración gratis y sin compromiso.`, vend: true },
  { re: /^nl\/huis-kopen-(.+)\.html$/, lang: 'nl', t: (M) => [`Huis kopen in ${M}: prijzen`, `Huis kopen in ${M}`], d: (M, a, b) => `Huis kopen in ${M}: ${a} €/m² gevraagd, ${b} €/m² getekend. Prijs per zone en wat u controleert voordat u tekent.` },
  { re: /^fr\/acheter-maison-(.+)\.html$/, lang: 'fr', t: (M) => [`Acheter une maison à ${M} : prix`, `Acheter une maison à ${M}`], d: (M, a, b) => `Acheter une maison à ${M} : ${a} €/m² demandés, ${b} €/m² signés. Prix par zone et points à vérifier avant de signer.` },
  { re: /^it\/comprare-casa-(.+)\.html$/, lang: 'it', t: (M) => [`Comprare casa a ${M}: prezzi`, `Comprare casa a ${M}`], d: (M, a, b) => `Comprare casa a ${M}: ${a} €/m² richiesti, ${b} €/m² firmati. Prezzi per zona e cosa verificare prima di firmare.` },
  { re: /^en\/buy-house-(.+)\.html$/, lang: 'en', t: (M) => [`Buying a house in ${M}: prices`, `Buying a house in ${M}`], d: (M, a, b) => `Buying a house in ${M}: ${a} €/m² asked, ${b} €/m² notarised. Prices by zone and what to check before signing.` },
  { re: /^de\/haus-kaufen-(.+)\.html$/, lang: 'de', t: (M) => [`Haus kaufen in ${M}: Preise`, `Haus kaufen in ${M}`], d: (M, a, b) => `Haus kaufen in ${M}: ${a} €/m² verlangt, ${b} €/m² beurkundet. Preise nach Zone und was vor der Unterschrift zu prüfen ist.` },
];
/* Casos a mano (título = base sin marca; se ajusta a ≤60 con la marca). */
const OVR = {
  'advisory.html': { h1: 'Asesoría inmobiliaria en Tenerife Sur' },
  'case-studies.html': { title: 'Casos reales de compraventa en Tenerife Sur' },
  'decision-lab.html': { title: 'Decision Lab: calculadora de inversión' },
  'finance-lab.html': { title: 'Finance Lab: calcula tu capacidad de compra' },
  'insights.html': { title: 'Insights: análisis del mercado inmobiliario' },
  'intelligence.html': { title: 'Intelligence: datos de mercado inmobiliario' },
  'market-impact.html': { title: 'Market Impact: tu precio frente al mercado' },
  'property.html': { title: 'Ficha de propiedad en Tenerife Sur', h1: 'Ficha de propiedad en Tenerife Sur' },
  'properties.html': { title: 'Propiedades en venta en Tenerife Sur' },
  'property-compare.html': { title: 'Property Compare: compara propiedades en Tenerife' },
  'property-brief.html': { title: 'Property Brief: define tu búsqueda en Tenerife' },
  'nl/zoekprofiel.html': { title: 'Zoekprofiel: uw zoektocht op Tenerife' },
  'fr/brief-recherche.html': { title: 'Brief de recherche : votre bien à Tenerife' },
  'it/brief-ricerca.html': { title: 'Brief di ricerca: la tua casa a Tenerife' },
  'de/suchprofil.html': { title: 'Suchprofil: Ihre Immobiliensuche auf Teneriffa' },
  'en/property-brief.html': { title: 'Property brief: define your Tenerife home search' },
  'valuation.html': { title: 'Valoración gratis de tu casa en Tenerife Sur' },
  'informe-sur-de-tenerife-2026-10-27.html': { title: 'Informe del sur de Tenerife · octubre 2026' },
  'post-mapa-metro-cuadrado.html': { title: 'El mapa del metro cuadrado en Tenerife Sur' },
  'post-newsletter-sur-de-tenerife-2026-10-27.html': { title: 'Las Rosas +16,6 %: el sur de Tenerife en cifras' },
  'post-de-adeje-al-norte-las-zonas-de-tenerife-que-marcaran-la-revalorizacion-en-2026-4.html': { title: 'Zonas de Tenerife que más se revalorizan en 2026' },
  'post-el-precio-de-la-vivienda-en-espana-se-ha-incrementado-un-45-en-los-ultimos-diez-anos-7.html': { title: 'La vivienda en España sube un 45 % en diez años' },
  'post-suelo-urbano-canarias-125000-viviendas.html': { title: 'Suelo urbano en Canarias: 125.000 viviendas' },
  'post-vender-casa-tenerife-sur.html': { title: 'Vender casa en Tenerife Sur: precio real y plazos' },
  'aviso-legal.html': { desc: 'Aviso legal de Villa’s Properties (VILLVERG SL): titular, datos de contacto y condiciones de uso de la web según la Ley 34/2002 (LSSI-CE).' },
  'post-como-vender-una-casa-5.html': { desc: 'Cómo vender una casa en Tenerife: entiende el mercado y fija un precio de salida realista antes de publicar el anuncio. Fase 1.' },
  'post-como-vender-una-casa-fase-2-6.html': { desc: 'Cómo vender una casa, fase 2: prepara la operación, la documentación y el canal de venta una vez decidido el precio de salida.' },
  'post-cuanto-vale-realmente-mi-villa-en-tenerife-la-clave-esta-en-la-precision-no-en-la-prisa-2.html': { desc: 'Cuánto vale realmente tu villa en Tenerife: por qué la clave está en la precisión y no en la prisa al fijar el precio de venta.' },
  'post-de-adeje-al-norte-las-zonas-de-tenerife-que-marcaran-la-revalorizacion-en-2026-4.html#d': { },
  'post-el-precio-de-la-vivienda-en-espana-se-ha-incrementado-un-45-en-los-ultimos-diez-anos-7.html#d': { },
  'post-estudio-anual-del-mercado-inmobiliario-1.html': { desc: 'Estudio anual del mercado inmobiliario en Tenerife: tendencia alcista sostenida entre 2020 y 2025 y qué significa para vender o comprar.' },
  'post-invertir-en-tenerife-por-que-la-seguridad-juridica-es-mas-importante-que-la-rentabilidad-3.html': { desc: 'Invertir en Tenerife: por qué la seguridad jurídica pesa más que la rentabilidad y qué comprobar antes de comprometer capital.' },
  'post-por-que-tu-casa-no-se-vende-en-tenerife-8.html': { desc: 'Por qué tu casa no se vende en Tenerife Sur tras meses en el mercado: las causas habituales, sobre todo en gama alta, y cómo corregirlas.' },
  'post-suelo-urbano-canarias-125000-viviendas.html#d': { },
  'fr/index.html': { desc: "Agence immobilière dans le sud de Tenerife : analyse de marché propre pour acheter, vendre, financer et investir avec des données réelles." },
  'en/index.html': { h1raw: 'Tenerife.<br>Property.<br>Different.' },
};
const DESC_POSTS = {
  'post-de-adeje-al-norte-las-zonas-de-tenerife-que-marcaran-la-revalorizacion-en-2026-4.html': 'De Adeje al norte: las zonas de Tenerife con más recorrido de revalorización en 2026 y qué significa si compras o vendes.',
  'post-el-precio-de-la-vivienda-en-espana-se-ha-incrementado-un-45-en-los-ultimos-diez-anos-7.html': 'El precio de la vivienda en España ha subido un 45 % en diez años: qué cambió en el mercado y qué implica hoy comprar o vender en Tenerife.',
  'post-suelo-urbano-canarias-125000-viviendas.html': 'Suelo urbano en Canarias: caben 125.024 viviendas sin recalificar, pero solo 11.000 son unifamiliares. Por qué eso marca el precio de la villa.',
  'post-vender-casa-tenerife-sur.html': 'Vender casa en Tenerife Sur: en 2026 se firma entre un 9 % y un 25 % por debajo del precio pedido, según el municipio. Impuestos y plazos.',
};
for (const k of Object.keys(OVR)) if (k.endsWith('#d')) delete OVR[k];
for (const [k, d] of Object.entries(DESC_POSTS)) OVR[k] = Object.assign(OVR[k] || {}, { desc: d });

function leadNums(html) {
  const m = html.match(/<p class="pagelede">([\s\S]*?)<\/p>/);
  const t = m ? strip(m[1]) : '';
  const n = [...t.matchAll(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)\s*€\/m²/g)].map((x) => x[1]);
  const v = t.match(/(\d{1,3}(?:\.\d{3})*)\s+(?:viviendas|woningen|logements)/);
  return { a: n[0], b: n[1], n: v && v[1] };
}

const { fails } = analyze();
const report = [];
let changed = 0;
for (const r of fails) {
  const fam = FAM.find((f) => f.re.test(r.u));
  const o = OVR[r.u] || {};
  const has = (p) => r.p.includes(p);
  let file = fs.readFileSync(path.join(ROOT, r.f), 'utf8');
  const before = { title: r.title, h1: r.h1, desc: r.desc };
  let title = r.title, desc = r.desc, h1 = null, sub = null;
  const M = fam && MUNI[(r.u.match(fam.re) || [])[1]] || (fam && (r.u.match(fam.re) || [])[1]);

  if (o.title || has('título>60') || has('título repetido')) {
    title = fam ? fit(fam.t(M), fam.lang) : fit(o.title || baseOf(r.title), r.lang);
  }
  if (has('desc repetida') || has('sin descripción') || has('desc>155') || o.desc) {
    if (o.desc) desc = o.desc;
    else if (fam) { const x = leadNums(file); desc = fam.d(M, x.a, fam.vend ? x.n : x.b); if (/undefined/.test(desc)) ERR.push('sin cifras en ' + r.u); }
    else ERR.push('falta descripción para ' + r.u);
  }
  if (o.h1raw) { h1 = o.h1raw; }
  else if (has('H1≠título') || has('H1 otro idioma') || has('sin H1') || o.h1) {
    h1 = E(o.h1 || baseOf(title));
    if (r.h1 && !o.h1raw) sub = (file.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
  }
  if (desc.length > 155) ERR.push('desc>155 ' + r.u + ' ' + desc.length);
  if (title.length > 60) ERR.push('title>60 ' + r.u);

  if (title !== r.title) {
    file = file.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${E(title)}</title>`);
    file = file.replace(/(<meta property="og:title" content=")[^"]*(")/, (_, a, b) => a + E(title) + b);
    file = file.replace(/(<meta name="twitter:title" content=")[^"]*(")/, (_, a, b) => a + E(title) + b);
  }
  if (desc !== r.desc) {
    for (const re of [/(<meta name="description" content=")[^"]*(")/, /(<meta property="og:description" content=")[^"]*(")/, /(<meta name="twitter:description" content=")[^"]*(")/])
      file = file.replace(re, (_, a, b) => a + E(desc) + b);
  }
  if (h1 !== null) {
    if (/<h1[\s>]/.test(file)) {
      file = file.replace(/<h1([^>]*)>[\s\S]*?<\/h1>(\s*<p class="h1-sub">[\s\S]*?<\/p>)?/, (_, at) => {
        at = at.replace(/\s+lang="[^"]*"/, '').replace(/\s+data-alt-[a-z]+="[^"]*"/g, '');
        return `<h1${at}>${h1}</h1>` + (sub ? `<p class="h1-sub">${sub}</p>` : '');
      });
    } else if (/<main id="propertyView"><\/main>/.test(file)) {
      /* ficha dinámica: el JS pinta el H1 real con el título del inmueble; este queda para quien no ejecuta JS */
      file = file.replace('<main id="propertyView"></main>', `<main id="propertyView"><h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">${h1}</h1></main>`);
    } else ERR.push('sin <h1> ni hueco para ' + r.u);
  }
  if (file !== fs.readFileSync(path.join(ROOT, r.f), 'utf8')) { changed++; if (!DRY) fs.writeFileSync(path.join(ROOT, r.f), file, 'utf8'); }
  report.push({ u: r.u, before, after: { title, h1: h1 === null ? r.h1 : strip(h1), desc } });
}
if (ERR.length) { console.error(ERR.join('\n')); process.exit(1); }
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 1));
console.error(`[titulos] ${changed} ficheros ${DRY ? '(simulado) ' : ''}modificados de ${fails.length} con problemas`);
