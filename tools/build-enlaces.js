#!/usr/bin/env node
/* build-enlaces.js — enlazado interno ESTÁTICO entre blog, landings de municipio,
   valoración y herramientas (auditoría V2, 27-oct-2026).

   POR QUÉ: los artículos del blog solo recibían 1-3 enlaces (el «Seguir leyendo» de
   cada post se pinta por JS y los rastreadores no lo cuentan), las landings no enlazaban
   a ningún artículo y tenerife.html / finance-lab.html no recibían ninguno.

   QUÉ: inyecta un bloque `<!-- enlaces:start --> … <!-- enlaces:end -->` justo antes de
   </main> en post-*.html, comprar-casa-*.html y vender-casa-*.html. Es idempotente y no
   toca nada más. Los textos de enlace salen del <title> de cada página destino.

   Uso:  node tools/build-enlaces.js           (escribe)
         node tools/build-enlaces.js --check   (sale 1 si algo está desfasado) */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CHECK = process.argv.includes('--check');
const M0 = '<!-- enlaces:start (generado por tools/build-enlaces.js: no editar a mano) -->';
const M1 = '<!-- enlaces:end -->';

const todos = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();
const leer = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const tituloDe = (f) => {
  const t = (leer(f).match(/<title>([\s\S]*?)<\/title>/) || [, f])[1].trim()
    .replace(/\s*[—|]\s*Villa’s Properties$/, '');
  return t.replace(/&amp;/g, '&');
};
const nombreCorto = (f) => tituloDe(f).split(':')[0]; // «Comprar casa en Adeje»

/* Artículos por intención. «anuncio-vs-escritura» sirve a las dos. */
const P = (s) => `post-${s}.html`;
const POSTS_COMPRA = [
  'mapa-metro-cuadrado', 'anuncio-vs-escritura', 'donde-se-vende-de-verdad',
  'invertir-en-tenerife-por-que-la-seguridad-juridica-es-mas-importante-que-la-rentabilidad-3',
  'el-precio-de-la-vivienda-en-espana-se-ha-incrementado-un-45-en-los-ultimos-diez-anos-7',
  'de-adeje-al-norte-las-zonas-de-tenerife-que-marcaran-la-revalorizacion-en-2026-4',
  'estudio-anual-del-mercado-inmobiliario-1', 'suelo-urbano-canarias-125000-viviendas',
].map(P);
const POSTS_VENTA = [
  'como-valorar-tu-vivienda', 'vender-casa-tenerife-sur', 'por-que-tu-casa-no-se-vende-en-tenerife-8',
  'como-vender-una-casa-5', 'como-vender-una-casa-fase-2-6',
  'cuanto-vale-realmente-mi-villa-en-tenerife-la-clave-esta-en-la-precision-no-en-la-prisa-2',
  'anuncio-vs-escritura',
].map(P);
const COMPRAR = todos.filter((f) => /^comprar-casa-/.test(f));
const VENDER = todos.filter((f) => /^vender-casa-/.test(f));

const toma = (lista, desde, n, excluye) => {
  const r = [];
  for (let i = 0; r.length < n && i < lista.length * 2; i += 1) {
    const f = lista[(desde + i) % lista.length];
    if (f !== excluye && !r.includes(f)) r.push(f);
  }
  return r;
};

const enlacesDe = (file) => {
  const out = [];
  let eye = 'Guías para decidir';
  if (/^comprar-casa-/.test(file)) {
    const i = COMPRAR.indexOf(file);
    toma(POSTS_COMPRA, i * 3, 3, null).forEach((f) => out.push(f));
    out.push('tenerife.html', 'finance-lab.html', 'valuation.html', 'insights.html');
  } else if (/^vender-casa-/.test(file)) {
    const i = VENDER.indexOf(file);
    toma(POSTS_VENTA, i * 3, 3, null).forEach((f) => out.push(f));
    out.push('valuation.html', 'insights.html');
  } else if (/^post-/.test(file)) {
    eye = 'Más guías y herramientas';
    const compra = POSTS_COMPRA.includes(file);
    const lista = compra ? POSTS_COMPRA : (POSTS_VENTA.includes(file) ? POSTS_VENTA : POSTS_COMPRA);
    const j = Math.max(0, lista.indexOf(file));
    toma(lista, j + 1, 3, file).forEach((f) => out.push(f));
    const munis = compra || !POSTS_VENTA.includes(file) ? COMPRAR : VENDER;
    toma(munis, todos.indexOf(file) * 2, 3, null).forEach((f) => out.push(f));
    out.push('valuation.html', 'properties.html');
    if (compra) out.push('finance-lab.html');
  }
  return { eye, links: [...new Set(out)].filter((f) => f !== file && todos.includes(f)) };
};

const texto = (f) => (/^(comprar|vender)-casa-/.test(f) ? nombreCorto(f) : tituloDe(f));
const bloque = (file) => {
  const { eye, links } = enlacesDe(file);
  if (!links.length) return '';
  const li = links.map((f) => `      <li><a href="${f}">${texto(f)}</a></li>`).join('\n');
  return `${M0}
  <section class="section tight"><div class="wrap">
    <div class="eye">${eye}</div>
    <ul class="ptags" style="margin-top:16px">
${li}
    </ul>
  </div></section>
  ${M1}
`;
};

const RE = new RegExp(`\\n?[ \\t]*${M0.replace(/[()]/g, '\\$&')}[\\s\\S]*?${M1}\\n?`);
let cambios = 0;
todos.filter((f) => /^(post|comprar-casa|vender-casa)-/.test(f)).forEach((f) => {
  const html = leer(f);
  if (!html.includes('</main>')) return;
  const limpio = html.replace(RE, '\n');
  const nuevo = limpio.replace('</main>', `${bloque(f)}</main>`);
  if (nuevo !== html) { cambios += 1; if (!CHECK) fs.writeFileSync(path.join(ROOT, f), nuevo, 'utf8'); }
});
console.log(`[enlaces] ${CHECK ? (cambios ? `DESFASADO (${cambios} páginas)` : 'al día') : `${cambios} páginas actualizadas`}`);
if (CHECK && cambios) process.exit(1);
