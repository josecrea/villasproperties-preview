#!/usr/bin/env node
/* nuevo-post.js — Publicar un artículo sin CMS, sin build y sin npm install.
 *
 * POR QUÉ ASÍ
 * -----------
 * La web es estática a propósito: no hay servidor, no hay base de datos y no
 * hay dependencias que actualizar. El precio de eso sería tener que escribir a
 * mano el HTML de cada artículo, copiar la cabecera, el schema, el canonical y
 * acordarse de darlo de alta en el índice y en el sitemap. Se olvida uno y el
 * artículo queda huérfano o sin indexar.
 *
 * Este script hace justo eso: coge un fichero de texto y deja el artículo
 * publicable, registrado y enlazado.
 *
 * USO
 * ---
 *   node tools/nuevo-post.js borrador.md
 *
 * El borrador es texto plano con una cabecera sencilla:
 *
 *   titulo: Lo que nadie te cuenta de comprar sobre plano
 *   categoria: Compra
 *   entradilla: Una frase que resuma el artículo y dé ganas de entrar.
 *   lectura: 6 min
 *   ---
 *   ## Primer apartado
 *
 *   Párrafo normal. Se admite **negrita** y [enlaces](https://ejemplo.com).
 *
 *   > Una cita destacada.
 *
 *   ## Segundo apartado
 *   ...
 *
 * Lo que genera:
 *   1. post-<slug>.html con la misma cabecera, estilos y scripts que el resto
 *   2. el alta en blog-data.js, para que salga en Insights y en "seguir leyendo"
 *   3. la entrada en sitemap.xml
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DOMINIO = 'https://josecrea.github.io/villasproperties-preview';

const entrada = process.argv[2];
if (!entrada) {
  console.error('Uso: node tools/nuevo-post.js borrador.md');
  process.exit(1);
}

const bruto = fs.readFileSync(entrada, 'utf8');
const corte = bruto.indexOf('\n---');
if (corte < 0) {
  console.error('Falta la línea --- que separa la cabecera del cuerpo.');
  process.exit(1);
}

const meta = {};
bruto.slice(0, corte).split('\n').forEach((l) => {
  const i = l.indexOf(':');
  if (i > 0) meta[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim();
});
const cuerpo = bruto.slice(corte + 4).trim();

for (const req of ['titulo', 'categoria', 'entradilla']) {
  if (!meta[req]) { console.error(`Falta "${req}" en la cabecera.`); process.exit(1); }
}

const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const slug = meta.slug || slugify(meta.titulo);
const fichero = `post-${slug}.html`;
const hoy = new Date().toISOString().slice(0, 10);

/* Escapes: el borrador lo escribe una persona y puede llevar < o &. */
const E = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Marcado mínimo: encabezados, párrafos, citas, listas, negrita y enlaces.
   No se usa una librería de Markdown a propósito — sería la primera
   dependencia de un sitio que no tiene ninguna. */
const aHtml = (txt) => txt.split(/\n{2,}/).map((bloque) => {
  const b = bloque.trim();
  if (!b) return '';
  if (b.startsWith('## ')) return `<h2>${E(b.slice(3))}</h2>`;
  if (b.startsWith('### ')) return `<h3>${E(b.slice(4))}</h3>`;
  if (b.startsWith('> ')) return `<p class="pullq">${enLinea(b.slice(2))}</p>`;
  if (/^[-*] /.test(b)) {
    const li = b.split('\n').map((l) => `<li>${enLinea(l.replace(/^[-*] /, ''))}</li>`).join('');
    return `<ul class="post-list">${li}</ul>`;
  }
  return `<p>${enLinea(b)}</p>`;
}).filter(Boolean).join('\n    ');

function enLinea(t) {
  return E(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\[([^\]]+)\]\(([a-z0-9-]+\.html[^)]*)\)/g, '<a href="$2">$1</a>');
}

/* La cabecera se copia de un post existente para no duplicar la lista de
   scripts ni el orden: si mañana se añade uno, este script lo hereda solo. */
const modelo = fs.readFileSync(path.join(RAIZ, 'post-mapa-metro-cuadrado.html'), 'utf8');
const scripts = (modelo.match(/<script src="[^"]+"[^>]*><\/script>/g) || []).join('');
const cssTag = (modelo.match(/<link rel="stylesheet" href="site\.css[^"]*">/) || [''])[0];
/* La cabecera y el pie van escritos en el HTML (shell.js solo reconstruye el
   nav después), así que se copian del modelo tal cual. Con un <div> vacío el
   artículo salía sin cabecera ni pie. */
const cabecera = (modelo.match(/<header[\s\S]*?<\/header>/) || [''])[0];
const pie = (modelo.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
const readbar = (modelo.match(/<div class="readbar"[^>]*><\/div>/) || [''])[0];

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${E(meta.titulo)} — Villa’s Properties</title>
<meta name="description" content="${E(meta.entradilla)}">
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="${DOMINIO}/${fichero}">
<meta property="og:type" content="article">
<meta property="og:title" content="${E(meta.titulo)}">
<meta property="og:description" content="${E(meta.entradilla)}">
<meta property="og:url" content="${DOMINIO}/${fichero}">
<meta property="og:image" content="${DOMINIO}/assets/brand/tenerife-mercado.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${E(meta.titulo)}">
<meta name="twitter:image" content="${DOMINIO}/assets/brand/tenerife-mercado.webp">
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Article',
  headline: meta.titulo, description: meta.entradilla,
  datePublished: meta.fecha || hoy, dateModified: meta.fecha || hoy,
  author: { '@type': 'Organization', name: "Villa's Properties" },
  publisher: { '@type': 'Organization', name: "Villa's Properties" },
  mainEntityOfPage: `${DOMINIO}/${fichero}`,
})}</script>
${cssTag}
</head>
<body>
${readbar}
${cabecera}
<main>
  <section class="pagehero"><div class="wrap">
    <div class="eye">${E(meta.categoria)} · ${meta.lectura || '5 min'}</div>
    <h1>${E(meta.titulo)}</h1>
    <p class="pagelede">${E(meta.entradilla)}</p>
  </div></section>

  <section class="section"><div class="wrap post-body">
    ${aHtml(cuerpo)}
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="eye">Seguir leyendo</div>
    <div class="insights" id="masPosts" data-stagger-group></div>
  </div></section>
</main>
${pie}
${scripts}
</body>
</html>
`;

fs.writeFileSync(path.join(RAIZ, fichero), html, 'utf8');

/* Alta en el índice: sin esto el artículo existe pero no lo enlaza nadie. */
const rutaIdx = path.join(RAIZ, 'blog-data.js');
let idx = fs.readFileSync(rutaIdx, 'utf8');
if (!idx.includes(fichero)) {
  const entradaIdx = `  {
    slug: '${fichero}',
    category: '${meta.categoria}',
    title: ${JSON.stringify(meta.titulo)},
    dek: ${JSON.stringify(meta.entradilla)},
    date: '${meta.fecha || hoy}',
    read: '${meta.lectura || '5 min'}',
    accent: 'atlantic',
    figure: 'chart',
  },
`;
  idx = idx.replace('window.VP_POSTS = [\n', `window.VP_POSTS = [\n${entradaIdx}`);
  fs.writeFileSync(rutaIdx, idx, 'utf8');
}

/* Y en el sitemap, o Google no se entera de que existe. */
const rutaSm = path.join(RAIZ, 'sitemap.xml');
if (fs.existsSync(rutaSm)) {
  let sm = fs.readFileSync(rutaSm, 'utf8');
  if (!sm.includes(fichero)) {
    sm = sm.replace('</urlset>',
      `  <url><loc>${DOMINIO}/${fichero}</loc><lastmod>${hoy}</lastmod><priority>0.7</priority></url>\n</urlset>`);
    fs.writeFileSync(rutaSm, sm, 'utf8');
  }
}

console.log(`✓ ${fichero}`);
console.log('  · dado de alta en blog-data.js (sale en Insights y en "seguir leyendo")');
console.log('  · añadido a sitemap.xml');
console.log('\nAhora:  ./tools/sellar.sh   y revísalo en local antes de publicar.');
