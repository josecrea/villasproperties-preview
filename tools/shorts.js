#!/usr/bin/env node
/* shorts.js — Un vídeo vertical por vivienda, para Reels, TikTok, Shorts y
 * estado de WhatsApp. Sale MP4 (para publicar) y GIF (para pegar en un chat).
 *
 * POR QUÉ NO SE GENERA CON IA
 * ---------------------------
 * Animar la foto de un piso con un modelo de vídeo inventa lo que no se ve:
 * continúa paredes, rellena esquinas, mueve muebles. Es una vivienda REAL que
 * alguien va a visitar. Aquí el movimiento es honesto: un recorrido por las
 * fotos que existen, con acercamiento lento (Ken Burns) y texto encima.
 *
 * CÓMO SE CAPTURA (y por qué así)
 * -------------------------------
 * Todo es CSS: cada animación dura lo mismo que el vídeo entero y sus
 * keyframes van en porcentaje. Se arrancan PAUSADAS y, fotograma a fotograma,
 * se les fija `currentTime`. Así la captura es determinista: el fotograma 37 es
 * siempre idéntico. Con animaciones corriendo en tiempo real, cada pasada
 * saldría distinta y con saltos, porque el screenshot no espera al reloj.
 *
 * RITMO (10 s, lo que aguanta un pulgar)
 * --------------------------------------
 *   0,0-3,0  gancho          la frase que para el dedo
 *   3,0-5,8  precio          el dato que decide
 *   5,8-7,8  datos y rasgos  por qué merece la visita
 *   7,8-10   contacto        teléfono, web y mapa
 * Las fotos van pasando por debajo todo el rato, una cada ~2 s.
 *
 * USO
 *   node tools/shorts.js                 todas las viviendas «En venta»
 *   node tools/shorts.js 111258127       solo esa referencia
 *   node tools/shorts.js --fps 25        más fluido y más lento de generar
 *   node tools/shorts.js --sin-gif       solo MP4
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const RAIZ = path.join(__dirname, '..');
const OUT = path.join(RAIZ, 'creativos', 'shorts');
const TMP = path.join(RAIZ, 'creativos', '.fotogramas');
const WEB = 'villasproperties.es';
const TEL = '+34 667 384 965';
const [W, H] = [1080, 1920];

const args = process.argv.slice(2);
const sinGif = args.includes('--sin-gif');

/* La referencia es el argumento suelto: cualquier número que NO vaya detrás de
 * una `--opcion`. Antes se pedían 6 dígitos o más para no confundirla con el
 * valor de `--fps 20`, y el Biltmore —ref 14541, cinco dígitos— no colaba por
 * el filtro: `shorts.js 14541` se entendía como "todas" y generaba las siete
 * viviendas en silencio. Filtrar por longitud era adivinar; esto lo sabe. */
const soloRef = args.find((a, i) => /^\d+$/.test(a) && !(i > 0 && args[i - 1].startsWith('--')));

/* Lee `--opcion valor`. Escrito a lo tonto —`args[args.indexOf('--fps') + 1]`—
 * cuando la opción NO está, indexOf da -1 y coge args[0]: con `shorts.js
 * 111230958` los fps pasaban a ser 111.230.958 y el script se ponía a capturar
 * mil millones de fotogramas. Por eso hay tope y comprobación. */
const opcion = (nombre, pordefecto) => {
  const i = args.indexOf(nombre);
  const v = i >= 0 ? Number(args[i + 1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : pordefecto;
};
const FPS = Math.min(30, opcion('--fps', 20));
const DUR = Math.min(20000, opcion('--segundos', 10) * 1000);
const TOTAL = Math.round((DUR / 1000) * FPS);
const MAX_FOTOS = 5;
if (TOTAL > 600) { console.error(`  🔴 ${TOTAL} fotogramas es demasiado. Revisa --fps y --segundos.`); process.exit(1); }

global.window = {};
require(path.join(RAIZ, 'properties-data.js'));
const COPY = require('./creativos-copy.js');
const MAPA = require('./tenerife-mapa.js');

const props = (global.window.VP_PROPERTIES || [])
  .filter((p) => p.status === 'En venta' && (!soloRef || String(p.ref) === soloRef));
if (!props.length) { console.error('  No hay propiedades que encajen.'); process.exit(1); }

/* ---------- helpers (los mismos criterios que creativos.js) ---------- */
const num = (n) => new Intl.NumberFormat('es-ES', { useGrouping: 'always' }).format(n);
const precio = (n) => num(n) + ' €';
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const b64 = (f) => `data:${f.endsWith('.png') ? 'image/png' : 'image/webp'};base64,${fs.readFileSync(f).toString('base64')}`;
const plural = (n, s, pl) => `${n} ${n === 1 ? s : pl}`;
const zonaCorta = (p) => String(p.zone || p.town || '').split('(')[0].trim();
const gancho = (s) => esc(s).replace(/\s*\|\s*/g, '<br>');
const llano = (s) => String(s || '').replace(/\s*\|\s*/g, ' ');
const cuerpoTitular = (texto, ancho, { max = 112, min = 62 } = {}) => {
  const linea = String(texto).split('|').reduce((a, b) => (a.length > b.length ? a : b), '').trim();
  return Math.max(min, Math.min(max, Math.round(ancho / (linea.length * 0.44))));
};

const FUENTES = fs.readFileSync(path.join(RAIZ, 'assets/fonts/fonts.local.css'), 'utf8')
  .replace(/url\('([^']+)'\)/g, (_, f) => `url('${b64(path.join(RAIZ, 'assets/fonts', f))}')`);
const LOGO = b64(path.join(RAIZ, 'assets/brand/logo-mark.png'));

/* Fotos reales de la vivienda, en orden, hasta MAX_FOTOS. La primera es la que
 * el copy haya elegido como portada: si la 01 es un muro, no abre el vídeo. */
function fotos(p) {
  const dir = path.join(RAIZ, 'assets/img', p.slug);
  if (!fs.existsSync(dir)) return [];
  const todas = fs.readdirSync(dir).filter((f) => /^\d+\.webp$/.test(f)).sort();
  const portada = String((COPY[p.ref] || {}).foto || 1).padStart(2, '0') + '.webp';
  const resto = todas.filter((f) => f !== portada);
  return [todas.includes(portada) ? portada : todas[0], ...resto]
    .filter(Boolean).slice(0, MAX_FOTOS).map((f) => path.join(dir, f));
}

/* ---------- el documento animado ---------- */
function html(p) {
  const t = COPY[p.ref] || {};
  const fs_ = fotos(p);
  const n = fs_.length;
  const seg = 100 / n;                       // % de la línea de tiempo por foto
  const [mx, my] = MAPA.punto(p.coords[0], p.coords[1]);
  const datos = [`${p.built} m²`, plural(p.beds, 'dormitorio', 'dormitorios'), plural(p.baths, 'baño', 'baños')].join('   ·   ');

  /* Una animación por foto: aparece, acompaña con un acercamiento lento y se va.
   * El cruce de ~0,3 s entre diapositivas evita el corte seco, y las opacidades
   * de las dos que se cruzan suman 1 en todo momento: nunca se ve el fondo.
   *
   * La PRIMERA arranca ya visible y la ÚLTIMA se queda hasta el final. Con un
   * fundido de entrada y salida como las demás, el vídeo abría en negro y
   * cerraba oscureciéndose: justo los dos fotogramas que se usan de portada y
   * los que decide el reproductor cuando hace bucle. */
  const CRUCE = 1.6;                                   // % de la línea de tiempo
  const keyframesFotos = fs_.map((_, i) => {
    const primera = i === 0, ultima = i === n - 1;
    const ini = i * seg, fin = (i + 1) * seg;
    const pasos = [];
    if (primera) pasos.push('0%{opacity:1}');
    else pasos.push(`0%,${(ini - CRUCE).toFixed(2)}%{opacity:0}`, `${(ini + CRUCE).toFixed(2)}%{opacity:1}`);
    if (ultima) pasos.push('100%{opacity:1}');
    else pasos.push(`${(fin - CRUCE).toFixed(2)}%{opacity:1}`, `${(fin + CRUCE).toFixed(2)}%,100%{opacity:0}`);
    return `@keyframes diapo${i}{${pasos.join(' ')}}
    @keyframes zoom${i}{from{transform:scale(1.04) translate(0,0)}to{transform:scale(1.13) translate(${i % 2 ? '-1.5%' : '1.5%'},${i % 3 ? '-1%' : '1%'})}}`;
  }).join('\n');

  const capas = fs_.map((f, i) => `<img class="diapo" alt="" src="${b64(f)}" style="animation:diapo${i} ${DUR}ms linear forwards, zoom${i} ${DUR}ms linear forwards">`).join('\n');

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
${FUENTES}
:root{--negro:#0b0a08;--crema:#f3ead7;--crema-2:#d9cdb3;--papel:#f6efe1;--tinta:#1a1712;
  --oro:#e6bd6a;--oro-2:#f5dc9a;--oro-3:#c98f3c}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:var(--negro);font-family:'Jost',sans-serif;-webkit-font-smoothing:antialiased}
.lienzo{position:relative;width:${W}px;height:${H}px;overflow:hidden;color:var(--crema)}
.serif{font-family:'EB Garamond',serif;font-variant-numeric:lining-nums}
.oro-texto{background:linear-gradient(100deg,var(--oro-2) 0%,var(--oro) 45%,var(--oro-3) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
/* TODAS las animaciones arrancan pausadas: el tiempo lo fija la captura */
*,*::before,*::after{animation-play-state:paused !important}

.diapo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 45%}
${keyframesFotos}
.velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,8,.66) 0%,rgba(11,10,8,.24) 11%,rgba(11,10,8,0) 24%,rgba(11,10,8,0) 56%,rgba(11,10,8,.18) 78%,rgba(11,10,8,.42) 100%)}
.grano{position:absolute;inset:0;opacity:.13;mix-blend-mode:overlay;pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0.9  0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 .55 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>")}

/* marca: entra al principio y se queda */
.marca{position:absolute;left:64px;top:276px;display:flex;align-items:center;gap:22px;animation:entra ${DUR}ms linear forwards}
.marca img{width:150px;height:150px;filter:drop-shadow(0 8px 24px rgba(0,0,0,.6))}
.marca .n{font-family:'EB Garamond',serif;font-weight:600;font-size:62px;line-height:1;text-shadow:0 2px 12px rgba(0,0,0,.75)}
.marca .s{font-size:26px;letter-spacing:.3em;text-transform:uppercase;color:var(--oro-2);font-weight:500;margin-top:11px;text-shadow:0 2px 8px rgba(0,0,0,.95)}
@keyframes entra{0%{opacity:0;transform:translateY(26px)}4%{opacity:1;transform:none}100%{opacity:1;transform:none}}

/* cinta: barre la pieza al entrar */
.cinta{position:absolute;left:-8%;right:-14%;top:46%;transform:rotate(-6deg);background:var(--oro);color:var(--negro);
  font-size:37px;font-weight:600;letter-spacing:.38em;text-transform:uppercase;padding:22px 0;white-space:nowrap;overflow:hidden;
  box-shadow:0 18px 60px rgba(0,0,0,.55);animation:cinta ${DUR}ms linear forwards}
.cinta span{display:inline-block;padding-left:120px;animation:corre ${DUR}ms linear forwards}
@keyframes cinta{0%{opacity:0;transform:rotate(-6deg) translateX(-14%)}3%{opacity:0;transform:rotate(-6deg) translateX(-14%)}
  9%{opacity:1;transform:rotate(-6deg) translateX(0)}100%{opacity:1;transform:rotate(-6deg) translateX(0)}}
@keyframes corre{from{transform:translateX(0)}to{transform:translateX(-22%)}}

/* los cuatro relevos: cada bloque entra, se queda su turno y sale */
.acto{position:absolute;left:64px;right:64px;bottom:252px;z-index:2;animation:acto ${DUR}ms linear forwards}
/* cada acto se trae su fondo: así la foto respira arriba y el texto se lee */
.acto::before{content:'';position:absolute;left:-96px;right:-96px;top:-80px;bottom:-300px;z-index:-1;pointer-events:none;
  background:linear-gradient(180deg,rgba(11,10,8,0) 0%,rgba(11,10,8,.70) 24%,rgba(11,10,8,.93) 56%,var(--negro) 84%)}
.acto.a2,.acto.a3,.acto.a4{opacity:0}
@keyframes acto{0%{opacity:0;transform:translateY(30px)}
  8%{opacity:1;transform:none} 28%{opacity:1;transform:none}
  32%{opacity:0;transform:translateY(-22px)} 100%{opacity:0;transform:translateY(-22px)}}
@keyframes acto2{0%,28%{opacity:0;transform:translateY(30px)}
  34%{opacity:1;transform:none} 55%{opacity:1;transform:none}
  59%{opacity:0;transform:translateY(-22px)} 100%{opacity:0}}
@keyframes acto3{0%,55%{opacity:0;transform:translateY(30px)}
  61%{opacity:1;transform:none} 75%{opacity:1;transform:none}
  79%{opacity:0;transform:translateY(-22px)} 100%{opacity:0}}
@keyframes acto4{0%,75%{opacity:0;transform:translateY(34px)}
  82%{opacity:1;transform:none} 100%{opacity:1;transform:none}}
.acto.a2{animation:acto2 ${DUR}ms linear forwards}
.acto.a3{animation:acto3 ${DUR}ms linear forwards}
.acto.a4{animation:acto4 ${DUR}ms linear forwards}

.kicker{font-size:29px;letter-spacing:.2em;text-transform:uppercase;color:var(--oro-2);font-weight:500;margin-bottom:22px;text-shadow:0 2px 10px rgba(0,0,0,.9)}
.gancho{font-family:'EB Garamond',serif;font-weight:600;font-size:${cuerpoTitular(t.gancho || p.titleShort, 950)}px;line-height:.98;letter-spacing:-.012em;text-shadow:0 2px 14px rgba(0,0,0,.7)}
.cita{margin-top:24px;font-size:31px;line-height:1.34;color:var(--crema-2);max-width:900px;text-shadow:0 2px 10px rgba(0,0,0,.85)}
.precio{font-style:italic;font-weight:500;font-size:250px;line-height:.82;letter-spacing:-.035em;white-space:nowrap;filter:drop-shadow(0 8px 30px rgba(0,0,0,.65))}
.precio i{font-style:italic;font-size:.42em;margin-left:10px}
.m2{margin-top:18px;font-size:30px;letter-spacing:.2em;text-transform:uppercase;color:var(--crema-2)}
.datos{font-size:42px;letter-spacing:.06em;text-transform:uppercase;color:var(--oro-2);font-weight:500;text-shadow:0 2px 10px rgba(0,0,0,.9)}
.rasgos{list-style:none;margin-top:30px;font-size:34px;line-height:1.85;color:var(--crema);text-shadow:0 2px 10px rgba(0,0,0,.9)}
.rasgos li::before{content:'—';color:var(--oro);margin-right:16px}
/* contacto final */
.fin{display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
.fin .q{font-size:27px;letter-spacing:.24em;text-transform:uppercase;color:var(--oro);font-weight:600}
.fin .tel{font-family:'EB Garamond',serif;font-weight:600;font-size:86px;line-height:1;margin-top:16px;white-space:nowrap}
.fin .web{font-size:44px;letter-spacing:.1em;color:var(--crema);font-weight:500;margin-top:18px}
.fin .ref{font-size:21px;letter-spacing:.16em;text-transform:uppercase;color:rgba(243,234,215,.55);margin-top:14px}
.mapa svg{display:block;filter:drop-shadow(0 4px 14px rgba(0,0,0,.5))}
.mapa figcaption{font-size:21px;letter-spacing:.2em;text-transform:uppercase;text-align:center;color:var(--oro);margin-top:12px}
</style></head><body><div class="lienzo">
${capas}
<div class="velo"></div><div class="grano"></div>
<div class="marca"><img src="${LOGO}" alt=""><div><div class="n">Villa’s Properties</div><div class="s">Tenerife Sur</div></div></div>
<div class="cinta"><span>${[1, 2, 3, 4].map(() => `${esc(zonaCorta(p))} &nbsp;·&nbsp; ${esc(p.town)}`).join(' &nbsp;·&nbsp; ')}</span></div>

<section class="acto a1">
  <div class="kicker">${esc(t.kicker || p.town)}</div>
  <h1 class="gancho">${gancho(t.gancho || p.titleShort)}</h1>
</section>

<section class="acto a2">
  <div class="kicker">${esc(p.town)}</div>
  <div class="precio serif oro-texto">${esc(num(p.price))}<i>€</i></div>
  ${p.pricePerM2 ? `<div class="m2">${esc(num(p.pricePerM2))} €/m²</div>` : ''}
</section>

<section class="acto a3">
  <div class="datos">${esc(datos)}</div>
  <ul class="rasgos">${(t.pruebas || []).slice(0, 3).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
</section>

<section class="acto a4">
  <div class="fin">
    <div>
      <div class="q">Pide visita por WhatsApp</div>
      <div class="tel serif oro-texto">${TEL.replace('+34 ', '')}</div>
      <div class="web">${WEB}</div>
      <div class="ref">Ref. ${esc(p.ref)}</div>
    </div>
    <figure class="mapa">
      <svg viewBox="0 0 ${MAPA.W} ${MAPA.H}" width="210" height="${Math.round(210 * MAPA.H / MAPA.W)}">
        <path d="${MAPA.SILUETA}" fill="rgba(243,234,215,.10)" stroke="var(--oro)" stroke-width="1.1" stroke-linejoin="round"/>
        <circle cx="${mx}" cy="${my}" r="7.5" fill="var(--oro)" opacity=".22"/>
        <circle cx="${mx}" cy="${my}" r="3.4" fill="var(--oro)" stroke="var(--negro)" stroke-width="1.1"/>
      </svg>
      <figcaption>${esc(p.town)}</figcaption>
    </figure>
  </div>
</section>
</div></body></html>`;
}

/* ---------- captura y montaje ---------- */
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const hechos = [];

  for (const p of props) {
    const imgs = fotos(p);
    if (imgs.length < 2) { console.warn(`  ⚠ ${p.ref} tiene ${imgs.length} foto(s): sin vídeo`); continue; }

    const dir = path.join(TMP, p.slug);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await page.setContent(html(p), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    /* Sin esto salían fotogramas con la foto a medio pintar: decode() obliga al
     * navegador a tener el mapa de bits listo ANTES del primer screenshot. */
    const listas = await page.evaluate(async () => {
      const imgs = [...document.querySelectorAll('img.diapo')];
      await Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
      return imgs.filter((i) => i.complete && i.naturalWidth > 0).length;
    });
    if (listas !== imgs.length) { console.warn(`\n  ⚠ ${p.ref}: solo ${listas} de ${imgs.length} fotos decodificadas`); }
    await page.waitForTimeout(300);

    process.stdout.write(`  ▶ ${p.ref} ${p.slug} · ${imgs.length} fotos · ${TOTAL} fotogramas `);
    for (let i = 0; i < TOTAL; i++) {
      const ms = (i / (TOTAL - 1)) * DUR;
      await page.evaluate((t) => {
        document.getAnimations().forEach((a) => { a.currentTime = t; });
        // dos vueltas: la primera aplica el estado, la segunda garantiza el pintado
        return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      }, ms);
      await page.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 92 });
      if (i % 40 === 0) process.stdout.write('.');
    }
    await page.close();

    const mp4 = path.join(OUT, `${p.slug}-short.mp4`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS),
      '-i', path.join(dir, '%04d.jpg'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', mp4]);

    let gif = '';
    if (!sinGif) {
      /* GIF con paleta propia: sin ella, los degradados y el oro salen sucios.
       * 480 px y 12 fps para que pese lo que admite un chat. */
      gif = path.join(OUT, `${p.slug}-short.gif`);
      const paleta = path.join(dir, 'paleta.png');
      const filtro = 'fps=10,scale=400:-1:flags=lanczos';
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-vf', `${filtro},palettegen=max_colors=160`, paleta]);
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-i', paleta,
        '-lavfi', `${filtro} [x]; [x][1:v] paletteuse=dither=sierra2_4a`, gif]);
    }
    fs.rmSync(dir, { recursive: true, force: true });

    const kb = (f) => Math.round(fs.statSync(f).size / 1024);
    console.log(` ✔ ${kb(mp4)} KB mp4${gif ? ` · ${kb(gif)} KB gif` : ''}`);
    hechos.push({ p, mp4, gif });
  }

  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });

  /* texto para acompañar a cada vídeo */
  const copy = ['# Copy de los shorts — Villa’s Properties', '',
    `Generado el ${new Date().toISOString().slice(0, 10)}. ${DUR / 1000} s · ${FPS} fps · 1080×1920.`, ''];
  for (const { p } of hechos) {
    const t = COPY[p.ref] || {};
    copy.push(`## ${llano(t.gancho || p.titleShort)} — ${precio(p.price)}`, '',
      `${t.cita || ''}`.trim(), '',
      `${p.built} m² · ${plural(p.beds, 'dormitorio', 'dormitorios')} · ${plural(p.baths, 'baño', 'baños')} · ${zonaCorta(p)}, ${p.town}`,
      `Ficha completa → https://${WEB}/property.html?ref=${p.ref}`,
      `Visitas por WhatsApp → ${TEL}`, '');
  }
  fs.writeFileSync(path.join(OUT, 'COPY-SHORTS.md'), copy.join('\n'));
  console.log(`\n  ${hechos.length} vídeos en creativos/shorts/ · COPY-SHORTS.md`);
})().catch((e) => { console.error('  🔴', e.message); process.exit(1); });
