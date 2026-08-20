#!/usr/bin/env node
/* exportar-blog-odoo.js — Rescatar los artículos de la web actual antes de
 * sustituirla.
 *
 * POR QUÉ
 * -------
 * `villasproperties.es` tiene hoy una web Odoo viva con **8 artículos de blog**
 * —entre 850 y 6.000 palabras— que la preview no tiene. Son contenido propio,
 * indexado y con antigüedad: apuntar el dominio a la web nueva sin rescatarlos
 * los convierte en ocho 404 y tira por la borda ese posicionamiento.
 *
 * Esto los baja a borradores en el formato que entiende `tools/nuevo-post.js`,
 * así que el mismo comando que publica un artículo nuevo sirve para
 * republicarlos, con la misma cabecera, estilos, schema y alta en el índice.
 *
 * QUÉ NO HACE
 * -----------
 * No inventa nada. Si un artículo no trae fecha legible, la deja vacía para que
 * se rellene a mano en vez de poner la de hoy y falsear la antigüedad. Y no
 * descarga las imágenes: se listan al final para decidir una a una, porque
 * varias llevan marca de agua de portales.
 *
 * USO
 * ---
 *   node tools/exportar-blog-odoo.js              # a borradores/
 *   node tools/exportar-blog-odoo.js --publicar   # además los publica
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const SALIDA = path.join(RAIZ, 'borradores');
const ORIGEN = 'https://villasproperties.es/blog/4';
const PUBLICAR = process.argv.includes('--publicar');

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

const MESES = { enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
  julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12' };

/* La categoría se deduce del título: son las cinco que ya usa el blog nuevo,
   así que los artículos rescatados caen en los mismos filtros que los propios. */
const categoria = (t) => {
  const s = t.toLowerCase();
  if (/vender|vende|venta/.test(s)) return 'Venta';
  if (/invertir|inversi|rentabilidad/.test(s)) return 'Inversión';
  if (/vale|valorar|precio|tasaci/.test(s)) return 'Valoración';
  if (/mercado|zonas|revaloriza|incrementado/.test(s)) return 'Mercado';
  return 'Mercado';
};

const desescapar = (t) => t
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, '’').replace(/&hellip;/g, '…')
  .replace(/&[a-z]+;/g, ' ');

if (!fs.existsSync(SALIDA)) fs.mkdirSync(SALIDA);

const imagenes = new Set();
let hechos = 0, sinFecha = 0;

for (const slug of ARTICULOS) {
  let html;
  try {
    html = execFileSync('curl', ['-s', '--max-time', '40', `${ORIGEN}/${slug}`], { maxBuffer: 32e6 }).toString();
  } catch { console.log(`  ✘ ${slug}: no se pudo descargar`); continue; }

  const t = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const titulo = t ? desescapar(t[1].replace(/<[^>]+>/g, '')).trim() : '';
  if (!titulo) { console.log(`  ✘ ${slug}: sin título`); continue; }

  /* Odoo mete el cuerpo en #o_wblog_post_content. Se corta ahí y no en <main>
     para no arrastrar la barra lateral ni el bloque de "artículos
     relacionados", que son de la plantilla, no del artículo. */
  const c = html.match(/<div[^>]*id="o_wblog_post_content"[^>]*>([\s\S]*?)<div[^>]*class="[^"]*o_wblog_post_page_cover|<div[^>]*id="o_wblog_post_content"[^>]*>([\s\S]*)/);
  let cuerpo = c ? (c[1] || c[2]) : '';
  cuerpo = cuerpo
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<nav[\s\S]*?<\/nav>/g, '')
    .replace(/<form[\s\S]*?<\/form>/g, '');

  (cuerpo.match(/<img[^>]+src="([^"]+)"/g) || []).forEach((i) => {
    const s = i.match(/src="([^"]+)"/); if (s) imagenes.add(s[1]);
  });

  /* De HTML a la sintaxis que lee nuevo-post.js. */
  const texto = cuerpo
    .replace(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/g, (m, x) => `\n\n## ${desescapar(x.replace(/<[^>]+>/g, '')).trim()}\n\n`)
    .replace(/<h[3-6][^>]*>([\s\S]*?)<\/h[3-6]>/g, (m, x) => `\n\n### ${desescapar(x.replace(/<[^>]+>/g, '')).trim()}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (m, x) => `\n- ${desescapar(x.replace(/<[^>]+>/g, '')).trim()}`)
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, (m, x) => `\n\n> ${desescapar(x.replace(/<[^>]+>/g, '')).trim()}\n\n`)
    .replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/g, (m, x) => `**${x.replace(/<[^>]+>/g, '').trim()}**`)
    .replace(/<\/p>|<br\s*\/?>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .split('\n').map((l) => desescapar(l).replace(/[ \t]+/g, ' ').trim()).join('\n')
    /* Odoo deja h2 y h3 vacíos por los bloques de maquetado: convertidos, se
       quedan en una línea con solo "##", que en el artículo publicado saldría
       como un encabezado en blanco. */
    .replace(/^#{2,3}\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n').trim();

  const f = html.match(/([0-9]{1,2}) de ([a-zé]+) de ([0-9]{4})/);
  const fecha = f && MESES[f[2]] ? `${f[3]}-${MESES[f[2]]}-${String(f[1]).padStart(2, '0')}` : '';
  if (!fecha) sinFecha += 1;

  const palabras = texto.split(/\s+/).filter(Boolean).length;
  const entradilla = (texto.split('\n').find((l) => l.length > 80 && !l.startsWith('#')) || titulo)
    .replace(/\*\*/g, '').slice(0, 195);

  /* El slug se conserva EXACTO: es la mitad del trabajo de la redirección 301,
     y cambiarlo obligaría a mapear ocho URLs a mano. */
  const cab = [`titulo: ${titulo}`, `slug: ${slug}`, `categoria: ${categoria(titulo)}`,
    `entradilla: ${entradilla}`, `lectura: ${Math.max(3, Math.round(palabras / 220))} min`,
    `fecha: ${fecha}`, `origen: ${ORIGEN}/${slug}`].join('\n');

  fs.writeFileSync(path.join(SALIDA, `${slug}.md`), `${cab}\n---\n${texto}\n`, 'utf8');
  console.log(`  ✔ ${String(palabras).padStart(5)} palabras · ${fecha || 'SIN FECHA'} · ${titulo.slice(0, 46)}`);
  hechos += 1;

  if (PUBLICAR) {
    try {
      execFileSync('node', [path.join(__dirname, 'nuevo-post.js'), path.join(SALIDA, `${slug}.md`)],
        { cwd: RAIZ, stdio: 'pipe' });
    } catch (e) { console.log(`     ✘ al publicar: ${String(e.message).slice(0, 60)}`); }
  }
}

console.log(`\n  ${hechos}/${ARTICULOS.length} artículos exportados a borradores/`);
if (sinFecha) console.log(`  ⚠ ${sinFecha} sin fecha legible: rellenarla a mano antes de publicar, no inventarla`);
if (imagenes.size) {
  console.log(`\n  ${imagenes.size} imágenes referenciadas — decidir una a una (algunas llevan marca de agua):`);
  [...imagenes].slice(0, 12).forEach((i) => console.log(`     ${i.slice(0, 96)}`));
}
if (!PUBLICAR) console.log('\n  Revisa los borradores y luego:  node tools/exportar-blog-odoo.js --publicar');
