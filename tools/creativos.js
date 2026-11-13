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
 * (es una vivienda que existe). EB Garamond + Jost, en assets/fonts/.
 *
 * TEXTO (22-sep-2026, «los textos están flojos»)
 * ----------------------------------------------
 * El texto NO sale de la ficha: la ficha describe, el creativo vende. Cada
 * vivienda tiene su copy en `creativos-copy.js` (kicker · gancho · cita ·
 * pruebas · post) escrito para el pulgar y con las reglas de voz de Villa’s.
 * Si una vivienda no tiene copy se usa la ficha y se AVISA al final: ese
 * creativo sale, pero flojo, y hay que escribirle el suyo.
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
/* La referencia es el argumento que no es ni un formato ni una opción. Antes se pedían
 * 6 dígitos o más y el Biltmore —ref 14541— no colaba: el comando se entendía como
 * "todas" y regeneraba el catálogo entero en silencio. Tampoco vale exigir que sea un
 * número: las referencias internas no lo son. */
const soloRef = args.find((a) => !FORMATOS[a] && !a.startsWith('--'));
const dejarHtml = args.includes('--html');
const pedidos = args.filter((a) => FORMATOS[a]);
const formatos = pedidos.length ? pedidos : Object.keys(FORMATOS);
const props = todas.filter((p) => p.status === 'En venta' && (!soloRef || String(p.ref) === soloRef));
if (!props.length) { console.error('  No hay propiedades que encajen.'); process.exit(1); }

/* ---------- helpers ---------- */
const num = (n) => new Intl.NumberFormat('es-ES', { useGrouping: 'always' }).format(n);
const precio = (n) => (Number.isFinite(n) && n > 0 ? num(n) + ' €' : 'Precio a consultar');
/* Una vivienda recién captada puede no tener precio cerrado, municipio ni coordenadas.
 * Pintar «0 €» o un hueco entre separadores no es neutral: parece un error de la
 * agencia. El hueco se dice con palabras y el resto de la pieza sale igual. */
const hayPrecio = (p) => Number.isFinite(p.price) && p.price > 0;
// un estudio no tiene «0 dormitorios»: lo que tiene es ser un estudio
const camas = (p) => (p.beds > 0 ? plural(p.beds, 'dormitorio', 'dormitorios') : (p.type || 'Estudio'));
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

/* Copy por vivienda. Los límites son los de la plantilla (ver creativos-copy.js). */
const COPY = require('./creativos-copy.js');
const avisos = []; // lo que no cuadra; se vuelca al final para que no pase desapercibido
/* Qué foto abre el creativo. La 01 del catálogo no siempre es la que vende:
 * en el casco de Adeje es un muro en sombra y la terraza con el mar es la 02. */
const fotoDe = (p) => {
  const n = (COPY[p.ref] || {}).foto || 1;
  const f = foto(p, n);
  if (fs.existsSync(f)) return f;
  avisos.push(`${p.ref} no tiene la foto ${String(n).padStart(2, '0')}.webp — se usa la 01`);
  return foto(p, 1);
};
const LIMITES = { gancho: 42, cita: 140, prueba: 32 };
const textos = (p) => {
  const c = COPY[p.ref];
  if (!c) {
    avisos.push(`${p.ref} (${p.slug}) SIN COPY en creativos-copy.js — sale con el texto de la ficha`);
    return { kicker: lugar(p), gancho: p.highlight || p.title || p.titleShort, cita: p.title || '', pruebas: rasgos(p, 4), post: '' };
  }
  const largoGancho = c.gancho.replace(/\|/g, ' ').length;
  if (largoGancho > LIMITES.gancho) avisos.push(`${p.ref} gancho de ${largoGancho} caracteres (máx. ${LIMITES.gancho}): puede pisar la cinta del story`);
  if (c.cita.length > LIMITES.cita) avisos.push(`${p.ref} cita de ${c.cita.length} caracteres (máx. ${LIMITES.cita}): puede desbordar el bloque crema`);
  c.pruebas.filter((x) => x.length > LIMITES.prueba).forEach((x) => avisos.push(`${p.ref} prueba larga (${x.length}): «${x}»`));
  return { ...c, pruebas: c.pruebas.slice(0, 4) };
};
const CTA_WA = 'Pide visita por WhatsApp';
/* Tamaño del titular según la línea MÁS LARGA. Un cuerpo fijo obliga a elegir
 * entre titulares pequeños o ganchos que se parten en tres líneas y se comen la
 * composición: esto lo resuelve por pieza. 0.44 es el ancho medio de carácter de
 * EB Garamond 600 en proporción al cuerpo, medido sobre estos mismos textos. */
const cuerpoTitular = (texto, anchoCaja, { max = 120, min = 66 } = {}) => {
  const linea = String(texto).split('|').reduce((a, b) => (a.length > b.length ? a : b), '').trim();
  return Math.max(min, Math.min(max, Math.round(anchoCaja / (linea.length * 0.44))));
};
/* En el gancho, «|» es un salto de línea decidido a mano (que «15 m²» no se separe de «fuera»). */
const gancho = (s) => esc(s).replace(/\s*\|\s*/g, '<br>');
const llano = (s) => String(s || '').replace(/\s*\|\s*/g, ' ');

/* ---------- mapita de ubicación ----------
 * Para qué: en un story de un segundo, «Cabo Blanco» no le dice nada a quien no
 * es de aquí. La silueta de la isla con un punto sí, y además retiene: el ojo se
 * para a buscar dónde cae. Contorno real de OSM, ver tenerife-mapa.js.
 *
 * La etiqueta es el MUNICIPIO, no la zona: «Torviscas Centro y Alto» se partía
 * en tres líneas bajo un mapa de 176 px. La zona concreta ya va en el kicker.
 */
const MAPA = require('./tenerife-mapa.js');
const mapa = (p, { ancho = 200, claro = false, etiqueta = true } = {}) => {
  if (!Array.isArray(p.coords) || p.coords.length !== 2) {
    avisos.push(`${p.ref} sin coords en properties-data.js — creativo sin mapa`);
    return '';
  }
  const [x, y] = MAPA.punto(p.coords[0], p.coords[1]);
  const trazo = claro ? 'var(--oro-tinta)' : 'var(--oro)';
  const relleno = claro ? 'rgba(154,107,31,.10)' : 'rgba(243,234,215,.10)';
  const texto = claro ? 'var(--tinta-2)' : 'var(--crema-2)';
  return `<figure class="mapa" style="width:${ancho}px">
  <svg viewBox="0 0 ${MAPA.W} ${MAPA.H}" width="${ancho}" height="${Math.round(ancho * MAPA.H / MAPA.W)}" aria-hidden="true">
    <path d="${MAPA.SILUETA}" fill="${relleno}" stroke="${trazo}" stroke-width="1.1" stroke-linejoin="round"/>
    <circle cx="${x}" cy="${y}" r="7.5" fill="${trazo}" opacity=".22"/>
    <circle cx="${x}" cy="${y}" r="3.4" fill="${trazo}" stroke="${claro ? 'var(--papel)' : 'var(--negro)'}" stroke-width="1.1"/>
  </svg>
  ${etiqueta ? `<figcaption style="color:${texto}">${esc(p.town || zonaCorta(p))}</figcaption>` : ''}
</figure>`;
};
/* CSS del mapita, común a los tres formatos. */
const CSS_MAPA = `
.mapa{margin:0;display:flex;flex-direction:column;align-items:center;gap:10px}
.mapa svg{display:block;filter:drop-shadow(0 4px 14px rgba(0,0,0,.45))}
.mapa figcaption{font-size:17px;letter-spacing:.24em;text-transform:uppercase;text-align:center;line-height:1.2}
`;

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
.serif{font-family:'EB Garamond',serif;font-variant-numeric:lining-nums}
.grano{position:absolute;inset:0;opacity:.14;mix-blend-mode:overlay;pointer-events:none;background-image:${GRANO}}
.olas{height:18px;width:100%;background:${OLAS} left center / 100% 18px no-repeat}
.oro-texto{background:linear-gradient(100deg,var(--oro-2) 0%,var(--oro) 45%,var(--oro-3) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
${CSS_MAPA}`;

/* =====================================================================
   FEED 1080×1080 — el editorial completo
   ===================================================================== */
function htmlFeed(p) {
  const [W, H] = FORMATOS.feed;
  const e = energia(p);
  const t = textos(p);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${BASE(W, H)}
body{color:var(--crema)}
.foto{position:absolute;inset:0;background:url('${b64(fotoDe(p))}') center 45% / cover no-repeat;transform:scale(1.02)}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.82) 0%,rgba(11,10,8,.48) 24%,rgba(11,10,8,.12) 35%,rgba(11,10,8,.52) 45%,rgba(11,10,8,.88) 57%,rgba(11,10,8,.97) 70%,var(--negro) 84%,var(--negro) 100%)}
.cab{position:absolute;left:64px;right:64px;top:60px;display:flex;align-items:flex-start;justify-content:space-between;gap:40px}
.marca{display:flex;align-items:center;gap:22px}.marca img{width:122px;height:122px;filter:drop-shadow(0 6px 18px rgba(0,0,0,.45))}
.marca .n{font-family:'EB Garamond',serif;font-weight:600;font-size:53px;line-height:1}.marca .s{font-size:23px;letter-spacing:.3em;text-transform:uppercase;color:var(--oro);margin-top:10px}
.estado{font-size:19px;letter-spacing:.3em;text-transform:uppercase;border:1.5px solid rgba(243,234,215,.6);padding:14px 22px 12px;border-radius:999px;background:rgba(11,10,8,.28);white-space:nowrap;margin-top:16px}
/* el gancho arriba: grande, en dos líneas como mucho, con el kicker en versalitas doradas */
.gancho{position:absolute;left:64px;right:300px;top:192px;max-width:700px;text-shadow:0 2px 6px rgba(0,0,0,.65),0 8px 40px rgba(0,0,0,.6)}
.gancho::before{content:'';display:block;width:64px;height:2px;background:var(--oro);margin-bottom:20px;box-shadow:0 0 18px rgba(230,189,106,.55)}
.gancho .k{font-size:18px;letter-spacing:.2em;text-transform:uppercase;color:var(--oro);margin-bottom:16px;line-height:1.35}
.gancho .g{font-family:'EB Garamond',serif;font-weight:600;font-size:${cuerpoTitular(t.gancho, 690, { max: 74, min: 46 })}px;line-height:1.02;letter-spacing:-.01em}
.sello{position:absolute;right:64px;top:200px;background:rgba(11,10,8,.5);backdrop-filter:blur(3px);padding:18px 20px 14px;border:1px solid rgba(230,189,106,.32)}
.sello .mapa figcaption{font-size:16px;letter-spacing:.16em;color:var(--oro)}
.pie{position:absolute;left:64px;right:64px;bottom:40px}
.lugar{font-size:24px;letter-spacing:.3em;text-transform:uppercase;color:var(--oro);margin-bottom:14px}
/* la cita de apoyo, no el título de la ficha: el gancho ya está arriba */
.cita{font-size:31px;line-height:1.3;max-width:800px;color:var(--crema);text-shadow:0 2px 8px rgba(0,0,0,.7)}
.precio{margin-top:22px;display:flex;align-items:baseline;gap:22px}
.precio b{font-style:italic;font-weight:500;font-size:134px;line-height:.9;letter-spacing:-.02em;filter:drop-shadow(0 4px 22px rgba(0,0,0,.5))}
.precio span{font-size:22px;letter-spacing:.24em;text-transform:uppercase;color:var(--crema-2)}
.olas{margin:24px 0 18px}
.datos{display:flex;gap:50px;align-items:flex-end}.dato b{display:block;font-weight:600;font-size:60px;line-height:1}.dato b i{font-style:normal;font-size:.55em;color:var(--crema-2);margin-left:4px}
.dato span{display:block;font-size:18px;letter-spacing:.24em;text-transform:uppercase;color:var(--oro);margin-top:9px}
.rasgos{list-style:none;display:flex;flex-wrap:wrap;gap:10px 26px;margin-top:20px;font-size:23px;color:var(--crema-2)}.rasgos li::before{content:'—';color:var(--oro);margin-right:8px}
.cta{margin-top:24px;padding-top:22px;border-top:1px solid rgba(230,189,106,.3);display:flex;justify-content:space-between;align-items:baseline;gap:30px;font-size:26px;letter-spacing:.1em;color:var(--crema);white-space:nowrap}.cta b{color:var(--oro);font-weight:600}.cta .ref{font-size:22px;letter-spacing:.1em;color:var(--crema-2)}.cta .ref i{font-style:normal;font-size:.72em;color:rgba(243,234,215,.5)}
</style></head><body><div class="lienzo">
<div class="foto"></div><div class="velo"></div><div class="grano"></div>
<header class="cab"><div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div><div class="estado">${esc(p.status)}</div></header>
<div class="gancho"><div class="k">${esc(t.kicker)}</div><h1 class="g">${gancho(t.gancho)}</h1></div>
<div class="sello">${mapa(p, { ancho: 172 })}</div>
<section class="pie">
  <div class="lugar">${esc(lugar(p))}</div>
  <p class="cita">${esc(t.cita)}</p>
  <div class="precio"><b class="serif oro-texto">${esc(precio(p.price))}</b>${p.pricePerM2 ? `<span>${esc(num(p.pricePerM2))} €/m²</span>` : ''}</div>
  <div class="olas"></div>
  <div class="datos">
    <div class="dato"><b class="serif">${p.built}<i>m²</i></b><span>construidos</span></div>
    ${p.beds > 0 ? `<div class="dato"><b class="serif">${p.beds}</b><span>${p.beds === 1 ? 'dormitorio' : 'dormitorios'}</span></div>` : `<div class="dato"><b class="serif">${esc(p.type || 'Estudio')}</b><span>vivienda</span></div>`}
    <div class="dato"><b class="serif">${p.baths}</b><span>${p.baths === 1 ? 'baño' : 'baños'}</span></div>
    ${e ? `<div class="dato"><b class="serif">${e}</b><span>energía</span></div>` : ''}
  </div>
  <ul class="rasgos">${t.pruebas.slice(0, 2).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
  <footer class="cta"><div>WhatsApp &nbsp;<b>${TEL.replace('+34 ', '')}</b></div><div class="ref">${WEB} &nbsp; <i>Ref. ${esc(p.ref)}</i></div></footer>
</section>
</div></body></html>`;
}

/* =====================================================================
   STORY 1080×1920 — ALTO IMPACTO
   Lo que se ve en un segundo: el PRECIO (250 px, oro, itálica) y una foto
   grande. Cinta diagonal con la zona, título corto, una línea de datos.
   ===================================================================== */
function htmlStory(p) {
  const [W, H] = FORMATOS.story;
  const t = textos(p);
  const datos = [`${p.built} m²`, camas(p), plural(p.baths, 'baño', 'baños')].join('   ·   ');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${BASE(W, H)}
body{color:var(--crema)}
/* la foto ocupa todo; recorte alto para que respire con el precio abajo */
.foto{position:absolute;inset:0;background:url('${b64(fotoDe(p))}') center 50% / cover no-repeat;transform:scale(1.03)}
/* velo fuerte abajo; arriba solo lo justo para el logo */
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.66) 0%,rgba(11,10,8,.40) 13%,rgba(11,10,8,.06) 25%,rgba(11,10,8,0) 31%,rgba(11,10,8,.20) 40%,rgba(11,10,8,.72) 50%,rgba(11,10,8,.96) 57%,var(--negro) 64%,var(--negro) 100%)}
/* Cinta diagonal con la zona: rompe la cuadrícula y tapa parte de la marca de
 * agua del portal. Va DENTRO del pie, no colgada de un % fijo: el titular cambia
 * de cuerpo según su línea más larga, así que un top fijo unas veces cae sobre la
 * foto y otras pisa el texto. En flujo, siempre queda justo encima. */
.cinta{position:relative;margin:0 -260px 78px -160px;transform:rotate(-6deg);background:var(--oro);color:var(--negro);
  font-size:37px;font-weight:600;letter-spacing:.38em;text-transform:uppercase;padding:22px 0;white-space:nowrap;overflow:hidden;
  box-shadow:0 18px 60px rgba(0,0,0,.55)}
.precio-pendiente{font-style:italic;color:var(--oro-2);opacity:.92;letter-spacing:-.01em}
.cinta span{display:inline-block;padding-left:230px}
.marca{position:absolute;left:64px;top:272px;display:flex;align-items:center;gap:24px}
.marca img{width:172px;height:172px;filter:drop-shadow(0 8px 24px rgba(0,0,0,.55))}
.marca .n{font-family:'EB Garamond',serif;font-weight:600;font-size:70px;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.marca .s{font-size:30px;letter-spacing:.3em;text-transform:uppercase;color:var(--oro-2);font-weight:500;margin-top:12px;text-shadow:0 2px 8px rgba(0,0,0,.95),0 0 26px rgba(0,0,0,.8)}
.fila{display:flex;align-items:center;gap:26px;margin-bottom:22px}
.estado{flex:none;font-size:30px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;border:2px solid var(--oro);color:var(--oro-2);padding:15px 28px 12px;border-radius:999px;background:rgba(11,10,8,.72);box-shadow:0 6px 28px rgba(0,0,0,.55)}
/* bloque inferior: el precio manda */
.pie{position:absolute;left:64px;right:64px;bottom:268px;z-index:1}
.pie::before{content:'';position:absolute;left:-90px;right:-90px;top:132px;bottom:-320px;z-index:-1;pointer-events:none;
  background:linear-gradient(180deg,rgba(11,10,8,0) 0%,rgba(11,10,8,.74) 16%,rgba(11,10,8,.93) 38%,var(--negro) 66%)}
/* mapa: sello de ubicación arriba a la derecha, lejos del texto */
.sello .mapa figcaption{font-size:20px;letter-spacing:.18em;color:var(--oro)}
/* kicker en versalitas doradas + gancho grande: lo que se lee en el segundo que dura el pulgar */
.kicker{font-size:27px;letter-spacing:.17em;text-transform:uppercase;color:var(--oro-2);font-weight:500;line-height:1.3;text-shadow:0 2px 10px rgba(0,0,0,.9),0 0 30px rgba(0,0,0,.7);text-shadow:0 2px 10px rgba(0,0,0,.7)}
.gancho{font-family:'EB Garamond',serif;font-weight:600;font-size:${cuerpoTitular(t.gancho, 950)}px;line-height:.98;letter-spacing:-.012em;max-width:950px;text-wrap:balance;text-shadow:0 2px 12px rgba(0,0,0,.55)}
.precio{margin-top:30px;font-style:italic;font-weight:500;font-size:250px;line-height:.82;letter-spacing:-.035em;white-space:nowrap;filter:drop-shadow(0 8px 30px rgba(0,0,0,.6))}
.precio.precio-pendiente{font-size:92px;line-height:1.05;margin-top:40px}
.precio i{font-style:italic;font-size:.42em;vertical-align:baseline;margin-left:10px}
.datos{margin-top:36px;font-size:39px;letter-spacing:.08em;text-transform:uppercase;color:var(--crema)}
.datos b{color:var(--oro);font-weight:500}
/* Contacto: lo que tiene que quedarse en la cabeza es el TELÉFONO, así que va
 * en serif grande y lo demás lo acompaña. Va EN FLUJO dentro del pie: colgado de
 * su propio anclaje inferior se pisaba con los datos en cuanto el titular crecía,
 * y además caía en los 250 px de abajo que tapa la barra de respuesta.
 * OJO: nada de acentos graves en estos comentarios, van dentro de una plantilla. */
.contacto{margin-top:40px;padding-top:30px;border-top:1px solid rgba(230,189,106,.35);
  display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
.contacto .q{font-size:25px;letter-spacing:.26em;text-transform:uppercase;color:var(--oro);font-weight:600}
.contacto .tel{font-family:'EB Garamond',serif;font-weight:600;font-size:78px;line-height:1;margin-top:14px;white-space:nowrap;filter:drop-shadow(0 3px 14px rgba(0,0,0,.6))}
.contacto .web{display:flex;align-items:baseline;gap:28px;margin-top:18px}
.contacto .web b{font-size:46px;letter-spacing:.1em;color:var(--crema);font-weight:500}
.contacto .web span{font-size:21px;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,234,215,.55);white-space:nowrap}
</style></head><body><div class="lienzo">
<div class="foto"></div><div class="velo"></div><div class="grano"></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<section class="pie">
  <div class="cinta"><span>${Array(3).fill([zonaCorta(p), String(p.town || '').trim()].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')).join(' &nbsp;·&nbsp; ')}</span></div>
  <div class="fila"><span class="estado">${esc(p.status)}</span><span class="kicker">${esc(t.kicker)}</span></div>
  <h1 class="gancho">${gancho(t.gancho)}</h1>
  ${hayPrecio(p) ? `<div class="precio serif oro-texto">${esc(num(p.price))}<i>€</i></div>` : '<div class="precio serif precio-pendiente">Precio a consultar</div>'}
  <div class="datos"><b>${esc(datos)}</b></div>
  <footer class="contacto">
    <div>
      <div class="q">${CTA_WA}</div>
      <div class="tel serif oro-texto">${TEL.replace('+34 ', '')}</div>
      <div class="web"><b>${WEB}</b><span>Ref. ${esc(p.ref)}</span></div>
    </div>
    <div class="sello">${mapa(p, { ancho: 210 })}</div>
  </footer>
</section>
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
  const t = textos(p);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${BASE(W, H)}
/* Pieza CLARA de extremo a extremo. Un estado de WhatsApp se ve sobre el fondo
 * oscuro de la aplicacion: una hoja de papel entera destaca mas que una pieza
 * mitad negra, y ademas se lee a un palmo sin esfuerzo. El oro queda como unico
 * acento y el negro solo como tinta. */
html,body{background:var(--papel)}
.lienzo{background:var(--papel);color:var(--tinta)}
.grano{opacity:.10;mix-blend-mode:multiply}
/* filetes de pagina arriba y abajo: enmarcan la hoja */
.filete{position:absolute;left:0;right:0;height:10px;background:linear-gradient(90deg,var(--oro-3),var(--oro-2) 45%,var(--oro-3))}
.filete.arr{top:0}.filete.aba{bottom:0}
/* zonas seguras: 200 arriba (progreso + nombre) y 180 abajo (campo de respuesta) */
.hoja{position:absolute;inset:0;padding:200px 66px 180px;display:flex;flex-direction:column}
.cab{display:flex;align-items:center;justify-content:space-between;gap:30px;padding-bottom:26px;border-bottom:1px solid rgba(154,107,31,.35)}
.marca{display:flex;align-items:center;gap:20px}
.marca img{width:104px;height:104px}
.marca .n{font-family:'EB Garamond',serif;font-weight:600;font-size:46px;line-height:1;color:var(--tinta)}
.marca .s{font-size:19px;letter-spacing:.34em;text-transform:uppercase;color:var(--oro-tinta);margin-top:9px;font-weight:600}
.estado{flex:none;font-size:25px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--papel);background:var(--oro-tinta);padding:15px 26px 12px}
/* la foto, como una lamina pegada en la hoja */
.foto{position:relative;flex:none;height:560px;margin-top:24px;background:url('${b64(fotoDe(p))}') center 45% / cover no-repeat;
  box-shadow:0 22px 50px rgba(26,23,18,.28)}
.foto::after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 0 2px rgba(154,107,31,.55)}
/* el mapa, sobre la esquina de la foto y en papel: no hace falta oscurecer nada */
.sello{position:absolute;right:24px;bottom:24px;background:var(--papel);padding:18px 22px 14px;border:1px solid rgba(154,107,31,.45);box-shadow:0 10px 30px rgba(26,23,18,.25)}
.sello .mapa figcaption{font-size:18px;letter-spacing:.16em;color:var(--oro-tinta);font-weight:600}
/* texto */
.texto{flex:1;display:flex;flex-direction:column;padding-top:30px}
.kicker{font-size:26px;letter-spacing:.24em;text-transform:uppercase;color:var(--oro-tinta);font-weight:600}
.gancho{margin-top:16px;font-family:'EB Garamond',serif;font-weight:600;font-size:${cuerpoTitular(t.gancho, 830, { max: 86, min: 58 })}px;line-height:1;letter-spacing:-.01em;color:var(--tinta);max-width:830px}
.cita{margin-top:18px;font-size:31px;line-height:1.34;color:var(--tinta-2);max-width:900px}
.precio{margin-top:26px;display:flex;align-items:baseline;gap:24px}
.precio b{font-style:italic;font-weight:600;font-size:132px;line-height:.86;letter-spacing:-.02em;color:var(--tinta)}
.precio span{font-size:25px;letter-spacing:.2em;text-transform:uppercase;color:var(--tinta-2)}
.olas{margin:22px 0 16px;filter:saturate(1.15) brightness(.62)}
.datos{display:flex;gap:56px;align-items:flex-end}
.dato b{display:block;font-weight:600;font-size:68px;line-height:1;color:var(--tinta)}
.dato b i{font-style:normal;font-size:.52em;color:var(--tinta-2);margin-left:5px}
.dato span{display:block;font-size:20px;letter-spacing:.2em;text-transform:uppercase;color:var(--oro-tinta);margin-top:10px;font-weight:600}
.rasgos{list-style:none;display:flex;flex-wrap:wrap;gap:8px 26px;margin-top:20px;font-size:25px;color:var(--tinta-2)}
.rasgos li::before{content:'—';color:var(--oro-3);margin-right:9px}
/* contacto: empujado al final de la hoja, nunca se pisa con lo de arriba */
.contacto{margin-top:auto;padding-top:26px;border-top:2px solid rgba(154,107,31,.45)}
.contacto .q{font-family:'EB Garamond',serif;font-size:58px;font-weight:600;color:var(--tinta);line-height:1}
.contacto .q small{display:block;font-family:'Jost',sans-serif;font-size:23px;color:var(--tinta-2);font-weight:400;margin-top:12px;line-height:1.3}
.contacto .q small b{color:var(--tinta);font-weight:600;letter-spacing:.16em}
.contacto .via{display:flex;align-items:baseline;justify-content:space-between;gap:30px;margin-top:22px}
.contacto .via b{font-size:38px;letter-spacing:.06em;color:var(--tinta);font-weight:600}
.contacto .via b i{font-style:normal;color:var(--oro-tinta);margin:0 14px}
.contacto .via span{font-size:21px;letter-spacing:.14em;text-transform:uppercase;color:var(--tinta-2);white-space:nowrap}
</style></head><body><div class="lienzo">
<div class="filete arr"></div><div class="filete aba"></div>
<div class="hoja">
  <header class="cab">
    <div class="marca"><img src="${LOGO_DISCO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
    <div class="estado">${esc(p.status)}</div>
  </header>
  <figure class="foto"><div class="sello">${mapa(p, { ancho: 176, claro: true })}</div></figure>
  <section class="texto">
    <div class="kicker">${esc(t.kicker)}</div>
    <h1 class="gancho">${gancho(t.gancho)}</h1>
    <p class="cita">${esc(t.cita)}</p>
    <div class="precio"><b class="serif">${esc(precio(p.price))}</b>${p.pricePerM2 ? `<span>${esc(num(p.pricePerM2))} €/m²</span>` : ''}</div>
    <div class="olas"></div>
    <div class="datos">
      <div class="dato"><b class="serif">${p.built}<i>m²</i></b><span>construidos</span></div>
      ${p.beds > 0 ? `<div class="dato"><b class="serif">${p.beds}</b><span>${p.beds === 1 ? 'dormitorio' : 'dormitorios'}</span></div>` : `<div class="dato"><b class="serif">${esc(p.type || 'Estudio')}</b><span>vivienda</span></div>`}
      <div class="dato"><b class="serif">${p.baths}</b><span>${p.baths === 1 ? 'baño' : 'baños'}</span></div>
      ${e ? `<div class="dato"><b class="serif">${e}</b><span>energía</span></div>` : ''}
    </div>
    <ul class="rasgos">${t.pruebas.slice(0, 3).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    <footer class="contacto">
      <div class="q">¿Te la enseño?<small>Responde <b>VISITA</b> a este estado y te mando la ficha completa.</small></div>
      <div class="via"><b>${WEB}<i>·</i>${TEL.replace('+34 ', '')}</b><span>Ref. ${esc(p.ref)}</span></div>
    </footer>
  </section>
</div>
</div></body></html>`;
}

const PLANTILLAS = { feed: htmlFeed, story: htmlStory, wa: htmlWa };

/* =====================================================================
   MARCA 1080×1920 — portada y cierre de una serie de stories
   No van por vivienda: abren y cierran la tanda. El fondo es el ÚNICO
   material generado con IA de todo esto, y a propósito: es un paisaje de
   la costa sur, no un inmueble. Las viviendas se enseñan con su foto real.
   Los números (cuántas, desde cuánto, municipios) salen del catálogo.
   ===================================================================== */
const FONDO_MARCA = path.join(RAIZ, 'assets/brand/portada-costa-sur-ia.jpg');

function htmlMarca(cierre) {
  const [W, H] = [1080, 1920];
  const desde = Math.min(...props.filter(hayPrecio).map((p) => p.price));
  const municipios = [...new Set(props.map((p) => p.town))].sort();
  const ultimo = municipios.pop();
  const lista = municipios.length ? `${municipios.join(', ')} y ${ultimo}` : ultimo;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${BASE(W, H)}
body{color:var(--crema)}
.foto{position:absolute;inset:0;background:url('${b64(FONDO_MARCA)}') center 42% / cover no-repeat}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.62) 0%,rgba(11,10,8,.18) 22%,rgba(11,10,8,.30) 46%,rgba(11,10,8,.82) 64%,rgba(11,10,8,.97) 80%,var(--negro) 100%)}
.marca{position:absolute;left:0;right:0;top:300px;display:flex;flex-direction:column;align-items:center;text-align:center}
.marca img{width:172px;height:172px;filter:drop-shadow(0 10px 30px rgba(0,0,0,.6))}
.marca .n{font-family:'EB Garamond',serif;font-weight:600;font-size:74px;line-height:1;margin-top:28px;text-shadow:0 2px 14px rgba(0,0,0,.6)}
.marca .s{font-size:26px;letter-spacing:.4em;text-transform:uppercase;color:var(--oro);margin-top:18px}
.pie{position:absolute;left:70px;right:70px;bottom:290px;text-align:center}
.titular{font-family:'EB Garamond',serif;font-weight:600;font-size:${cierre ? 108 : 94}px;line-height:1;letter-spacing:-.015em;text-wrap:balance;text-shadow:0 2px 14px rgba(0,0,0,.5)}
.sub{margin-top:28px;font-size:35px;line-height:1.36;color:var(--crema-2);text-wrap:balance}
.sub b{color:var(--oro);font-weight:500}
.olas{margin:30px auto 26px;max-width:520px}
.accion{font-size:30px;letter-spacing:.16em;text-transform:uppercase;color:var(--crema);font-weight:500}
.accion b{font-family:'EB Garamond',serif;font-size:1.9em;letter-spacing:.01em;color:var(--oro);font-weight:600;display:block;margin-top:16px}
.web{position:absolute;left:0;right:0;bottom:196px;text-align:center;font-size:36px;letter-spacing:.14em;color:var(--crema);font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--crema-2)}
</style></head><body><div class="lienzo">
<div class="foto"></div><div class="velo"></div><div class="grano"></div>
<div class="marca"><img src="${LOGO}" alt=""><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div>
<section class="pie">
${cierre
    ? `<h1 class="titular">¿Cuál te enseño<br>primero?</h1>
  <p class="sub">Dime la referencia o el pueblo y te mando la ficha completa.</p>
  <div class="olas"></div>
  <div class="accion">Escríbeme<b>${TEL.replace('+34 ', '')}</b></div>`
    : `<h1 class="titular">${props.length === 1 ? 'Una vivienda' : `${props.length} viviendas`}<br>en venta en el sur</h1>
  <p class="sub">${lista}. Desde <b>${precio(desde)}</b>.</p>
  <div class="olas"></div>
  <div class="accion">Desliza para verlas</div>`}
</section>
<div class="web">${WEB}</div>
</div></body></html>`;
}

/* ---------- copy de cada post ---------- */
function copy(p) {
  const t = textos(p);
  const datos = `${p.built} m² · ${camas(p)} · ${plural(p.baths, 'baño', 'baños')}`;
  return [
    `## ${llano(t.gancho)}`,
    `_${t.kicker} · ${precio(p.price)}_`, ``,
    `**Post (Instagram / Facebook)**`, ``,
    `${llano(t.gancho)}`, ``,
    `${t.cita}`, ``,
    ...(t.post ? [`${t.post}`, ``] : []),
    ...t.pruebas.map((x) => `— ${x}`), ``,
    `${datos} · ${precio(p.price)}${p.pricePerM2 ? ` (${num(p.pricePerM2)} €/m²)` : ''}`,
    `${lugar(p)} · Ref. ${p.ref}`, ``,
    `Ficha completa y fotos → https://${WEB}/property.html?ref=${p.ref}`,
    `${CTA_WA} → ${TEL}`, ``,
    `**Estado de WhatsApp (texto que acompaña a la imagen)**`, ``,
    `${llano(t.gancho)} ${precio(p.price)}, ${lugar(p)}. Responde VISITA y te mando la ficha completa.`, ``,
    `**Hashtags**`, ``,
    [`#TenerifeSur`, p.town && `#${String(p.town).replace(/\s+/g, '')}`, p.zone && `#${String(p.zone).split('(')[0].replace(/[^\wáéíóúñ]/gi, '')}`, `#Inmobiliaria`, `#VillasProperties`, `#CompraVivienda`].filter(Boolean).join(' '), ``,
  ].join('\n');
}

/* ---------- guardarraíl de composición ----------
 * Un texto más largo de la cuenta no rompe nada visible: simplemente empuja el
 * pie fuera del lienzo o lo pega al bloque de arriba, y el creativo sale igual.
 * Esto lo mide en el navegador y lo cuenta. Sin esto, el fallo se descubre
 * cuando ya está publicado.
 */
async function desbordes(page) {
  return page.evaluate(() => {
    const avisos = [];
    const alto = window.innerHeight;
    // .lienzo NO se mide: la cinta diagonal sale a sangre a propósito y el
    // overflow:hidden la recorta, así que daría un falso positivo siempre.
    for (const sel of ['.papel']) {
      const el = document.querySelector(sel);
      if (el && el.scrollHeight > el.clientHeight + 2) {
        avisos.push(`«${sel}» desborda ${el.scrollHeight - el.clientHeight} px`);
      }
    }
    // nada importante puede salirse del lienzo ni caer en la zona segura de abajo
    for (const sel of ['.cta', '.contacto', '.datos', '.precio', '.gancho', '.rasgos']) {
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.bottom > alto + 1) avisos.push(`«${sel}» se sale ${Math.round(r.bottom - alto)} px por abajo`);
        if (r.top < -1) avisos.push(`«${sel}» se sale ${Math.round(-r.top)} px por arriba`);
      }
    }
    // bloques que nunca deben pisarse (el fallo del feed: el pie creció y se
    // comió el pie de página, y ninguna caja «desbordaba» nada)
    const pares = [['.rasgos', '.cta'], ['.datos', '.cta'], ['.datos', '.contacto'], ['.precio', '.datos'],
                   ['.gancho', '.precio'], ['.cita', '.precio'], ['.sello', '.gancho'],  /* .sello ya NO se compara con .contacto: vive dentro de él */
                   ['.marca', '.estado'], ['.fila', '.gancho']];
    for (const [a, b] of pares) {
      const ea = document.querySelector(a), eb = document.querySelector(b);
      if (!ea || !eb) continue;
      const ra = ea.getBoundingClientRect(), rb = eb.getBoundingClientRect();
      const solapeV = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      const solapeH = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      if (solapeV > 2 && solapeH > 2) avisos.push(`«${a}» y «${b}» se pisan ${Math.round(solapeV)} px`);
    }
    // el pie va en una fila con los textos sin partir: si el contenido pide más
    // ancho del que hay, en pantalla se monta encima o se parte. Medirlo por
    // ALTURA daba falsos positivos donde el pie es de dos líneas a propósito.
    for (const el of document.querySelectorAll('.cta')) {
      if (getComputedStyle(el).flexDirection !== 'row') continue;
      if (el.scrollWidth > el.clientWidth + 2) {
        avisos.push(`el pie de página no cabe por ${el.scrollWidth - el.clientWidth} px`);
      }
    }
    // el kicker va en versalitas muy espaciadas: en dos líneas se desordena
    for (const el of document.querySelectorAll('.kicker, .gancho .k')) {
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25;
      if (lh && el.getBoundingClientRect().height > lh * 1.5) {
        avisos.push(`el kicker «${el.textContent.trim().slice(0, 34)}…» se parte en dos líneas`);
      }
    }
    // el pie del estado se empuja al fondo con margin-top:auto. Si no le queda
    // holgura es que el bloque va lleno y el siguiente texto largo lo revienta.
    const ultimo = document.querySelector('.papel .rasgos');
    const pieWa = document.querySelector('.papel .cta');
    if (ultimo && pieWa) {
      const hueco = pieWa.getBoundingClientRect().top - ultimo.getBoundingClientRect().bottom;
      if (hueco < 24) avisos.push(`el bloque crema va lleno: solo ${Math.round(hueco)} px hasta el pie`);
    }
    // la cinta diagonal va rotada: su caja miente. Lo que importa es que su
    // esquina más baja no llegue al primer texto que tiene debajo.
    const cinta = document.querySelector('.cinta');
    const primero = document.querySelector('.pie .fila, .pie .kicker');
    if (cinta && primero) {
      const a = cinta.getBoundingClientRect(), b = primero.getBoundingClientRect();
      if (a.bottom > b.top) avisos.push(`la cinta pisa el kicker ${Math.round(a.bottom - b.top)} px`);
    }
    return avisos;
  });
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
      for (const m of await desbordes(page)) avisos.push(`${p.ref} ${f}: ${m}`);
      await page.screenshot({ path: path.join(OUT, `${p.slug}-${f}.png`), type: 'png' });
      await page.screenshot({ path: path.join(OUT, `${p.slug}-${f}.jpg`), type: 'jpeg', quality: 90 });
      await page.close();
      n++;
    }
    copies.push(copy(p));
    console.log(`  ✔ ${p.ref}  ${p.slug}  (${formatos.join(', ')})`);
  }
  /* Portada y cierre de la serie: una sola vez, no por vivienda. */
  if (!soloRef) {
    if (!fs.existsSync(FONDO_MARCA)) {
      avisos.push(`falta assets/brand/portada-costa-sur-ia.jpg — sin portada ni cierre de serie`);
    } else {
      for (const [nombre, esCierre] of [['portada', false], ['cierre', true]]) {
        const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
        const doc = htmlMarca(esCierre);
        if (dejarHtml) fs.writeFileSync(path.join(OUT, `serie-${nombre}.html`), doc);
        await page.setContent(doc, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(OUT, `serie-${nombre}.png`), type: 'png' });
        await page.screenshot({ path: path.join(OUT, `serie-${nombre}.jpg`), type: 'jpeg', quality: 90 });
        await page.close();
        n++;
      }
      console.log('  ✔ serie-portada · serie-cierre');
    }
  }
  await browser.close();
  /* Con una sola referencia NO se toca COPY.md: si no, una prueba puntual borra
   * el copy de las otras cinco viviendas. Se deja aparte para poder mirarlo. */
  const destinoCopy = soloRef ? `COPY-${soloRef}.md` : 'COPY.md';
  fs.writeFileSync(path.join(OUT, destinoCopy), copies.join('\n'));
  console.log(`\n  ${n} creativos (${props.length} propiedades × ${formatos.length} formatos) en creativos/ · ${destinoCopy}`);
  const unicos = [...new Set(avisos)];
  if (unicos.length) console.warn(`\n  ⚠ TEXTO — ${unicos.length} aviso(s):\n` + unicos.map((a) => `    · ${a}`).join('\n'));
})().catch((e) => { console.error('  🔴', e.message); process.exit(1); });
