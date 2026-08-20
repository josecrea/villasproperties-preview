#!/usr/bin/env node
/* prerender.js — Escribir en el HTML lo que hoy solo pinta el JavaScript.
 *
 * POR QUÉ
 * -------
 * Los rastreadores de las IA —GPTBot, ClaudeBot, PerplexityBot— NO ejecutan
 * JavaScript. En `properties.html` el catálogo entero vive dentro de
 * `<div id="catalogueGrid"></div>`, que llega vacío por la red: para esos
 * rastreadores Villa's era una inmobiliaria sin un solo inmueble. Lo mismo con
 * el índice de artículos en `insights.html`.
 *
 * Googlebot sí renderiza, así que para Google el problema es menor, pero
 * depender de que un rastreador ejecute tu web es una apuesta innecesaria
 * cuando el dato ya existe en `properties-data.js` y en `blog-data.js`.
 *
 * CÓMO
 * ----
 * Se abre la página en un navegador de verdad, se deja que el propio JS del
 * sitio pinte, y se copia el resultado al fichero. Es a propósito: la
 * alternativa —reescribir las plantillas de tarjeta aquí— duplicaría la
 * plantilla en dos sitios y el día que cambie una, la otra se queda vieja sin
 * que nadie se entere.
 *
 * Lo escrito queda entre marcas, así que volver a ejecutarlo sustituye en vez
 * de acumular. Y como el JS asigna `innerHTML` (no añade), al cargar la página
 * el navegador reemplaza lo prerenderizado por lo mismo: no hay duplicados.
 *
 * USO
 * ---
 *   node tools/prerender.js            # necesita el servidor local en :4799
 *   node tools/prerender.js --puerto=8080
 *
 * Se ejecuta DESPUÉS de tocar los datos y ANTES de `./tools/sellar.sh`.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('/Users/josecrea/villaradar/node_modules/playwright');

const RAIZ = path.join(__dirname, '..');
const PUERTO = (process.argv.find((a) => a.startsWith('--puerto=')) || '').split('=')[1] || '4799';
const BASE = `http://localhost:${PUERTO}/`;

/* Qué contenedores se vuelcan. Solo contenido que un rastreador debería leer:
   los desplegables y los resultados de calculadora no pintan nada sin que el
   usuario elija algo, así que no aportan y ensuciarían el HTML. */
const OBJETIVOS = [
  { pagina: 'properties.html', ids: ['catalogueGrid'] },
  { pagina: 'insights.html', ids: ['blogFeatured', 'blogGrid'] },
  { pagina: 'index.html', ids: ['propertyGrid'] },
];

const MARCA_INI = '<!--prerender-->';
const MARCA_FIN = '<!--/prerender-->';

(async () => {
  const navegador = await chromium.launch({ channel: 'chrome' });
  /* Contexto limpio: si el navegador arrastra overrides del back office en
     localStorage, se colarían en el HTML publicado. */
  const ctx = await navegador.newContext();
  const pagina = await ctx.newPage();
  let escritos = 0;

  for (const { pagina: fichero, ids } of OBJETIVOS) {
    const ruta = path.join(RAIZ, fichero);
    if (!fs.existsSync(ruta)) { console.log(`  ✘ no existe ${fichero}`); continue; }

    await pagina.goto(BASE + fichero, { waitUntil: 'networkidle', timeout: 45000 });
    await pagina.waitForTimeout(1500);

    let html = fs.readFileSync(ruta, 'utf8');

    for (const id of ids) {
      const dentro = await pagina.evaluate((i) => {
        const el = document.getElementById(i);
        if (!el) return null;
        /* Las clases que añade la animación de entrada son estado de tiempo de
           ejecución, no contenido: se quitan para no publicar un HTML que ya
           venga "revelado" y descuadre la animación al cargar. */
        const copia = el.cloneNode(true);
        copia.querySelectorAll('.is-in').forEach((n) => n.classList.remove('is-in'));
        return copia.innerHTML;
      }, id);

      if (dentro === null) { console.log(`  ✘ ${fichero}: no hay #${id}`); continue; }
      if (!dentro.trim()) { console.log(`  · ${fichero}: #${id} sigue vacío tras renderizar`); continue; }

      /* Se sustituye el contenido del contenedor, venga vacío o ya prerenderizado. */
      const re = new RegExp(`(<(\\w+)[^>]*id="${id}"[^>]*>)([\\s\\S]*?)(</\\2>)`);
      const m = html.match(re);
      if (!m) { console.log(`  ✘ ${fichero}: no encuentro el marcado de #${id}`); continue; }

      html = html.replace(re, `$1${MARCA_INI}${dentro}${MARCA_FIN}$4`);
      const palabras = dentro.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
      console.log(`  ✔ ${fichero.padEnd(18)} #${id.padEnd(15)} ${palabras} palabras al HTML`);
      escritos += 1;
    }

    fs.writeFileSync(ruta, html, 'utf8');
  }

  await navegador.close();
  console.log(`\n  ${escritos} contenedores volcados.`);
  console.log('  Ahora:  ./tools/sellar.sh');
})().catch((e) => {
  console.error('  Error:', e.message);
  console.error('  ¿Está levantado el servidor local en el puerto ' + PUERTO + '?');
  process.exit(1);
});
