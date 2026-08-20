#!/usr/bin/env node
/* redirecciones.js — El mapa 301 de la web vieja a la nueva.
 *
 * POR QUÉ
 * -------
 * `villasproperties.es` tiene 53 URLs vivas en su sitemap. Apuntar el dominio a
 * la web nueva sin redirigirlas las convierte en 404 y se pierde el
 * posicionamiento que ya tienen. Una 301 traslada ese valor a la URL nueva; un
 * 404 lo tira.
 *
 * NO TODO SE REDIRIGE
 * -------------------
 * Media docena son fontanería de Odoo que nunca debió estar en el sitemap
 * (`/forum`, `/events`, `/profile/users`, `/intro/odoo/...`). Redirigirlas a la
 * portada sería peor que dejarlas morir: Google trata una 301 masiva hacia la
 * home como un "soft 404" y la ignora igual, pero además ensucia el mapa. Esas
 * se marcan como 410 (se fue y no vuelve), que es la respuesta honesta.
 *
 * SALIDA
 * ------
 *   REDIRECCIONES.md      la tabla, para revisar y para tenerla escrita
 *   redirecciones.map     formato nginx, listo para pegar
 *   _redirects            formato Netlify/Cloudflare Pages
 *
 * USO
 * ---
 *   node tools/redirecciones.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');

/* Cada entrada dice a dónde va y POR QUÉ, porque dentro de seis meses nadie se
   acuerda de por qué /catalogo apunta a properties y no a buy. */
const MAPA = [
  ['/', '/', 'la portada es la portada'],
  ['/about-us', '/contact.html', 'quién está detrás vive ahora en contacto, con la bio de Valeria'],
  ['/contactus', '/contact.html', 'mismo propósito'],
  ['/catalogo', '/properties.html', 'el catálogo de inmuebles'],
  ['/galeria', '/properties.html', 'las fotos viven en las fichas del catálogo'],
  ['/encuentra-tu-casa', '/buy.html', 'el embudo de comprador'],
  ['/vendemos-tu-casa', '/sell.html', 'el embudo de vendedor'],
  ['/servicios-inmobiliarios', '/sell.html', 'servicios = lo que se hace al vender'],
  ['/valoracion-gratis-tenerife', '/valuation.html', 'el valorador, mismo propósito y misma intención de búsqueda'],
  ['/cuanto-vale-tu-piso-ahora-mismo', '/valuation.html', 'ídem'],
  ['/formulario-captacion', '/valuation.html', 'el formulario de captación es ahora el valorador'],
  ['/market-impact', '/market-impact.html', 'existe con el mismo nombre'],
  ['/financiacion', '/financiacion/', 'OJO: la carpeta redirige a /r/financiacion para no romper la comisión de Bayteca'],
  ['/referidos', '/r/financiacion/', 'programa de referidos = la entrada con atribución'],
  ['/privacy', '/privacy.html', 'política de privacidad'],
  ['/terms', '/privacy.html', 'no hay página de términos aparte; privacidad la cubre'],
  ['/blog', '/insights.html', 'el índice del blog'],
  ['/blog/4', '/insights.html', 'la categoría con contenido'],
];

/* Los 8 artículos conservan su slug exacto: se exportaron así justamente para
   que la redirección sea mecánica y no haya que decidir nada. */
const ARTICULOS = [
  'estudio-anual-del-mercado-inmobiliario-1',
  'cuanto-vale-realmente-mi-villa-en-tenerife-la-clave-esta-en-la-precision-no-en-la-prisa-2',
  'invertir-en-tenerife-por-que-la-seguridad-juridica-es-mas-importante-que-la-rentabilidad-3',
  'de-adeje-al-norte-las-zonas-de-tenerife-que-marcaran-la-revalorizacion-en-2026-4',
  'como-vender-una-casa-5',
  'como-vender-una-casa-fase-2-6',
  'el-precio-de-la-vivienda-en-espana-se-ha-incrementado-un-45-en-los-ultimos-diez-anos-7',
  'por-que-tu-casa-no-se-vende-en-tenerife-8',
];
for (const s of ARTICULOS) MAPA.push([`/blog/4/${s}`, `/post-${s}.html`, 'artículo rescatado, mismo slug']);

const MUNICIPIOS = ['adeje', 'arona', 'granadilla-de-abona', 'guia-de-isora',
  'san-miguel-de-abona', 'santiago-del-teide'];
for (const m of MUNICIPIOS) {
  MAPA.push([`/vender-casa-${m}`, `/vender-casa-${m}.html`, 'landing municipal, mismo slug']);
}

/* Se van y no vuelven. Un 410 le dice a Google que deje de pedirla, cosa que un
   404 tarda mucho más en conseguir. */
const MUERTAS = [
  ['/acm', 'módulo de Odoo, nunca fue contenido'],
  ['/intro/odoo/action-website-website-preview', 'URL interna del editor de Odoo'],
  ['/landing-pages', 'plantilla de Odoo sin contenido propio'],
  ['/landin-pages-2', 'ídem, y con la errata incluida'],
  ['/planes-de-precios', 'no se venden planes: el modelo es comisión'],
  ['/pricing', 'ídem'],
  ['/shop', 'no hay tienda'],
  ['/website/info', 'página de diagnóstico de Odoo'],
  ['/events', 'módulo de eventos sin usar'],
  ['/forum', 'foro sin usar'],
  ['/forum/ayuda-1', 'ídem'],
  ['/forum/ayuda-1/faq', 'ídem'],
  ['/profile/users', 'perfiles del portal de Odoo'],
  ['/profile/ranks_badges', 'ídem'],
  ['/blog/1', 'categoría de blog vacía'],
  ['/blog/2', 'ídem'],
  ['/blog/3', 'ídem'],
  ['/blog/1/feed', 'RSS de categoría vacía'],
  ['/blog/2/feed', 'ídem'],
  ['/blog/3/feed', 'ídem'],
  ['/blog/4/feed', 'el RSS nuevo no existe todavía; si se crea, redirigir aquí'],
];

/* Aviso si alguna redirección apunta a una página que no existe: es el fallo
   que convierte una migración en una cadena de 404 con paso intermedio. */
const faltan = MAPA.filter(([, d]) => {
  if (d === '/') return false;
  const rel = d.replace(/^\//, '');
  return !fs.existsSync(path.join(RAIZ, rel.endsWith('/') ? rel + 'index.html' : rel));
});

const md = `# Mapa de redirecciones — villasproperties.es

> Generado por \`tools/redirecciones.js\`. **No editar a mano:** se regenera.

La web actual declara **53 URLs** en su sitemap. Aquí van todas: ${MAPA.length}
se redirigen con 301 y ${MUERTAS.length} se dan de baja con 410.

Una 301 traslada el posicionamiento acumulado a la URL nueva; un 404 lo tira.
Por eso importa hacerlo **antes** de cambiar el DNS y no después.

## Se redirigen (301)

| Vieja | Nueva | Por qué |
|---|---|---|
${MAPA.map(([o, d, p]) => `| \`${o}\` | \`${d}\` | ${p} |`).join('\n')}

## Se dan de baja (410)

No se redirigen a la portada a propósito: Google trata una 301 masiva hacia la
home como un *soft 404* y la ignora igual, pero además ensucia el mapa. El 410
dice "se fue y no vuelve", y deja de pedirla antes.

| URL | Qué era |
|---|---|
${MUERTAS.map(([o, p]) => `| \`${o}\` | ${p} |`).join('\n')}

## Antes de aplicar

1. El sitemap viejo declara las URLs en **http://**, no https. Al migrar hay que
   corregirlo o se pierde la señal de canonicidad.
2. \`/financiacion\` **no** apunta a \`finance.html\` directamente: pasa por
   \`/financiacion/\`, que redirige a \`/r/financiacion\`. Esa cadena preserva la
   atribución de Bayteca, que paga comisión por cierre. Romperla no da error:
   simplemente deja de cobrarse.
3. Vigilar 404 en Search Console la semana siguiente al cambio.
`;

fs.writeFileSync(path.join(RAIZ, 'REDIRECCIONES.md'), md, 'utf8');

fs.writeFileSync(path.join(RAIZ, 'redirecciones.map'),
  `# nginx — incluir dentro del bloque server\n`
  + MAPA.map(([o, d]) => `rewrite ^${o}/?$ ${d} permanent;`).join('\n')
  + `\n\n# se van y no vuelven\n`
  + MUERTAS.map(([o]) => `location = ${o} { return 410; }`).join('\n') + '\n', 'utf8');

fs.writeFileSync(path.join(RAIZ, '_redirects'),
  `# Netlify / Cloudflare Pages\n`
  + MAPA.map(([o, d]) => `${o}  ${d}  301`).join('\n')
  + '\n' + MUERTAS.map(([o]) => `${o}  /  410`).join('\n') + '\n', 'utf8');

console.log(`  ✔ ${MAPA.length} redirecciones 301 · ${MUERTAS.length} bajas 410 · ${MAPA.length + MUERTAS.length} URLs cubiertas`);
if (faltan.length) {
  console.log(`\n  🔴 ${faltan.length} apuntan a una página que NO existe:`);
  faltan.forEach(([o, d]) => console.log(`     ${o} → ${d}`));
} else {
  console.log('  ✔ todos los destinos existen');
}
console.log('\n  REDIRECCIONES.md · redirecciones.map (nginx) · _redirects (Netlify)');
