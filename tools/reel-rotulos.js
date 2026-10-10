#!/usr/bin/env node
/* reel-rotulos.js — Rótulos de VÍDEO con la misma identidad que los creativos:
 * portada con el gancho (opaca, sobre un fotograma), cabecera de marca y
 * etiquetas de estancia (transparentes) y cierre apaisado. El cierre vertical
 * es el propio story de creativos.js (precio, WhatsApp y mapa): se copia tal cual.
 *
 * USO  node tools/reel-rotulos.js <ref> <dirSalida> <fondoVertical.jpg> <fondoApaisado.jpg>
 * Fuentes y logo embebidos, render con el Chrome instalado (channel: 'chrome'). */
'use strict';
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const RAIZ = path.join(__dirname, '..');
const [ref, OUT, FONDO_V, FONDO_H] = process.argv.slice(2);
if (!ref || !OUT || !FONDO_V || !FONDO_H) { console.error('uso: reel-rotulos.js <ref> <dir> <fondoV> <fondoH>'); process.exit(1); }
global.window = {}; require(path.join(RAIZ, 'properties-data.js'));
const p = (global.window.VP_PROPERTIES || []).find((x) => String(x.ref) === String(ref));
if (!p) { console.error('ref no encontrada'); process.exit(1); }
const COPY = require('./creativos-copy.js'); const c = COPY[p.ref] || {};
const MAPA = require('./tenerife-mapa.js');
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const b64 = (f) => `data:${f.endsWith('.png') ? 'image/png' : /\.jpe?g$/.test(f) ? 'image/jpeg' : f.endsWith('.webp') ? 'image/webp' : 'font/woff2'};base64,${fs.readFileSync(f).toString('base64')}`;
const FUENTES = fs.readFileSync(path.join(RAIZ, 'assets/fonts/fonts.local.css'), 'utf8').replace(/url\('([^']+)'\)/g, (_, f) => `url('${b64(path.join(RAIZ, 'assets/fonts', f))}')`);
const LOGO = b64(path.join(RAIZ, 'assets/brand/logo-mark.png'));
const WEB = 'villasproperties.es'; const TEL = '667 384 965';
const num = (n) => new Intl.NumberFormat('es-ES', { useGrouping: 'always' }).format(n);
const plural = (n, s, pl) => `${n} ${n === 1 ? s : pl}`;
const zonaCorta = String(p.zone || p.town || '').split('(')[0].trim();
const kicker = c.kicker || `${p.type} · ${zonaCorta}`;

/* Una vivienda en captación puede no tener todavía precio cerrado, zona asignada ni
 * coordenadas. Antes eso reventaba el render o pintaba «0 €», que en un creativo es
 * peor que no decir nada: parece un error de la agencia. Ahora el hueco se ve como
 * hueco y el resto de la pieza sale igual. */
/* Los cierres usaban la foto 01 de la ficha como fondo. Una vivienda recién captada
 * puede no tener fotos todavía y solo tener la grabación: en ese caso el fondo sale del
 * propio vídeo, que es material igual de real. */
const fondoCierre = (apaisado) => {
  const foto = path.join(RAIZ, 'assets/img', p.slug, '01.webp');
  return b64(fs.existsSync(foto) ? foto : (apaisado ? FONDO_H : FONDO_V));
};
const hayPrecio = Number.isFinite(p.price) && p.price > 0;
const hayMapa = Array.isArray(p.coords) && p.coords.length === 2;
const lugares = [zonaCorta, String(p.town || '').trim()].filter(Boolean);
const ganchoTxt = c.gancho || p.titleShort;
const gancho = esc(ganchoTxt).replace(/\s*\|\s*/g, '<br>');
const lineaMax = String(ganchoTxt).split('|').reduce((a, b) => (a.length > b.length ? a : b), '').trim().length;
const cuerpo = (ancho, max, min) => Math.max(min, Math.min(max, Math.round(ancho / (lineaMax * 0.44))));
// un estudio no tiene «0 dormitorios»: lo que tiene es ser un estudio
const datos = [`${p.built} m²`,
  p.beds > 0 ? plural(p.beds, 'dormitorio', 'dormitorios') : (p.type || 'Estudio'),
  plural(p.baths, 'baño', 'baños')].join('   ·   ');
const mapa = (ancho) => {
  const [x, y] = MAPA.punto(p.coords[0], p.coords[1]);
  return `<figure class="mapa" style="width:${ancho}px"><svg viewBox="0 0 ${MAPA.W} ${MAPA.H}" width="${ancho}" height="${Math.round(ancho * MAPA.H / MAPA.W)}">
  <path d="${MAPA.SILUETA}" fill="rgba(243,234,215,.10)" stroke="var(--oro)" stroke-width="1.1" stroke-linejoin="round"/>
  <circle cx="${x}" cy="${y}" r="7.5" fill="var(--oro)" opacity=".22"/><circle cx="${x}" cy="${y}" r="3.4" fill="var(--oro)" stroke="var(--negro)" stroke-width="1.1"/></svg>
  <figcaption>${esc(p.town)}</figcaption></figure>`;
};
const BASE = (W, H, transparente) => `${FUENTES}
:root{--negro:#0b0a08;--crema:#f3ead7;--crema-2:#d9cdb3;--oro:#e6bd6a;--oro-2:#f5dc9a;--oro-3:#c98f3c}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${transparente ? 'transparent' : 'var(--negro)'};font-family:'Jost',sans-serif;-webkit-font-smoothing:antialiased;color:var(--crema)}
.lienzo{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.serif{font-family:'EB Garamond',serif;font-variant-numeric:lining-nums}
.oro-texto{background:linear-gradient(100deg,var(--oro-2) 0%,var(--oro) 45%,var(--oro-3) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.marca{display:flex;align-items:center;gap:24px}.marca img{filter:drop-shadow(0 8px 24px rgba(0,0,0,.55))}
.marca .n{font-family:'EB Garamond',serif;font-weight:600;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.marca .s{letter-spacing:.3em;text-transform:uppercase;color:var(--oro-2);font-weight:500;text-shadow:0 2px 8px rgba(0,0,0,.95)}
.estado{flex:none;font-weight:600;letter-spacing:.26em;text-transform:uppercase;border:2px solid var(--oro);color:var(--oro-2);border-radius:999px;background:rgba(11,10,8,.72);box-shadow:0 6px 28px rgba(0,0,0,.55)}
.kicker{letter-spacing:.17em;text-transform:uppercase;color:var(--oro-2);font-weight:500;line-height:1.3;text-shadow:0 2px 10px rgba(0,0,0,.9)}
.gancho{font-family:'EB Garamond',serif;font-weight:600;line-height:.98;letter-spacing:-.012em;text-wrap:balance;text-shadow:0 2px 12px rgba(0,0,0,.55)}
.mapa{margin:0;display:flex;flex-direction:column;align-items:center;gap:10px}.mapa svg{display:block;filter:drop-shadow(0 4px 14px rgba(0,0,0,.45))}
.mapa figcaption{font-size:20px;letter-spacing:.18em;text-transform:uppercase;text-align:center;line-height:1.2;color:var(--oro)}
.cinta{position:relative;transform:rotate(-6deg);background:var(--oro);color:var(--negro);font-weight:600;letter-spacing:.38em;text-transform:uppercase;white-space:nowrap;overflow:hidden;box-shadow:0 18px 60px rgba(0,0,0,.55)}
.cinta span{display:inline-block;padding-left:230px}
.precio-pendiente{font-family:'EB Garamond',serif;font-style:italic;font-weight:600;color:var(--oro-2);letter-spacing:-.01em;opacity:.92}`;
const cintaTxt = Array(3).fill(lugares.map(esc).join(' &nbsp;·&nbsp; ')).join(' &nbsp;·&nbsp; ');
const doc = (W, H, transparente, css, cuerpoHtml) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${BASE(W, H, transparente)}${css}</style></head><body><div class="lienzo">${cuerpoHtml}</div></body></html>`;

/* ---- PORTADA vertical 1080×1920: brand + cinta + pill/kicker + gancho, sin precio ---- */
const portadaV = () => doc(1080, 1920, false, `
.foto{position:absolute;inset:0;background:url('${b64(FONDO_V)}') center / cover no-repeat;transform:scale(1.03)}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.66) 0%,rgba(11,10,8,.40) 13%,rgba(11,10,8,.10) 26%,rgba(11,10,8,.18) 44%,rgba(11,10,8,.70) 58%,rgba(11,10,8,.92) 70%,rgba(11,10,8,.97) 100%)}
.marca{position:absolute;left:64px;top:272px}.marca img{width:172px;height:172px}.marca .n{font-size:70px}.marca .s{font-size:30px;margin-top:12px}
.pie{position:absolute;left:64px;right:64px;bottom:420px}
.cinta{margin:0 -260px 78px -160px;font-size:37px;padding:22px 0}
.fila{display:flex;align-items:center;gap:26px;margin-bottom:22px}.estado{font-size:30px;padding:15px 28px 12px}.kicker{font-size:27px}
.gancho{font-size:${cuerpo(950, 120, 66)}px;max-width:950px}
.datos{margin-top:34px;font-size:39px;letter-spacing:.08em;text-transform:uppercase;color:var(--oro)}`,
`<div class="foto"></div><div class="velo"></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<section class="pie"><div class="cinta"><span>${cintaTxt}</span></div>
<div class="fila"><span class="estado">${esc(p.status)}</span><span class="kicker">${esc(kicker)}</span></div>
<h1 class="gancho">${gancho}</h1><div class="datos">${esc(datos)}</div></section>`);

/* ---- PORTADA apaisada 1920×1080 ---- */
const portadaH = () => doc(1920, 1080, false, `
.foto{position:absolute;inset:0;background:url('${b64(FONDO_H)}') center / cover no-repeat;transform:scale(1.03)}
.velo{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,10,8,.90) 0%,rgba(11,10,8,.72) 38%,rgba(11,10,8,.25) 70%,rgba(11,10,8,.10) 100%)}
.marca{position:absolute;left:72px;top:64px}.marca img{width:120px;height:120px}.marca .n{font-size:50px}.marca .s{font-size:22px;margin-top:10px}
.pie{position:absolute;left:72px;bottom:96px;width:1000px}
.fila{display:flex;align-items:center;gap:22px;margin-bottom:22px}.estado{font-size:24px;padding:12px 24px 10px}.kicker{font-size:23px}
.gancho{font-size:${cuerpo(1000, 112, 60)}px;max-width:1000px}
.datos{margin-top:28px;font-size:30px;letter-spacing:.08em;text-transform:uppercase;color:var(--oro)}
.sello{position:absolute;right:72px;bottom:96px}`,
`<div class="foto"></div><div class="velo"></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<section class="pie"><div class="fila"><span class="estado">${esc(p.status)}</span><span class="kicker">${esc(kicker)}</span></div>
<h1 class="gancho">${gancho}</h1><div class="datos">${esc(datos)}</div></section>`);

/* ---- CIERRE apaisado 1920×1080: precio, datos, contacto y mapa ---- */
const cierreH = () => doc(1920, 1080, false, `
.foto{position:absolute;inset:0;background:url('${fondoCierre(true)}') center / cover no-repeat;filter:blur(2px);transform:scale(1.05)}
.velo{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,10,8,.96) 0%,rgba(11,10,8,.90) 55%,rgba(11,10,8,.55) 100%)}
.marca{position:absolute;left:72px;top:64px}.marca img{width:120px;height:120px}.marca .n{font-size:50px}.marca .s{font-size:22px;margin-top:10px}
.pie{position:absolute;left:72px;bottom:90px;width:1180px}
.fila{display:flex;align-items:center;gap:22px;margin-bottom:18px}.estado{font-size:22px;padding:11px 22px 9px}.kicker{font-size:22px}
.gancho{font-size:${cuerpo(1100, 84, 50)}px;max-width:1100px}
.precio{margin-top:18px;font-style:italic;font-weight:500;font-size:190px;line-height:.85;letter-spacing:-.035em;white-space:nowrap;filter:drop-shadow(0 8px 30px rgba(0,0,0,.6))}.precio i{font-size:.42em;margin-left:10px}
.datos{margin-top:22px;font-size:30px;letter-spacing:.08em;text-transform:uppercase;color:var(--oro)}
.contacto{margin-top:26px;padding-top:22px;border-top:1px solid rgba(230,189,106,.35);display:flex;gap:60px;align-items:flex-end}
.contacto .q{font-size:20px;letter-spacing:.26em;text-transform:uppercase;color:var(--oro);font-weight:600}
.contacto .tel{font-family:'EB Garamond',serif;font-weight:600;font-size:62px;line-height:1;margin-top:10px;white-space:nowrap}
.contacto .web b{font-size:36px;letter-spacing:.1em;color:var(--crema);font-weight:500}.contacto .web span{display:block;font-size:18px;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,234,215,.55);margin-top:8px}
.sello{position:absolute;right:110px;bottom:120px}`,
`<div class="foto"></div><div class="velo"></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<section class="pie"><div class="fila"><span class="estado">${esc(p.status)}</span><span class="kicker">${esc(kicker)}</span></div>
<h1 class="gancho">${gancho}</h1>
${hayPrecio ? `<div class="precio serif oro-texto">${esc(num(p.price))}<i>€</i></div>` : '<div class="precio-pendiente">Precio a consultar</div>'}
<div class="datos">${esc(datos)}</div>
<footer class="contacto"><div><div class="q">Pide visita por WhatsApp</div><div class="tel serif oro-texto">${TEL}</div></div>
<div class="web"><b>${WEB}</b><span>Ref. ${esc(p.ref)}</span></div></footer></section>
<div class="sello">${hayMapa ? mapa(330) : ''}</div>`);

/* ---- PORTADA y CIERRE cuadrados 1080×1080 ----
 * El recorrido de la vivienda se graba en vertical, así que la pieza larga para la
 * ficha se recorta a cuadrado: no deforma y se pierde solo el techo y algo de suelo.
 * El fondo es el MISMO fotograma vertical, recortado por el centro igual que lo
 * recorta el vídeo (`center / cover`): si no, la portada enseñaría un encuadre que
 * luego no aparece. El texto va abajo, como en la vertical: el velo lateral de la
 * apaisada se come media pieza cuando el lienzo es cuadrado. */
const portadaC = () => doc(1080, 1080, false, `
.foto{position:absolute;inset:0;background:url('${b64(FONDO_V)}') center / cover no-repeat;transform:scale(1.03)}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.72) 0%,rgba(11,10,8,.30) 16%,rgba(11,10,8,.08) 32%,rgba(11,10,8,.42) 56%,rgba(11,10,8,.90) 76%,rgba(11,10,8,.97) 100%)}
.marca{position:absolute;left:60px;top:56px}.marca img{width:116px;height:116px}.marca .n{font-size:50px}.marca .s{font-size:22px;margin-top:10px}
.pie{position:absolute;left:60px;right:60px;bottom:72px}
.cinta{margin:0 -220px 46px -140px;font-size:28px;padding:16px 0}
.fila{display:flex;align-items:center;gap:20px;margin-bottom:18px}.estado{font-size:24px;padding:12px 24px 10px}.kicker{font-size:23px}
.gancho{font-size:${cuerpo(950, 88, 52)}px;max-width:950px}
.datos{margin-top:24px;font-size:30px;letter-spacing:.08em;text-transform:uppercase;color:var(--oro)}`,
`<div class="foto"></div><div class="velo"></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<section class="pie"><div class="cinta"><span>${cintaTxt}</span></div>
<div class="fila"><span class="estado">${esc(p.status)}</span><span class="kicker">${esc(kicker)}</span></div>
<h1 class="gancho">${gancho}</h1><div class="datos">${esc(datos)}</div></section>`);

const cierreC = () => doc(1080, 1080, false, `
.foto{position:absolute;inset:0;background:url('${fondoCierre(false)}') center / cover no-repeat;filter:blur(2px);transform:scale(1.05)}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.92) 0%,rgba(11,10,8,.88) 40%,rgba(11,10,8,.95) 100%)}
.marca{position:absolute;left:60px;top:56px}.marca img{width:110px;height:110px}.marca .n{font-size:46px}.marca .s{font-size:20px;margin-top:9px}
.pie{position:absolute;left:60px;right:60px;bottom:66px}
.fila{display:flex;align-items:center;gap:20px;margin-bottom:16px}.estado{font-size:21px;padding:11px 22px 9px}.kicker{font-size:21px}
.gancho{font-size:${cuerpo(960, 66, 42)}px;max-width:960px}
.precio{margin-top:14px;font-style:italic;font-weight:500;font-size:128px;line-height:.85;letter-spacing:-.035em;white-space:nowrap;filter:drop-shadow(0 8px 30px rgba(0,0,0,.6))}.precio i{font-size:.42em;margin-left:10px}
.datos{margin-top:18px;font-size:26px;letter-spacing:.08em;text-transform:uppercase;color:var(--oro)}
.contacto{margin-top:22px;padding-top:20px;border-top:1px solid rgba(230,189,106,.35);display:flex;gap:40px;align-items:flex-end;justify-content:space-between}
.contacto .q{font-size:18px;letter-spacing:.24em;text-transform:uppercase;color:var(--oro);font-weight:600}
.contacto .tel{font-family:'EB Garamond',serif;font-weight:600;font-size:54px;line-height:1;margin-top:9px;white-space:nowrap}
.contacto .web b{font-size:30px;letter-spacing:.1em;color:var(--crema);font-weight:500}.contacto .web span{display:block;font-size:17px;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,234,215,.55);margin-top:7px}
.sello{position:absolute;right:60px;top:56px}`,
`<div class="foto"></div><div class="velo"></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<div class="sello">${hayMapa ? mapa(190) : ''}</div>
<section class="pie"><div class="fila"><span class="estado">${esc(p.status)}</span><span class="kicker">${esc(kicker)}</span></div>
<h1 class="gancho">${gancho}</h1>
${hayPrecio ? `<div class="precio serif oro-texto">${esc(num(p.price))}<i>€</i></div>` : '<div class="precio-pendiente">Precio a consultar</div>'}
<div class="datos">${esc(datos)}</div>
<footer class="contacto"><div><div class="q">Pide visita por WhatsApp</div><div class="tel serif oro-texto">${TEL}</div></div>
<div class="web"><b>${WEB}</b><span>Ref. ${esc(p.ref)}</span></div></footer></section>`);

/* ---- CIERRE vertical 1080×1920 ----
 * El cierre del reel era el story de creativos.js, que se arma con las fotos de
 * `assets/img/<slug>/`. Eso ata el vídeo a tener ficha fotografiada: una vivienda de
 * la que solo hay grabación no podía cerrarse. Este cierre se basta con un fotograma
 * del propio vídeo, así que el reel sale de principio a fin con el material grabado.
 * Cuando el story existe se sigue prefiriendo: es la pieza que Jose ya aprobó. */
const cierreV = () => doc(1080, 1920, false, `
.foto{position:absolute;inset:0;background:url('${b64(FONDO_V)}') center / cover no-repeat;filter:blur(3px);transform:scale(1.06)}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.93) 0%,rgba(11,10,8,.88) 45%,rgba(11,10,8,.96) 100%)}
.marca{position:absolute;left:64px;top:250px}.marca img{width:150px;height:150px}.marca .n{font-size:62px}.marca .s{font-size:27px;margin-top:11px}
.pie{position:absolute;left:64px;right:64px;bottom:300px}
.fila{display:flex;align-items:center;gap:24px;margin-bottom:20px}.estado{font-size:27px;padding:14px 26px 11px}.kicker{font-size:25px}
.gancho{font-size:${cuerpo(950, 86, 52)}px;max-width:950px}
.precio{margin-top:22px;font-style:italic;font-weight:500;font-size:190px;line-height:.84;letter-spacing:-.035em;white-space:nowrap;filter:drop-shadow(0 8px 30px rgba(0,0,0,.6))}.precio i{font-size:.42em;margin-left:10px}
.precio-pendiente{margin-top:26px;font-size:76px;line-height:1}
.datos{margin-top:26px;font-size:34px;letter-spacing:.08em;text-transform:uppercase;color:var(--oro)}
.contacto{margin-top:34px;padding-top:28px;border-top:1px solid rgba(230,189,106,.35)}
.contacto .q{font-size:24px;letter-spacing:.24em;text-transform:uppercase;color:var(--oro);font-weight:600}
.contacto .tel{font-family:'EB Garamond',serif;font-weight:600;font-size:76px;line-height:1;margin-top:12px;white-space:nowrap}
.contacto .web b{font-size:40px;letter-spacing:.1em;color:var(--crema);font-weight:500;display:block;margin-top:20px}
.contacto .web span{display:block;font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,234,215,.55);margin-top:9px}
.sello{position:absolute;right:64px;top:250px}`,
`<div class="foto"></div><div class="velo"></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<div class="sello">${hayMapa ? mapa(200) : ''}</div>
<section class="pie"><div class="fila"><span class="estado">${esc(p.status)}</span><span class="kicker">${esc(kicker)}</span></div>
<h1 class="gancho">${gancho}</h1>
${hayPrecio ? `<div class="precio serif oro-texto">${esc(num(p.price))}<i>€</i></div>` : '<div class="precio-pendiente">Precio a consultar</div>'}
<div class="datos">${esc(datos)}</div>
<footer class="contacto"><div class="q">Pide visita por WhatsApp</div><div class="tel serif oro-texto">${TEL}</div>
<div class="web"><b>${WEB}</b><span>Ref. ${esc(p.ref)}</span></div></footer></section>`);

/* ---- transparentes: cabecera de marca pequeña y etiqueta de estancia ---- */
const marcaT = (W, H) => doc(W, H, true, `
.marca{position:absolute;left:${W < H ? 64 : 72}px;top:${W < H ? 290 : 56}px}.marca img{width:${W < H ? 104 : 92}px;height:${W < H ? 104 : 92}px}
.marca .n{font-size:${W < H ? 42 : 38}px}.marca .s{font-size:${W < H ? 19 : 17}px;margin-top:8px}`,
`<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>`);
const etiquetaT = (W, H, texto) => doc(W, H, true, `
.sombra{position:absolute;left:0;right:0;bottom:0;height:${W < H ? 560 : 320}px;background:linear-gradient(180deg,rgba(11,10,8,0) 0%,rgba(11,10,8,.55) 100%)}
.et{position:absolute;left:${W < H ? 64 : 72}px;bottom:${W < H ? 330 : 84}px}
.et::before{content:'';display:block;width:64px;height:2px;background:var(--oro);margin-bottom:16px;box-shadow:0 0 18px rgba(230,189,106,.55)}
.et .k{font-size:${W < H ? 34 : 30}px;letter-spacing:.22em;text-transform:uppercase;color:var(--crema);font-weight:500;text-shadow:0 2px 10px rgba(0,0,0,.9)}`,
`<div class="sombra"></div><div class="et"><div class="k">${esc(texto)}</div></div>`);

const ESTANCIAS = ['Salón', 'Cocina', 'Terraza', 'Dormitorio principal', 'Segundo dormitorio', 'Tercer dormitorio', 'Baño con bañera', 'Baño con ducha', 'Recibidor', 'Vistas a la piscina'];
const nombre = (s) => s.toLowerCase().replace(/ /g, '_').replace(/ñ/g, 'n');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const render = async (W, H, html, file, transparente) => {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(OUT, file), type: 'png', omitBackground: !!transparente }); await page.close();
  };
  await render(1080, 1920, portadaV(), 'portada-v.png');
  await render(1920, 1080, portadaH(), 'portada-h.png');
  await render(1080, 1080, portadaC(), 'portada-c.png');
  await render(1920, 1080, cierreH(), 'end-h.png');
  await render(1080, 1080, cierreC(), 'end-c.png');
  // marca y etiquetas son el mismo documento en los tres formatos: se miden solos
  for (const [W, H, t] of [[1080, 1920, 'v'], [1920, 1080, 'h'], [1080, 1080, 'c']]) {
    await render(W, H, marcaT(W, H), `logo-${t}.png`, true);
    for (const e of ESTANCIAS) await render(W, H, etiquetaT(W, H, e), `label-${t}-${nombre(e)}.png`, true);
  }
  /* El story de creativos.js es la pieza aprobada y manda cuando existe. Si la vivienda
   * aún no tiene fotos de ficha, el cierre se arma con un fotograma del propio vídeo en
   * lugar de dejar el reel sin final. */
  const story = path.join(RAIZ, 'creativos', `${p.slug}-story.png`);
  if (fs.existsSync(story)) {
    fs.copyFileSync(story, path.join(OUT, 'end-v.png'));
  } else {
    console.warn('  sin story en creativos/: cierre vertical armado con el fotograma del vídeo');
    await render(1080, 1920, cierreV(), 'end-v.png');
  }
  await browser.close(); console.log('rótulos en', OUT, fs.readdirSync(OUT).length);
})().catch((e) => { console.error('ERROR', e.message); process.exit(1); });
