#!/usr/bin/env node
/* creativos.js — Creativos para redes, uno por propiedad y por formato.
 *
 * POR QUÉ
 * -------
 * Cada vivienda del catálogo necesita su pieza para redes. Hecha a mano se
 * desactualiza en cuanto cambia un precio y cada una sale distinta. Aquí
 * SALEN DE `properties-data.js`, como el schema: si mañana cambia un precio o
 * entra una vivienda, se vuelve a ejecutar y listo.
 *
 * TRES FORMATOS, TRES CONTEXTOS (22-sep-2026, decisión de Jose)
 * ---------------------------------------------------------------
 *   story  1080×1920  Instagram / Facebook Stories — ALTO IMPACTO. El pulgar
 *                     pasa en un segundo: precio gigante, título corto, cinta
 *                     diagonal con la zona, mínimo texto. Oscuro, a sangre.
 *   wa     1080×1920  Estado de WhatsApp — lo ve gente que YA os tiene en el
 *                     móvil. Menos anuncio, más información legible: foto
 *                     enmarcada arriba, bloque CREMA abajo (destaca sobre el
 *                     fondo oscuro de WhatsApp), la frase gancho, los datos y
 *                     un «Pregúntame» en vez de un teléfono que ya tienen.
 *   feed   1080×1080  Instagram / Facebook feed. El editorial completo.
 *
 * Zonas seguras: Stories tapan ~250 px arriba y abajo (barra + respuesta);
 * WhatsApp ~200 px arriba (progreso + nombre) y ~180 px abajo (campo de
 * respuesta). Nada importante ahí.
 *
 * DIRECCIÓN
 * ---------
 * Editorial mediterráneo, desde el logo (casa + olas en oro sobre negro):
 * negro profundo, crema papel, el oro como único acento. Foto real siempre
 * (es una vivienda que existe). Cormorant Garamond + Jost, en assets/fonts/.
 *
 * RENDER
 * ------
 * Playwright pilotando el Chrome instalado (`channel: 'chrome'`): Playwright
 * ya no descarga Chromium para macOS 12.
 *
 * USO
 * ---
 *   node tools/creativos.js                    todos los formatos, todas las «En venta»
 *   node tools/creativos.js story wa           solo esos formatos
 *   node tools/creativos.js 111258127          solo esa referencia
 *   node tools/creativos.js --html             deja también el HTML (para retocar a mano)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.join(__dirname, '..');
const OUT = path.join(RAIZ, 'creativos');
const WEB = 'villasproperties.es';
const TEL = '+34 667 384 965';
const FORMATOS = { feed: [1080, 1080], story: [1080, 1920], wa: [1080, 1920] };

global.window = {};
require(path.join(RAIZ, 'properties-data.js'));
const todas = global.window.VP_PROPERTIES || [];

const args = process.argv.slice(2);
const soloRef = args.find((a) => /^\d{6,}$/.test(a));
const dejarHtml = args.includes('--html');
const pedidos = args.filter((a) => FORMATOS[a]);
const formatos = pedidos.length ? pedidos : Object.keys(FORMATOS);
const props = todas.filter((p) => p.status === 'En venta' && (!soloRef || String(p.ref) === soloRef));
if (!props.length) { console.error('  No hay propiedades que encajen.'); process.exit(1); }

/* ---------- helpers ---------- */
const num = (n) => new Intl.NumberFormat('es-ES', { useGrouping: 'always' }).format(n);
const precio = (n) => num(n) + ' €';
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const b64 = (f) => `data:${f.endsWith('.png') ? 'image/png' : f.endsWith('.webp') ? 'image/webp' : 'font/woff2'};base64,${fs.readFileSync(f).toString('base64')}`;

/* Fuentes y logo embebidos: el HTML es autocontenido, se renderiza sin red. */
const FUENTES = fs.readFileSync(path.join(RAIZ, 'assets/fonts/fonts.local.css'), 'utf8')
  .replace(/url\('([^']+)'\)/g, (_, f) => `url('${b64(path.join(RAIZ, 'assets/fonts', f))}')`);
const LOGO = b64(path.join(RAIZ, 'assets/brand/logo-mark.png'));
const LOGO_DISCO = b64(path.join(RAIZ, 'assets/brand/logo-disc.png'));

/* Zona comercial + municipio, sin repetir si son lo mismo. */
const lugar = (p) => {
  const z = String(p.zone || '').split('(')[0].trim();
  const t = String(p.town || '').trim();
  if (!z || z.toLowerCase() === t.toLowerCase()) return t;
  return `${z} · ${t}`;
};
const zonaCorta = (p) => String(p.zone || p.town || '').split('(')[0].trim();

/* Rasgos que venden; fuera los «Sin …». */
const rasgos = (p, n = 3) => [...(p.equipment || []), ...(p.features || [])]
  .filter((r) => !/^sin\b/i.test(r)).slice(0, n);

/* Solo la letra de la calificación energética (A–G). */
const energia = (p) => ((String(p.energy || '').match(/^\s*([A-G])\b/) || [])[1]) || '';
const plural = (n, s, pl) => `${n} ${n === 1 ? s : pl}`;
const foto = (p, i = 1) => path.join(RAIZ, 'assets/img', p.slug, String(i).padStart(2, '0') + '.webp');

/* Olas del logo como separador (SVG inline, color oro). */
const OLAS = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 18' preserveAspectRatio='none'><path d='M0 9c40-8 60-8 100 0s60 8 100 0 60-8 100 0 60 8 100 0 60-8 100 0 60 8 100 0 60-8 100 0 60 8 100 0 60-8 100 0 60 8 100 0' fill='none' stroke='%23e6bd6a' stroke-width='1.6' opacity='.9'/></svg>")`;
const GRANO = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.9  0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 .55 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>")`;

/* CSS común a los tres formatos */
const BASE = (W, H) => `
${FUENTES}
:root{--negro:#0b0a08;--crema:#f3ead7;--crema-2:#d9cdb3;--crema-3:#efe4cd;--papel:#f6efe1;
  --tinta:#1a1712;--tinta-2:#5c5344;--oro:#e6bd6a;--oro-2:#f5dc9a;--oro-3:#c98f3c;--oro-tinta:#9a6b1f}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--negro);font-family:'Jost',sans-serif;-webkit-font-smoothing:antialiased}
.lienzo{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.serif{font-family:'Cormorant Garamond',serif;font-variant-numeric:lining-nums}
.grano{position:absolute;inset:0;opacity:.14;mix-blend-mode:overlay;pointer-events:none;background-image:${GRANO}}
.olas{height:18px;width:100%;background:${OLAS} left center / 100% 18px no-repeat}
.oro-texto{background:linear-gradient(100deg,var(--oro-2) 0%,var(--oro) 45%,var(--oro-3) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
`;

/* =====================================================================
   FEED 1080×1080 — el editorial completo
   ===================================================================== */
function htmlFeed(p) {
  const [W, H] = FORMATOS.feed;
  const e = energia(p);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${BASE(W, H)}
body{color:var(--crema)}
.foto{position:absolute;inset:0;background:url('${b64(foto(p))}') center 45% / cover no-repeat;transform:scale(1.02)}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.78) 0%,rgba(11,10,8,.42) 26%,rgba(11,10,8,.06) 40%,rgba(11,10,8,.30) 50%,rgba(11,10,8,.80) 66%,rgba(11,10,8,.96) 84%,var(--negro) 100%)}
.cab{position:absolute;left:64px;right:64px;top:60px;display:flex;align-items:flex-start;justify-content:space-between;gap:40px}
.marca{display:flex;align-items:center;gap:18px}.marca img{width:84px;height:84px;filter:drop-shadow(0 6px 18px rgba(0,0,0,.45))}
.marca .n{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:34px;line-height:1}.marca .s{font-size:15px;letter-spacing:.32em;text-transform:uppercase;color:var(--oro);margin-top:8px}
.estado{font-size:15px;letter-spacing:.34em;text-transform:uppercase;border:1.5px solid rgba(243,234,215,.55);padding:12px 18px 10px;border-radius:999px;background:rgba(11,10,8,.28);white-space:nowrap;margin-top:16px}
.cita{position:absolute;left:64px;right:64px;top:200px;max-width:620px;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;font-size:40px;line-height:1.12;text-shadow:0 2px 6px rgba(0,0,0,.65),0 8px 40px rgba(0,0,0,.6)}
.cita::before{content:'';display:block;width:64px;height:2px;background:var(--oro);margin-bottom:22px;box-shadow:0 0 18px rgba(230,189,106,.55)}
.pie{position:absolute;left:64px;right:64px;bottom:64px}
.lugar{font-size:19px;letter-spacing:.36em;text-transform:uppercase;color:var(--oro);margin-bottom:12px}
.titulo{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:60px;line-height:1.02;max-width:760px;text-wrap:balance}
.precio{margin-top:22px;display:flex;align-items:baseline;gap:22px}
.precio b{font-style:italic;font-weight:500;font-size:124px;line-height:.9;letter-spacing:-.02em;filter:drop-shadow(0 4px 22px rgba(0,0,0,.5))}
.precio span{font-size:17px;letter-spacing:.3em;text-transform:uppercase;color:var(--crema-2)}
.olas{margin:24px 0 18px}
.datos{display:flex;gap:44px;align-items:flex-end}.dato b{display:block;font-weight:600;font-size:52px;line-height:1}.dato b i{font-style:normal;font-size:.55em;color:var(--crema-2);margin-left:4px}
.dato span{display:block;font-size:14px;letter-spacing:.3em;text-transform:uppercase;color:var(--oro);margin-top:8px}
.rasgos{list-style:none;display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:20px;font-size:18px;color:var(--crema-2)}.rasgos li::before{content:'—';color:var(--oro);margin-right:8px}
.cta{position:absolute;left:64px;right:64px;bottom:26px;display:flex;justify-content:space-between;font-size:15px;letter-spacing:.24em;text-transform:uppercase;color:var(--crema-2)}.cta b{color:var(--crema);font-weight:500}.ref{font-size:13px;letter-spacing:.2em;color:rgba(243,234,215,.55)}
</style></head><body><div class="lienzo">
<div class="foto"></div><div class="velo"></div><div class="grano"></div>
<header class="cab"><div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div><div class="estado">${esc(p.status)}</div></header>
${p.highlight ? `<p class="cita">${esc(p.highlight)}</p>` : ''}
<section class="pie">
  <div class="lugar">${esc(lugar(p))}</div>
  <h1 class="titulo">${esc(p.title || p.titleShort)}</h1>
  <div class="precio"><b class="serif oro-texto">${esc(precio(p.price))}</b>${p.pricePerM2 ? `<span>${esc(num(p.pricePerM2))} €/m²</span>` : ''}</div>
  <div class="olas"></div>
  <div class="datos">
    <div class="dato"><b class="serif">${p.built}<i>m²</i></b><span>construidos</span></div>
    <div class="dato"><b class="serif">${p.beds}</b><span>${p.beds === 1 ? 'dormitorio' : 'dormitorios'}</span></div>
    <div class="dato"><b class="serif">${p.baths}</b><span>${p.baths === 1 ? 'baño' : 'baños'}</span></div>
    ${e ? `<div class="dato"><b class="serif">${e}</b><span>energía</span></div>` : ''}
  </div>
  ${rasgos(p).length ? `<ul class="rasgos">${rasgos(p).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
</section>
<footer class="cta"><div><b>${WEB}</b> &nbsp;·&nbsp; ${TEL}</div><div class="ref">Ref. ${esc(p.ref)}</div></footer>
</div></body></html>`;
}

/* =====================================================================
   STORY 1080×1920 — ALTO IMPACTO
   Lo que se ve en un segundo: el PRECIO (250 px, oro, itálica) y una foto
   grande. Cinta diagonal con la zona, título corto, una línea de datos.
   ===================================================================== */
function htmlStory(p) {
  const [W, H] = FORMATOS.story;
  const datos = [`${p.built} m²`, plural(p.beds, 'dorm.', 'dorm.'), plural(p.baths, 'baño', 'baños')].join('   ·   ');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${BASE(W, H)}
body{color:var(--crema)}
/* la foto ocupa todo; recorte alto para que respire con el precio abajo */
.foto{position:absolute;inset:0;background:url('${b64(foto(p))}') center 50% / cover no-repeat;transform:scale(1.03)}
/* velo fuerte abajo; arriba solo lo justo para el logo */
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.55) 0%,rgba(11,10,8,.10) 16%,rgba(11,10,8,0) 30%,rgba(11,10,8,.15) 46%,rgba(11,10,8,.75) 60%,rgba(11,10,8,.97) 74%,var(--negro) 100%)}
/* cinta diagonal con la zona: recorre la pieza y rompe la cuadrícula */
/* al 50 % cae sobre el centro de la foto: tapa la marca de agua del portal en casi todas */
.cinta{position:absolute;left:-6%;right:-12%;top:50%;transform:rotate(-6deg);background:var(--oro);color:var(--negro);
  font-size:30px;font-weight:600;letter-spacing:.42em;text-transform:uppercase;padding:22px 0;white-space:nowrap;overflow:hidden;
  box-shadow:0 18px 60px rgba(0,0,0,.55)}
.cinta span{display:inline-block;padding-left:110px}
.marca{position:absolute;left:64px;top:290px;display:flex;align-items:center;gap:20px}
.marca img{width:110px;height:110px;filter:drop-shadow(0 8px 24px rgba(0,0,0,.55))}
.marca .n{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:44px;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.marca .s{font-size:18px;letter-spacing:.34em;text-transform:uppercase;color:var(--crema-2);margin-top:8px;text-shadow:0 2px 10px rgba(0,0,0,.7)}
.estado{position:absolute;right:64px;top:318px;font-size:18px;letter-spacing:.36em;text-transform:uppercase;border:2px solid var(--oro);color:var(--oro);padding:14px 22px 12px;border-radius:999px;background:rgba(11,10,8,.35)}
/* bloque inferior: el precio manda */
.pie{position:absolute;left:64px;right:64px;bottom:300px}
.titulo{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:76px;line-height:1;letter-spacing:-.01em;max-width:900px;text-wrap:balance;text-shadow:0 2px 12px rgba(0,0,0,.5)}
.precio{margin-top:26px;font-style:italic;font-weight:500;font-size:250px;line-height:.82;letter-spacing:-.035em;white-space:nowrap;filter:drop-shadow(0 8px 30px rgba(0,0,0,.6))}
.precio i{font-style:italic;font-size:.42em;vertical-align:baseline;margin-left:10px}
.datos{margin-top:34px;font-size:30px;letter-spacing:.14em;text-transform:uppercase;color:var(--crema)}
.datos b{color:var(--oro);font-weight:500}
.cta{position:absolute;left:64px;right:64px;bottom:210px;display:flex;justify-content:space-between;align-items:center;font-size:19px;letter-spacing:.28em;text-transform:uppercase;color:var(--crema-2)}
.cta b{color:var(--crema);font-weight:500}.cta .ref{font-size:15px;color:rgba(243,234,215,.5);letter-spacing:.2em}
/* flecha «desliza» sutil, propia de stories */
.desliza{position:absolute;left:0;right:0;bottom:262px;text-align:center;font-size:15px;letter-spacing:.4em;text-transform:uppercase;color:rgba(243,234,215,.55)}
</style></head><body><div class="lienzo">
<div class="foto"></div><div class="velo"></div><div class="grano"></div>
<div class="cinta"><span>${esc(zonaCorta(p))} &nbsp;·&nbsp; ${esc(p.town)} &nbsp;·&nbsp; ${esc(zonaCorta(p))} &nbsp;·&nbsp; ${esc(p.town)} &nbsp;·&nbsp; ${esc(zonaCorta(p))} &nbsp;·&nbsp; ${esc(p.town)}</span></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<div class="estado">${esc(p.status)}</div>
<section class="pie">
  <h1 class="titulo">${esc(p.titleShort || p.title)}</h1>
  <div class="precio serif oro-texto">${esc(num(p.price))}<i>€</i></div>
  <div class="datos"><b>${esc(datos)}</b></div>
</section>
<footer class="cta"><div><b>${WEB}</b> &nbsp;·&nbsp; ${TEL}</div><div class="ref">Ref. ${esc(p.ref)}</div></footer>
</div></body></html>`;
}

/* =====================================================================
   WA 1080×1920 — ESTADO DE WHATSAPP
   Lo ve quien ya os tiene en el móvil. Foto enmarcada arriba, bloque crema
   abajo con la frase gancho, precio, datos y «Pregúntame». Sin teléfono:
   ya lo tienen, responden al estado. Zona segura arriba 200 / abajo 180.
   ===================================================================== */
function htmlWa(p) {
  const [W, H] = FORMATOS.wa;
  const e = energia(p);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${BASE(W, H)}
body{background:var(--negro)}
.lienzo{background:var(--negro)}
/* marco superior: la foto en un marco negro fino, como una lámina */
.marco{position:absolute;left:0;right:0;top:0;height:1060px;background:var(--negro)}
.foto{position:absolute;left:44px;right:44px;top:214px;height:800px;background:url('${b64(foto(p))}') center 45% / cover no-repeat;
  box-shadow:0 30px 80px rgba(0,0,0,.6)}
.foto::after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 0 2px rgba(230,189,106,.55)}
/* etiqueta sobre la foto */
.etq{position:absolute;left:44px;top:214px;background:var(--oro);color:var(--negro);font-size:19px;font-weight:600;letter-spacing:.34em;text-transform:uppercase;padding:16px 26px 14px}
.marca{position:absolute;right:44px;top:214px;display:flex;align-items:center;gap:14px;background:rgba(11,10,8,.72);padding:12px 22px 12px 14px;backdrop-filter:blur(6px)}
.marca img{width:56px;height:56px}.marca .n{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:28px;color:var(--crema);line-height:1}
/* bloque crema: información, legible a un palmo */
.papel{position:absolute;left:0;right:0;top:1060px;bottom:0;background:var(--papel);color:var(--tinta);padding:54px 72px 190px;display:flex;flex-direction:column}
.papel::before{content:'';position:absolute;left:0;right:0;top:0;height:6px;background:linear-gradient(90deg,var(--oro-3),var(--oro-2),var(--oro-3))}
.cita{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;font-size:42px;line-height:1.12;color:var(--tinta);max-width:900px;text-wrap:balance}
.titulo{margin-top:20px;font-size:21px;letter-spacing:.3em;text-transform:uppercase;color:var(--oro-tinta);font-weight:600}
.titulo small{display:block;margin-top:8px;font-size:19px;letter-spacing:.12em;text-transform:none;color:var(--tinta-2);font-weight:400}
.precio{margin-top:30px;display:flex;align-items:baseline;gap:22px}
.precio b{font-style:italic;font-weight:600;font-size:118px;line-height:.9;letter-spacing:-.02em;color:var(--tinta)}
.precio span{font-size:18px;letter-spacing:.3em;text-transform:uppercase;color:var(--tinta-2)}
.olas{margin:22px 0 16px;filter:saturate(1.1) brightness(.75)}
.datos{display:flex;gap:52px;align-items:flex-end}
.dato b{display:block;font-weight:600;font-size:54px;line-height:1;color:var(--tinta)}.dato b i{font-style:normal;font-size:.55em;color:var(--tinta-2);margin-left:4px}
.dato span{display:block;font-size:15px;letter-spacing:.3em;text-transform:uppercase;color:var(--oro-tinta);margin-top:8px}
.rasgos{list-style:none;display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:20px;font-size:19px;color:var(--tinta-2)}.rasgos li::before{content:'—';color:var(--oro-3);margin-right:8px}
/* en flujo, empujado al final del bloque: nunca se pisa con lo de arriba */
.cta{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end}
.cta .p{font-size:26px;letter-spacing:.22em;text-transform:uppercase;color:var(--tinta);font-weight:600}
.cta .p small{display:block;font-size:16px;letter-spacing:.2em;color:var(--tinta-2);font-weight:400;margin-top:8px;text-transform:none}
.cta .ref{font-size:14px;letter-spacing:.2em;color:var(--tinta-2)}
</style></head><body><div class="lienzo">
<div class="marco"></div><div class="foto"></div>
<div class="etq">${esc(p.status)}</div>
<div class="marca"><img src="${LOGO_DISCO}" alt=""><div class="n">Villa’s Properties</div></div>
<section class="papel">
  ${p.highlight ? `<p class="cita">${esc(p.highlight)}</p>` : `<p class="cita">${esc(p.title || p.titleShort)}</p>`}
  <div class="titulo">${esc(lugar(p))}<small>${esc(p.title || p.titleShort)}</small></div>
  <div class="precio"><b class="serif">${esc(precio(p.price))}</b>${p.pricePerM2 ? `<span>${esc(num(p.pricePerM2))} €/m²</span>` : ''}</div>
  <div class="olas"></div>
  <div class="datos">
    <div class="dato"><b class="serif">${p.built}<i>m²</i></b><span>construidos</span></div>
    <div class="dato"><b class="serif">${p.beds}</b><span>${p.beds === 1 ? 'dormitorio' : 'dormitorios'}</span></div>
    <div class="dato"><b class="serif">${p.baths}</b><span>${p.baths === 1 ? 'baño' : 'baños'}</span></div>
    ${e ? `<div class="dato"><b class="serif">${e}</b><span>energía</span></div>` : ''}
  </div>
  ${rasgos(p, 3).length ? `<ul class="rasgos">${rasgos(p, 3).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
<footer class="cta"><div class="p">Pregúntame<small>Responde a este estado y te mando la ficha completa</small></div><div class="ref">Ref. ${esc(p.ref)} · ${WEB}</div></footer>
</section>
</div></body></html>`;
}

const PLANTILLAS = { feed: htmlFeed, story: htmlStory, wa: htmlWa };

/* ---------- copy de cada post ---------- */
function copy(p) {
  const r = rasgos(p);
  return [
    `## ${p.titleShort} — ${precio(p.price)}`, ``,
    `${p.highlight || ''}`.trim(), ``,
    `📍 ${lugar(p)}`,
    `🏠 ${p.built} m² · ${plural(p.beds, 'dormitorio', 'dormitorios')} · ${plural(p.baths, 'baño', 'baños')}${r.length ? ' · ' + r.join(' · ') : ''}`,
    `💶 ${precio(p.price)}${p.pricePerM2 ? ` (${num(p.pricePerM2)} €/m²)` : ''}`, ``,
    `Ficha completa y fotos: https://${WEB}/property.html?ref=${p.ref}`,
    `Visitas: ${TEL} (WhatsApp)`, ``,
    `_Estado de WhatsApp (texto corto):_ ${p.titleShort} · ${precio(p.price)} · ${lugar(p)}. Responde y te mando la ficha.`, ``,
    `#TenerifeSur #${String(p.town).replace(/\s+/g, '')} #${String(p.zone || '').split('(')[0].replace(/[^\wáéíóúñ]/gi, '')} #Inmobiliaria #VillasProperties`, ``,
  ].join('\n');
}

/* ---------- render ---------- */
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const copies = [`# Copy de los creativos — Villa’s Properties\n\nGenerado el ${new Date().toISOString().slice(0, 10)} desde properties-data.js.\n`];
  let n = 0;
  for (const p of props) {
    if (!fs.existsSync(foto(p))) { console.warn(`  ⚠ ${p.ref} sin foto 01.webp — saltada`); continue; }
    for (const f of formatos) {
      const [W, H] = FORMATOS[f];
      const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      const doc = PLANTILLAS[f](p);
      if (dejarHtml) fs.writeFileSync(path.join(OUT, `${p.slug}-${f}.html`), doc);
      await page.setContent(doc, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(OUT, `${p.slug}-${f}.png`), type: 'png' });
      await page.screenshot({ path: path.join(OUT, `${p.slug}-${f}.jpg`), type: 'jpeg', quality: 90 });
      await page.close();
      n++;
    }
    copies.push(copy(p));
    console.log(`  ✔ ${p.ref}  ${p.slug}  (${formatos.join(', ')})`);
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'COPY.md'), copies.join('\n'));
  console.log(`\n  ${n} creativos (${props.length} propiedades × ${formatos.length} formatos) en creativos/ · COPY.md`);
})().catch((e) => { console.error('  🔴', e.message); process.exit(1); });
