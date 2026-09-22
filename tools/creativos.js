#!/usr/bin/env node
/* creativos.js — Un creativo por propiedad, para redes.
 *
 * POR QUÉ
 * -------
 * Cada vivienda del catálogo necesita su pieza para Instagram / Facebook /
 * WhatsApp. Hecha a mano se desactualiza en cuanto cambia un precio y cada
 * una sale distinta. Aquí SALEN DE `properties-data.js`, como el schema: si
 * mañana cambia un precio o entra una vivienda, se vuelve a ejecutar y listo.
 *
 * QUÉ SALE
 * --------
 *   creativos/<slug>-feed.png      1080×1080  (Instagram / Facebook feed)
 *   creativos/<slug>-story.png     1080×1920  (Stories / Reels portada / WhatsApp estado)
 *   creativos/<slug>-feed.jpg      lo mismo en JPG al 90 % (para subir; pesa un tercio)
 *   creativos/<slug>-story.jpg
 *   creativos/COPY.md              el texto de cada post, listo para pegar
 *
 * DIRECCIÓN
 * ---------
 * Editorial mediterráneo: negro profundo, crema papel, el oro del logo como
 * único acento. La foto real a sangre (nunca una foto inventada: es una
 * vivienda que existe). El precio enorme en serif itálica. El `highlight` de
 * la ficha como cita de portada. Cormorant Garamond + Jost, descargadas en
 * assets/fonts/ para no depender de Google al renderizar.
 *
 * RENDER
 * ------
 * Playwright pilotando el Chrome instalado (`channel: 'chrome'`): Playwright
 * ya no descarga Chromium para macOS 12, y el Chrome del Mac va perfecto.
 *
 * USO
 * ---
 *   node tools/creativos.js              todas las que están «En venta»
 *   node tools/creativos.js 111258127    solo esa referencia
 *   node tools/creativos.js --html       deja también el HTML de cada una (para retocar a mano)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.join(__dirname, '..');
const OUT = path.join(RAIZ, 'creativos');
const WEB = 'villasproperties.es';
const TEL = '+34 667 384 965';

global.window = {};
require(path.join(RAIZ, 'properties-data.js'));
const todas = global.window.VP_PROPERTIES || [];

const args = process.argv.slice(2);
const soloRef = args.find((a) => /^\d{6,}$/.test(a));
const dejarHtml = args.includes('--html');
const props = todas.filter((p) => p.status === 'En venta' && (!soloRef || String(p.ref) === soloRef));
if (!props.length) { console.error('  No hay propiedades que encajen.'); process.exit(1); }

/* ---------- helpers ---------- */
const precio = (n) => new Intl.NumberFormat('es-ES').format(n) + ' €';
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const b64 = (f) => `data:${f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'font/woff2'};base64,${fs.readFileSync(f).toString('base64')}`;

/* Fuentes y logo embebidos: el HTML es autocontenido, se renderiza desde file:// sin red. */
const FUENTES = fs.readFileSync(path.join(RAIZ, 'assets/fonts/fonts.local.css'), 'utf8')
  .replace(/url\('([^']+)'\)/g, (_, f) => `url('${b64(path.join(RAIZ, 'assets/fonts', f))}')`);
const LOGO = b64(path.join(RAIZ, 'assets/brand/logo-mark.png'));

/* La zona comercial ya viene en el título («…en Costa Adeje»); para el creativo
   se muestra la zona y el municipio, sin repetir si son lo mismo. */
const lugar = (p) => {
  const z = String(p.zone || '').split('(')[0].trim();
  const t = String(p.town || '').trim();
  if (!z || z.toLowerCase() === t.toLowerCase()) return t;
  return `${z} · ${t}`;
};

/* Dos rasgos de la ficha que de verdad diferencian, para la línea de detalles.
   Se saltan los negativos («Sin calefacción», «Sin ascensor»): un creativo vende. */
const rasgos = (p) => [...(p.equipment || []), ...(p.features || [])]
  .filter((r) => !/^sin\b/i.test(r))
  .slice(0, 3);

const foto = (p) => path.join(RAIZ, 'assets/img', p.slug, '01.webp');

/* ---------- plantilla ---------- */
function html(p, formato) {
  const story = formato === 'story';
  const W = 1080, H = story ? 1920 : 1080;
  const detalles = rasgos(p).map((r) => `<li>${esc(r)}</li>`).join('');
  // Solo la letra de la calificación (A–G). «Pendiente», «Exento» o un consumo suelto no se muestran.
  const energia = ((String(p.energy || '').match(/^\s*([A-G])\b/) || [])[1]) || '';
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<style>
${FUENTES}
:root{
  --negro:#0b0a08; --tinta:#161410; --crema:#f3ead7; --crema-2:#d9cdb3;
  --oro:#e6bd6a; --oro-2:#f5dc9a; --oro-3:#c98f3c; --humo:rgba(11,10,8,.55);
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--negro);color:var(--crema);
  font-family:'Jost',sans-serif;-webkit-font-smoothing:antialiased}
.lienzo{position:relative;width:${W}px;height:${H}px;overflow:hidden}

/* foto a sangre, ligeramente más grande para que respire */
.foto{position:absolute;inset:0;background:url('${b64(foto(p))}') center ${story ? '38%' : '45%'} / cover no-repeat;
  transform:scale(1.02)}
/* velo: arriba apenas, abajo profundo, para que el texto se lea sobre cualquier foto */
.velo{position:absolute;inset:0;background:
  linear-gradient(180deg, rgba(11,10,8,.78) 0%, rgba(11,10,8,.42) ${story ? '24%' : '26%'}, rgba(11,10,8,.06) ${story ? '36%' : '40%'},
    rgba(11,10,8,.30) ${story ? '46%' : '50%'}, rgba(11,10,8,.80) ${story ? '60%' : '66%'}, rgba(11,10,8,.96) ${story ? '76%' : '84%'}, var(--negro) 100%)}
/* grano: la foto de portal es demasiado lisa; el grano la vuelve papel */
.grano{position:absolute;inset:0;opacity:.14;mix-blend-mode:overlay;pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.9  0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 .55 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>")}

/* cabecera: logo + marca, y la cita a la derecha */
.cab{position:absolute;left:64px;right:64px;top:${story ? 300 : 60}px;display:flex;align-items:flex-start;justify-content:space-between;gap:40px}
.marca{display:flex;align-items:center;gap:18px}
.marca img{width:${story ? 96 : 84}px;height:${story ? 96 : 84}px;filter:drop-shadow(0 6px 18px rgba(0,0,0,.45))}
.marca .n{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:${story ? 40 : 34}px;letter-spacing:.01em;line-height:1;color:var(--crema)}
.marca .s{font-size:${story ? 17 : 15}px;letter-spacing:.32em;text-transform:uppercase;color:var(--oro);margin-top:8px}
.estado{font-size:${story ? 17 : 15}px;letter-spacing:.34em;text-transform:uppercase;color:var(--crema);
  border:1.5px solid rgba(243,234,215,.55);padding:12px 18px 10px;border-radius:999px;backdrop-filter:blur(6px);background:rgba(11,10,8,.28);white-space:nowrap;margin-top:${story ? 22 : 16}px}

/* cita editorial: el highlight de la ficha */
.cita{position:absolute;left:64px;right:64px;top:${story ? 470 : 200}px;max-width:${story ? 760 : 620}px;
  font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;font-size:${story ? 52 : 40}px;line-height:1.12;color:var(--crema);
  text-shadow:0 2px 6px rgba(0,0,0,.65), 0 8px 40px rgba(0,0,0,.6)}
.cita::before{content:'';display:block;width:64px;height:2px;background:var(--oro);margin-bottom:22px;box-shadow:0 0 18px rgba(230,189,106,.55)}

/* bloque inferior */
.pie{position:absolute;left:64px;right:64px;bottom:${story ? 250 : 64}px}
.lugar{font-size:${story ? 22 : 19}px;letter-spacing:.36em;text-transform:uppercase;color:var(--oro);margin-bottom:${story ? 18 : 12}px}
.titulo{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:${story ? 74 : 60}px;line-height:1.02;letter-spacing:-.005em;color:var(--crema);
  max-width:${story ? 900 : 760}px;text-wrap:balance}
.precio{margin-top:${story ? 30 : 22}px;display:flex;align-items:baseline;gap:22px}
.precio b{font-family:'Cormorant Garamond',serif;font-variant-numeric:lining-nums;font-style:italic;font-weight:500;font-size:${story ? 150 : 124}px;line-height:.9;letter-spacing:-.02em;
  background:linear-gradient(100deg,var(--oro-2) 0%,var(--oro) 45%,var(--oro-3) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 4px 22px rgba(0,0,0,.5))}
.precio span{font-size:${story ? 20 : 17}px;letter-spacing:.3em;text-transform:uppercase;color:var(--crema-2)}

/* olas del logo como separador */
.olas{margin:${story ? 34 : 24}px 0 ${story ? 26 : 18}px;height:18px;width:100%;
  background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 18' preserveAspectRatio='none'><path d='M0 9c40-8 60-8 100 0s60 8 100 0 60-8 100 0 60 8 100 0 60-8 100 0 60 8 100 0 60-8 100 0 60 8 100 0 60-8 100 0 60 8 100 0' fill='none' stroke='%23e6bd6a' stroke-width='1.6' opacity='.9'/></svg>") left center / 100% 18px no-repeat}

.datos{display:flex;gap:${story ? 56 : 44}px;align-items:flex-end}
.dato b{display:block;font-family:'Cormorant Garamond',serif;font-variant-numeric:lining-nums;font-weight:600;font-size:${story ? 64 : 52}px;line-height:1;color:var(--crema)}
.dato b i{font-style:normal;font-size:.55em;color:var(--crema-2);margin-left:4px}
.dato span{display:block;font-size:${story ? 16 : 14}px;letter-spacing:.3em;text-transform:uppercase;color:var(--oro);margin-top:8px}
.rasgos{list-style:none;display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:${story ? 30 : 20}px;font-size:${story ? 21 : 18}px;color:var(--crema-2);letter-spacing:.02em}
.rasgos li::before{content:'—';color:var(--oro);margin-right:8px}

.cta{position:absolute;left:64px;right:64px;bottom:${story ? 160 : 26}px;display:flex;justify-content:space-between;align-items:center;
  font-size:${story ? 19 : 15}px;letter-spacing:.24em;text-transform:uppercase;color:var(--crema-2)}
.cta b{color:var(--crema);font-weight:500}
.ref{font-family:'Jost';font-size:${story ? 15 : 13}px;letter-spacing:.2em;color:rgba(243,234,215,.55)}
</style></head>
<body><div class="lienzo">
  <div class="foto"></div><div class="velo"></div><div class="grano"></div>
  <header class="cab">
    <div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
    <div class="estado">${esc(p.status)}</div>
  </header>
  ${p.highlight ? `<p class="cita">${esc(p.highlight)}</p>` : ''}
  <section class="pie">
    <div class="lugar">${esc(lugar(p))}</div>
    <h1 class="titulo">${esc(p.title || p.titleShort)}</h1>
    <div class="precio"><b>${esc(precio(p.price))}</b>${p.pricePerM2 ? `<span>${esc(new Intl.NumberFormat('es-ES',{useGrouping:'always'}).format(p.pricePerM2))} €/m²</span>` : ''}</div>
    <div class="olas"></div>
    <div class="datos">
      <div class="dato"><b>${p.built}<i>m²</i></b><span>construidos</span></div>
      <div class="dato"><b>${p.beds}</b><span>${p.beds === 1 ? 'dormitorio' : 'dormitorios'}</span></div>
      <div class="dato"><b>${p.baths}</b><span>${p.baths === 1 ? 'baño' : 'baños'}</span></div>
      ${energia ? `<div class="dato"><b>${energia}</b><span>energía</span></div>` : ''}
    </div>
    ${detalles ? `<ul class="rasgos">${detalles}</ul>` : ''}
  </section>
  <footer class="cta"><div><b>${WEB}</b> &nbsp;·&nbsp; ${TEL}</div><div class="ref">Ref. ${esc(p.ref)}</div></footer>
</div></body></html>`;
}

/* ---------- copy de cada post ---------- */
function copy(p) {
  const r = rasgos(p);
  return [
    `## ${p.titleShort} — ${precio(p.price)}`,
    ``,
    `${p.highlight || ''}`.trim(),
    ``,
    `📍 ${lugar(p)}`,
    `🏠 ${p.built} m² · ${p.beds} ${p.beds === 1 ? 'dormitorio' : 'dormitorios'} · ${p.baths} ${p.baths === 1 ? 'baño' : 'baños'}${r.length ? ' · ' + r.join(' · ') : ''}`,
    `💶 ${precio(p.price)}${p.pricePerM2 ? ` (${new Intl.NumberFormat('es-ES',{useGrouping:'always'}).format(p.pricePerM2)} €/m²)` : ''}`,
    ``,
    `Ficha completa y fotos: https://${WEB}/property.html?ref=${p.ref}`,
    `Visitas: ${TEL} (WhatsApp)`,
    ``,
    `#TenerifeSur #${String(p.town).replace(/\s+/g, '')} #${String(p.zone || '').split('(')[0].replace(/[^\wáéíóúñ]/gi, '')} #Inmobiliaria #VillasProperties #${p.type === 'Apartamento' ? 'Apartamento' : 'Casa'}EnVenta`,
    ``,
  ].join('\n');
}

/* ---------- render ---------- */
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const copies = [`# Copy de los creativos — Villa’s Properties\n\nGenerado el ${new Date().toISOString().slice(0, 10)} desde properties-data.js. Un bloque por propiedad, listo para pegar.\n`];
  let n = 0;
  for (const p of props) {
    if (!fs.existsSync(foto(p))) { console.warn(`  ⚠ ${p.ref} sin foto 01.webp — saltada`); continue; }
    for (const formato of ['feed', 'story']) {
      const W = 1080, H = formato === 'story' ? 1920 : 1080;
      const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      const doc = html(p, formato);
      if (dejarHtml) fs.writeFileSync(path.join(OUT, `${p.slug}-${formato}.html`), doc);
      await page.setContent(doc, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(OUT, `${p.slug}-${formato}.png`), type: 'png' });
      await page.screenshot({ path: path.join(OUT, `${p.slug}-${formato}.jpg`), type: 'jpeg', quality: 90 });
      await page.close();
      n++;
    }
    copies.push(copy(p));
    console.log(`  ✔ ${p.ref}  ${p.slug}`);
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'COPY.md'), copies.join('\n'));
  console.log(`\n  ${n} creativos (${n / 2} propiedades × feed + story) en creativos/ · COPY.md con el texto de cada post`);
})().catch((e) => { console.error('  🔴', e.message); process.exit(1); });
