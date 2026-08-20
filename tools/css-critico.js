#!/usr/bin/env node
/* ⛔ ESTE SCRIPT ESTÁ ROTO Y NO DEBE EJECUTARSE ⛔
 *
 * Extrae las reglas usadas por sus posiciones de inicio y fin dentro de la
 * hoja, y esas posiciones apuntan a la REGLA, no al @media que la envuelve. Al
 * concatenarlas se pierde el envoltorio y `.nav a{display:none}` —que solo debe
 * aplicar por debajo de 820px— pasa a aplicar SIEMPRE.
 *
 * Resultado: la web se queda SIN NAVEGACIÓN en escritorio. Ha pasado dos veces
 * en producción. La segunda fue por ejecutarlo sin pensar dentro de una cadena
 * de comandos, y por eso ahora se niega a funcionar en lugar de fiarlo a que
 * alguien lea el comentario.
 *
 * Para arreglarlo: reconstruir el @media alrededor de cada regla antes de
 * concatenar, y comprobar que el crítico resultante tiene @media (el roto tenía
 * cero). Luego quitar este bloque.
 */
if (!process.argv.includes('--se-que-esta-roto')) {
  console.error('  ⛔ css-critico.js está roto: pierde los @media y deja la web sin menú.');
  console.error('     Lee la cabecera del fichero. Si de verdad quieres ejecutarlo:');
  console.error('     node tools/css-critico.js --se-que-esta-roto');
  process.exit(1);
}

/* css-critico.js — Que el primer pintado no dependa de 151 KB de CSS.
 *
 * POR QUÉ
 * -------
 * `site.css` pesa 151 KB y es render-blocking: hasta que llega, la página está
 * en blanco. Medido contra la web en vivo con un Pixel 7 a 1,6 Mbps, **llegaba
 * a los 8,2 segundos** aunque solo hubiera 162 KB descargados antes. La causa
 * es HTTP/2: GitHub Pages multiplexa las 28 peticiones sobre una sola conexión,
 * así que todas avanzan a la vez y ninguna termina pronto. El CSS compite con
 * las otras 27 y el visitante mira una pantalla vacía.
 *
 * La solución no es adelantar el CSS —ya se intentó con preload y lo único que
 * consiguió fue retrasar otra cosa— sino no necesitarlo para el primer pintado.
 *
 * CÓMO
 * ----
 * Se abre la página y se le pregunta al navegador, vía la API de cobertura de
 * CSS, qué reglas usa REALMENTE lo que se ve al entrar. Eso se incrusta en el
 * `<head>`. `site.css` sigue cargando igual, pero ya sin bloquear nada.
 *
 * Se extrae en vez de escribirse a mano a propósito: un CSS crítico copiado a
 * mano se desincroniza en cuanto alguien toca un color, y entonces la página
 * parpadea al cargar el completo. Esto se regenera.
 *
 * USO
 * ---
 *   node tools/css-critico.js        # necesita el servidor local en :4799
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('/Users/josecrea/villaradar/node_modules/playwright');

const RAIZ = path.join(__dirname, '..');
const BASE = 'http://localhost:4799/';
const MARCA_INI = '<style data-critico>';
const MARCA_FIN = '</style>';

/* Se recorre más de una página y más de un tamaño: el CSS crítico de la portada
   no sirve para una ficha de artículo, y lo que se ve en un móvil de 360 px no
   es lo que se ve en un portátil. La unión de todos es lo que se incrusta. */
const MUESTRAS = [
  ['index.html', { width: 1440, height: 900 }],
  ['index.html', devices['Pixel 7'].viewport],
  ['properties.html', devices['Pixel 7'].viewport],
  ['sell.html', { width: 1440, height: 900 }],
  ['post-mapa-metro-cuadrado.html', devices['Pixel 7'].viewport],
];

(async () => {
  const navegador = await chromium.launch({ channel: 'chrome' });
  const usadas = new Set();

  for (const [pagina, viewport] of MUESTRAS) {
    const ctx = await navegador.newContext({ viewport });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    await cdp.send('CSS.startRuleUsageTracking');

    await p.goto(BASE + pagina, { waitUntil: 'load', timeout: 45000 });
    /* Sin scroll: interesa lo que se ve AL ENTRAR, que es lo que decide el
       primer pintado. Lo de más abajo puede esperar a site.css. */
    await p.waitForTimeout(2500);

    const { ruleUsage } = await cdp.send('CSS.stopRuleUsageTracking');
    const hojas = {};
    for (const r of ruleUsage) {
      if (!r.used) continue;
      if (!hojas[r.styleSheetId]) {
        try {
          hojas[r.styleSheetId] = (await cdp.send('CSS.getStyleSheetText',
            { styleSheetId: r.styleSheetId })).text;
        } catch { hojas[r.styleSheetId] = ''; }
      }
      const texto = hojas[r.styleSheetId].slice(r.startOffset, r.endOffset).trim();
      if (texto) usadas.add(texto);
    }
    await ctx.close();
  }

  await navegador.close();

  /* Las @font-face y las variables de :root no salen en la cobertura porque no
     son reglas "usadas" en el sentido del selector, pero sin ellas el primer
     pintado sale con otra tipografía y otros colores, y eso es peor que
     esperar. Se añaden a mano desde el fichero. */
  const completo = fs.readFileSync(path.join(RAIZ, 'site.css'), 'utf8');
  const raiz = completo.match(/:root\{[^}]*\}/g) || [];
  const fuentes = completo.match(/@font-face\{[^}]*\}/g) || [];

  /* El preloader y el aviso de cookies son un caso aparte y hay que forzarlos.
     La cobertura los da por "usados" al entrar —correcto— pero NO recoge las
     reglas que los hacen desaparecer, porque en ese instante todavía no se han
     aplicado. Sin ellas, si site.css tarda, el logo del preloader se queda
     pintado encima del hero. Se vio en una captura, no en un número. */
  const forzadas = [];
  const reRegla = /(?:^|\})\s*([^{}@]+?)\{([^}]*)\}/g;
  let mm;
  while ((mm = reRegla.exec(completo)) !== null) {
    const sel = mm[1].trim();
    if (/is-loaded|vp-progreso|vp-consent|^body::(before|after)|body::(before|after)/.test(sel)) {
      forzadas.push(`${sel}{${mm[2]}}`);
    }
  }
  /* Y los fotogramas que usan esas reglas: una animación sin su @keyframes deja
     el elemento en su estado inicial, o sea visible. */
  const claves = new Set();
  forzadas.concat([...usadas]).forEach((r) => {
    (r.match(/animation:\s*([\w-]+)/g) || []).forEach((a) => claves.add(a.split(/\s+/).pop()));
  });
  const keyframes = [];
  for (const k of claves) {
    const re = new RegExp(`@keyframes\\s+${k}\\s*\\{(?:[^{}]|\\{[^{}]*\\})*\\}`, 'g');
    const f = completo.match(re);
    if (f) keyframes.push(...f);
  }

  /* La cobertura marca como "usada" cualquier regla que case con algún elemento
     del documento, esté o no en pantalla. Con eso salían 70 KB, y un crítico de
     ese tamaño deja de compensar: duplica reglas con site.css y cada recálculo
     de estilo se paga dos veces. Medido con Lighthouse, el TBT subía de 1.247 a
     5.382 ms.

     Se filtra a lo que compone la primera pantalla —cabecera, hero, preloader y
     los tokens de tipografía y color— y el resto lo trae site.css, que ya no
     bloquea. */
  const PRIMERA_PANTALLA = /^(:root|html|body|\*|a|img|h1|p\b|\.wrap|\.hero|\.head|\.brand|\.wordmark|\.lockup|\.monogram|\.nav|\.header|\.film|\.eye|\.btn|\.scroll-cue|\.skip|\.vp-|\.is-loaded|\.motion|\[data-|@)/;
  const filtradas = [...usadas].filter((r) => {
    const sel = r.slice(0, r.indexOf('{')).trim();
    return sel.split(',').some((x) => PRIMERA_PANTALLA.test(x.trim()));
  });

  let critico = [...raiz, ...fuentes, ...forzadas, ...keyframes, ...filtradas].join('');
  /* Comprimir lo evidente: sobran espacios porque se ha cortado del fichero. */
  critico = critico.replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;\}/g, '}').replace(/\s{2,}/g, ' ');

  const bloque = `${MARCA_INI}${critico}${MARCA_FIN}`;
  const kb = (Buffer.byteLength(critico) / 1024).toFixed(1);

  let tocadas = 0;
  for (const f of fs.readdirSync(RAIZ).filter((x) => x.endsWith('.html'))) {
    const ruta = path.join(RAIZ, f);
    let html = fs.readFileSync(ruta, 'utf8');
    const m = html.match(/<link rel="stylesheet" href="site\.css[^"]*">/);
    if (!m) continue;

    /* Con el crítico dentro, `site.css` ya no hace falta para pintar. Se carga
       como hoja de impresión —que el navegador no considera bloqueante— y en
       cuanto llega se le cambia el media a `all`. El <noscript> cubre a quien
       no ejecute JavaScript, que si no se quedaría con solo el crítico. */
    const asincrono = m[0].replace('>', ' media="print" onload="this.media=\'all\'">')
      + `<noscript>${m[0]}</noscript>`;

    const re = new RegExp(`${MARCA_INI}[\\s\\S]*?${MARCA_FIN}`);
    if (re.test(html)) {
      html = html.replace(re, bloque);
      if (!html.includes('media="print"')) html = html.replace(m[0], asincrono);
    } else {
      html = html.replace(m[0], `${bloque}\n${asincrono}`);
    }

    fs.writeFileSync(ruta, html, 'utf8');
    tocadas += 1;
  }

  console.log(`  ✔ ${kb} KB de CSS crítico en línea, en ${tocadas} páginas`);
  console.log(`     (site.css completo: ${(fs.statSync(path.join(RAIZ, 'site.css')).size / 1024).toFixed(0)} KB)`);
  console.log('\n  Ahora:  ./tools/sellar.sh');
})().catch((e) => {
  console.error('  Error:', e.message);
  console.error('  ¿Está el servidor local en :4799?');
  process.exit(1);
});
