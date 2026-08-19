#!/usr/bin/env node
'use strict';

/**
 * abrir-indexacion.cjs — El interruptor del lanzamiento.
 *
 * POR QUÉ EXISTE
 * --------------
 * Hoy esta web es invisible para Google a propósito, y lo es por CUATRO frenos
 * distintos repartidos por todo el repositorio:
 *
 *   1. `noindex` en las 25 páginas
 *   2. `robots.txt` con Disallow: / para todos, bots de IA incluidos
 *   3. la línea `Sitemap:` comentada
 *   4. 246 referencias a josecrea.github.io (canonical, og:url, sitemap,
 *      llms.txt y el JSON-LD)
 *
 * El día del lanzamiento hay que soltar los cuatro. Olvidar uno solo tiene
 * consecuencias que no avisan: si queda el `noindex`, la web sigue sin
 * aparecer y nadie se entera en semanas; y si quedan las URLs de la preview,
 * lo que se indexa es el dominio equivocado —el SEO se lo lleva github.io y
 * recuperarlo obliga a redirigir y a perder autoridad por el camino—.
 *
 * Por eso esto no es una lista de pasos en un documento: es un comando.
 *
 * USO
 * ---
 *   node tools/abrir-indexacion.cjs --dominio=https://villasproperties.es
 *        → SIMULACRO: dice qué cambiaría y no toca nada
 *
 *   node tools/abrir-indexacion.cjs --dominio=https://villasproperties.es --aplicar
 *        → lo hace
 *
 * Conviene ejecutarlo con el árbol de git limpio: así `git diff` enseña
 * exactamente lo que ha cambiado y `git checkout .` lo deshace entero.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const PREVIEW = 'https://josecrea.github.io/villasproperties-preview';

const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').split('=').slice(1).join('=');
const APLICAR = process.argv.includes('--aplicar');
const DOMINIO = (arg('dominio') || '').replace(/\/+$/, '');

if (!DOMINIO) {
  console.error('Falta --dominio=https://villasproperties.es');
  process.exit(1);
}
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(DOMINIO)) {
  console.error(`Dominio no válido: ${DOMINIO}`);
  console.error('Se espera algo como https://villasproperties.es (con https y sin barra final).');
  process.exit(1);
}

const paginas = fs.readdirSync(RAIZ).filter((f) => f.endsWith('.html')).sort();
const cambios = [];

const anota = (fichero, que, n) => { if (n > 0) cambios.push({ fichero, que, n }); };

/* ── 1. Fuera el noindex ────────────────────────────────────────────────────
   Se quita la etiqueta entera en vez de cambiar "noindex" por "index": dejar
   un <meta robots> vacío o a medias confunde más que no tenerlo. Sin etiqueta,
   el comportamiento por defecto ya es indexar. */
const quitarNoindex = (s) => {
  let n = 0;
  const out = s.replace(/[ \t]*<meta\s+name=["']robots["'][^>]*noindex[^>]*>\n?/gi, () => { n += 1; return ''; });
  return [out, n];
};

/* ── 2. El dominio ─────────────────────────────────────────────────────────
   Cubre las tres formas en que aparece: con /villasproperties-preview, el
   host suelto y las rutas relativas del sitemap. */
const cambiarDominio = (s) => {
  let n = 0;
  const cuenta = (m) => { n += 1; return m; };
  let out = s.split(PREVIEW).join(DOMINIO);
  n += (s.length - out.length !== 0 || s.includes(PREVIEW))
    ? (s.match(new RegExp(PREVIEW.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;
  // por si en algún sitio quedó el host sin la subcarpeta
  const sueltoRe = /https:\/\/josecrea\.github\.io/g;
  out = out.replace(sueltoRe, () => { cuenta(); return DOMINIO; });
  return [out, n];
};

for (const f of paginas) {
  const ruta = path.join(RAIZ, f);
  let s = fs.readFileSync(ruta, 'utf8');
  const original = s;
  let n;

  [s, n] = quitarNoindex(s); anota(f, 'noindex fuera', n);
  [s, n] = cambiarDominio(s); anota(f, 'dominio', n);

  if (s !== original && APLICAR) fs.writeFileSync(ruta, s, 'utf8');
}

/* ── 3. sitemap.xml y llms.txt ────────────────────────────────────────────── */
for (const f of ['sitemap.xml', 'llms.txt']) {
  const ruta = path.join(RAIZ, f);
  if (!fs.existsSync(ruta)) continue;
  let s = fs.readFileSync(ruta, 'utf8');
  const original = s;
  const [out, n] = cambiarDominio(s);
  s = out;
  anota(f, 'dominio', n);
  if (s !== original && APLICAR) fs.writeFileSync(ruta, s, 'utf8');
}

/* ── 4. robots.txt ─────────────────────────────────────────────────────────
   Se reescribe entero en lugar de parchearlo: el de la preview es un bloqueo
   general y lo que hace falta es lo contrario. Los bots de IA van nombrados
   uno a uno y con Allow explícito, que es lo que permite ser citado en
   ChatGPT, Perplexity o Google AI Overviews. Google-Extended y
   Applebot-Extended no afectan al buscador: solo al uso para entrenamiento. */
const ROBOTS = `# Villa's Properties — ${DOMINIO}
User-agent: *
Allow: /

# Crawlers de IA, nombrados de forma explícita: se les permite el acceso
# porque de ahí sale la posibilidad de ser citados en las respuestas.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${DOMINIO}/sitemap.xml
`;

const rutaRobots = path.join(RAIZ, 'robots.txt');
const robotsViejo = fs.existsSync(rutaRobots) ? fs.readFileSync(rutaRobots, 'utf8') : '';
if (robotsViejo !== ROBOTS) {
  anota('robots.txt', 'reescrito: Allow + Sitemap', 1);
  if (APLICAR) fs.writeFileSync(rutaRobots, ROBOTS, 'utf8');
}

/* ── Parte ────────────────────────────────────────────────────────────────── */
const porQue = cambios.reduce((acc, c) => {
  acc[c.que] = (acc[c.que] || 0) + c.n; return acc;
}, {});

console.log(`\n${APLICAR ? 'APLICANDO' : 'SIMULACRO (nada se ha tocado)'} · destino: ${DOMINIO}\n`);
for (const [que, n] of Object.entries(porQue)) console.log(`   ${String(n).padStart(4)}  ${que}`);
console.log(`\n   ${cambios.length} ficheros afectados`);

if (!APLICAR) {
  console.log('\nPara hacerlo de verdad, repite con --aplicar');
  console.log('(mejor con el árbol de git limpio: así `git diff` enseña todo y');
  console.log(' `git checkout .` lo deshace entero).');
  process.exit(0);
}

/* Verificación: que no quede ni un freno puesto. Se comprueba sobre el disco
   ya escrito, no sobre lo que este script cree que ha hecho. */
console.log('\n— Comprobación —');
let fallos = 0;
const ok = (c, t) => { console.log(`   ${c ? '✔' : '✘'} ${t}`); if (!c) fallos += 1; };

const conNoindex = paginas.filter((f) => /noindex/i.test(fs.readFileSync(path.join(RAIZ, f), 'utf8')));
ok(conNoindex.length === 0, `sin noindex${conNoindex.length ? ` — QUEDAN: ${conNoindex.join(', ')}` : ''}`);

const todos = [...paginas, 'sitemap.xml', 'llms.txt', 'robots.txt']
  .filter((f) => fs.existsSync(path.join(RAIZ, f)));
const conPreview = todos.filter((f) => fs.readFileSync(path.join(RAIZ, f), 'utf8').includes('josecrea.github.io'));
ok(conPreview.length === 0, `sin rastro del dominio de preview${conPreview.length ? ` — QUEDAN: ${conPreview.join(', ')}` : ''}`);

const r = fs.readFileSync(rutaRobots, 'utf8');
ok(!/^Disallow:\s*\/\s*$/m.test(r), 'robots.txt ya no bloquea');
ok(/^Sitemap:\s*https/m.test(r), 'robots.txt declara el sitemap');
ok(fs.readFileSync(path.join(RAIZ, 'sitemap.xml'), 'utf8').includes(DOMINIO), 'sitemap apunta al dominio nuevo');

console.log(fallos
  ? `\n🔴 ${fallos} comprobaciones fallidas: NO publicar todavía.`
  : '\n✅ Indexación abierta. Queda: dar de alta el dominio en Search Console y'
    + '\n   enviar el sitemap, y comprobar que el hosting sirve ese dominio.');
process.exit(fallos ? 1 : 0);
