#!/usr/bin/env node
/* schema-persona.js — Que los análisis los firme alguien.
 *
 * POR QUÉ
 * -------
 * En las 31 páginas no había un solo nodo `Person`. Valeria Villa tiene
 * biografía en `contact.html` —Cernobbio, Antropología en Milán, Century 21—
 * pero para una máquina no existía: los artículos de mercado los firmaba
 * "Villa's Properties", que es una organización, no alguien con criterio.
 *
 * Eso importa más de lo que parece. Las menciones de marca correlacionan tres
 * veces más con la citación por IA que los backlinks, y una entidad se
 * construye con autoría atribuible, no con enlaces. Un análisis sin firma es
 * un análisis que ningún modelo tiene motivo para atribuir a nadie.
 *
 * QUÉ HACE
 * --------
 *   1. Crea el nodo `Person` con un `@id` estable y lo publica donde vive su
 *      biografía y en la portada.
 *   2. La engancha a la organización como `founder` y `employee`.
 *   3. Cambia el `author` de los artículos de Organization a esa Person.
 *   4. Añade la firma VISIBLE en los artículos — Google valora que el autor se
 *      vea, no solo que esté en el JSON-LD, y el lector también.
 *
 * SOBRE `sameAs`
 * --------------
 * No se le inventa ningún perfil. La organización sí tiene seis (Instagram,
 * Facebook, TikTok, YouTube, idealista y la web) y esos se mantienen. Si algún
 * día hay un LinkedIn personal de Valeria, se añade a PERFILES y esta entidad
 * gana bastante: es la señal que más pesa para vincular a una persona real.
 *
 * USO
 * ---
 *   node tools/schema-persona.js
 *   ./tools/sellar.sh
 */
'use strict';

const fs = require('fs');
const path = require('path');
const glob = (p) => fs.readdirSync(RAIZ).filter((f) => p.test(f));

const RAIZ = path.join(__dirname, '..');
const DOMINIO = 'https://josecrea.github.io/villasproperties-preview';
const ID_PERSONA = `${DOMINIO}/contact.html#valeria-villa`;
const ID_ORG = `${DOMINIO}/#org`;

/* Vacío a propósito: ver la nota de cabecera. Añadir aquí solo URLs reales. */
const PERFILES = [];

const PERSONA = {
  '@type': 'Person',
  '@id': ID_PERSONA,
  name: 'Valeria Villa',
  givenName: 'Valeria',
  familyName: 'Villa',
  jobTitle: 'CEO',
  url: `${DOMINIO}/contact.html`,
  description: 'Fundadora de Villa’s Properties. Nacida en Cernobbio (lago de Como) '
    + 'y formada en Antropología en Milán, dirige la inmobiliaria en Tenerife Sur '
    + 'con un enfoque basado en el valor real de escritura y no en el precio de anuncio.',
  knowsAbout: ['Mercado inmobiliario de Tenerife Sur', 'Valoración de vivienda',
    'Compraventa residencial', 'Inversión inmobiliaria'],
  worksFor: { '@id': ID_ORG },
  ...(PERFILES.length ? { sameAs: PERFILES } : {}),
};

let tocadas = 0, articulos = 0, firmas = 0;

/* ---- 1 y 2. La persona, y su vínculo con la organización ---- */
for (const f of ['contact.html', 'index.html']) {
  const ruta = path.join(RAIZ, f);
  let html = fs.readFileSync(ruta, 'utf8');
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
  const m = html.match(re);
  if (!m) { console.log(`  ✘ ${f}: sin JSON-LD`); continue; }

  const datos = JSON.parse(m[1]);
  const grafo = datos['@graph'] || [datos];
  if (grafo.some((n) => n['@id'] === ID_PERSONA)) { console.log(`  · ${f}: ya la tenía`); continue; }

  const org = grafo.find((n) => n['@type'] === 'RealEstateAgent');
  if (org) {
    org.founder = { '@id': ID_PERSONA };
    org.employee = [{ '@id': ID_PERSONA }];
  }
  grafo.push(PERSONA);

  const salida = datos['@graph'] ? { ...datos, '@graph': grafo }
    : { '@context': 'https://schema.org', '@graph': grafo };
  html = html.replace(re, `<script type="application/ld+json">${JSON.stringify(salida)}</script>`);
  fs.writeFileSync(ruta, html, 'utf8');
  console.log(`  ✔ ${f.padEnd(16)} Person añadida${org ? ' + founder/employee en la organización' : ''}`);
  tocadas += 1;
}

/* ---- 3 y 4. Los artículos: autoría en el schema y firma a la vista ---- */
for (const f of glob(/^post-.*\.html$/)) {
  const ruta = path.join(RAIZ, f);
  let html = fs.readFileSync(ruta, 'utf8');
  let cambiado = false;

  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (todo, cuerpo) => {
    let datos;
    try { datos = JSON.parse(cuerpo); } catch { return todo; }
    const nodos = datos['@graph'] || (Array.isArray(datos) ? datos : [datos]);
    let hay = false;
    for (const n of nodos) {
      if (n['@type'] !== 'Article') continue;
      n.author = { '@id': ID_PERSONA };
      hay = true;
    }
    if (!hay) return todo;
    /* La Person viaja con el artículo: si un modelo lee solo esta página, tiene
       que poder resolver quién es el autor sin ir a buscarlo a otra. */
    if (!nodos.some((n) => n['@id'] === ID_PERSONA)) nodos.push(PERSONA);
    cambiado = true;
    const salida = datos['@graph'] ? { ...datos, '@graph': nodos }
      : { '@context': 'https://schema.org', '@graph': nodos };
    return `<script type="application/ld+json">${JSON.stringify(salida)}</script>`;
  });
  if (cambiado) articulos += 1;

  /* Firma visible, dentro del bloque de datos del artículo que ya existe. */
  if (!html.includes('post-firma')) {
    const re = /(<div class="post-kicker">[\s\S]*?)(<\/div>)/;
    if (re.test(html)) {
      html = html.replace(re, `$1<span class="post-firma">Por <a href="contact.html" rel="author">Valeria Villa</a>, CEO</span>$2`);
      firmas += 1;
    }
  }

  fs.writeFileSync(ruta, html, 'utf8');
}

console.log(`  ✔ ${articulos} artículos firmados por Valeria en el schema`);
console.log(`  ✔ ${firmas} firmas visibles añadidas`);
if (!PERFILES.length) {
  console.log('\n  ⚠ La Person no lleva sameAs: no se le ha inventado ningún perfil.');
  console.log('    Si Valeria tiene LinkedIn, añadirlo a PERFILES en este fichero.');
}
console.log('\n  Ahora:  ./tools/sellar.sh');
