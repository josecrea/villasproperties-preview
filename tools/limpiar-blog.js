#!/usr/bin/env node
/* limpiar-blog.js — Cortar el pie de Odoo que se coló en los artículos, y
 * revisar lo que quedó.
 *
 * QUÉ PASÓ
 * --------
 * `exportar-blog-odoo.js` recortaba el cuerpo con una expresión cuya segunda
 * alternativa era `([\s\S]*)`: cogía desde el contenedor del artículo hasta el
 * final del documento. Con eso se publicaron, dentro de los ocho artículos
 * rescatados, el menú del pie de Odoo, veinticuatro repeticiones de "Haga clic
 * aquí para configurar sus redes sociales" y el aviso de cookies de la web
 * vieja. Se veía al final de cada artículo, en producción.
 *
 * Se limpia desde los borradores y no volviendo a descargar porque la web vieja
 * ya no responde en el dominio: ahora sirve GitHub Pages.
 *
 * ADEMÁS REVISA
 * -------------
 * Títulos duplicados, párrafos repetidos, encabezados vacíos y artículos
 * demasiado cortos. El corte arregla lo evidente; esto enseña lo que queda.
 *
 * USO
 * ---
 *   node tools/limpiar-blog.js              # solo informa
 *   node tools/limpiar-blog.js --aplicar    # limpia y republica
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const BORRADORES = path.join(RAIZ, 'borradores');
const APLICAR = process.argv.includes('--aplicar');

/* El pie de Odoo empieza siempre por uno de estos. Se corta en el PRIMERO que
   aparezca, no en el último: "Leer siguiente" ya es plantilla, no artículo. */
const INICIO_DEL_PIE = [
  /^\s*Leer siguiente\s*$/i,
  /^#+\s*Enlaces útiles/i,
  /^#+\s*Síganos/i,
  /^#+\s*Contáctenos/i,
  /^#+\s*Nuestra empresa/i,
  /configurar sus redes sociales/i,
  /Permitir (todas las|solo las) cookies/i,
  /hecho con Amor/i,
];

const cortar = (texto) => {
  const lineas = texto.split('\n');
  for (let i = 0; i < lineas.length; i += 1) {
    if (INICIO_DEL_PIE.some((re) => re.test(lineas[i]))) {
      return { texto: lineas.slice(0, i).join('\n').trim(), cortadas: lineas.length - i };
    }
  }
  return { texto: texto.trim(), cortadas: 0 };
};

/* Dos párrafos idénticos seguidos son casi siempre plantilla duplicada. Se
   miran solo los largos: repetir "Ver más" no es un problema. */
const repetidos = (texto) => {
  const parr = texto.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.split(/\s+/).length > 12);
  const vistos = new Map();
  const dobles = [];
  for (const p of parr) {
    const clave = p.slice(0, 90).toLowerCase();
    if (vistos.has(clave)) dobles.push(p.slice(0, 60));
    else vistos.set(clave, true);
  }
  return dobles;
};

const ficheros = fs.readdirSync(BORRADORES).filter((f) => f.endsWith('.md')).sort();
const titulos = new Map();
let totalCortadas = 0, conProblemas = 0;

console.log(`  ── ${ficheros.length} artículos rescatados ──\n`);

for (const f of ficheros) {
  const ruta = path.join(BORRADORES, f);
  const bruto = fs.readFileSync(ruta, 'utf8');
  const corte = bruto.indexOf('\n---');
  const cabecera = bruto.slice(0, corte);
  const cuerpoOriginal = bruto.slice(corte + 4);

  const { texto, cortadas } = cortar(cuerpoOriginal);
  const titulo = (cabecera.match(/^titulo:\s*(.+)$/m) || [, ''])[1].trim();
  const palabras = texto.split(/\s+/).filter(Boolean).length;
  const vacios = (texto.match(/^#{2,3}\s*$/gm) || []).length;
  const dobles = repetidos(texto);

  const avisos = [];
  if (cortadas) avisos.push(`${cortadas} líneas de pie cortadas`);
  if (vacios) avisos.push(`${vacios} encabezados vacíos`);
  if (dobles.length) avisos.push(`${dobles.length} párrafos repetidos`);
  if (palabras < 500) avisos.push(`solo ${palabras} palabras`);
  if (titulos.has(titulo.toLowerCase())) avisos.push('TÍTULO DUPLICADO');
  titulos.set(titulo.toLowerCase(), f);

  totalCortadas += cortadas;
  if (avisos.length) conProblemas += 1;

  console.log(`  ${avisos.length ? '🔧' : '✔ '} ${titulo.slice(0, 52).padEnd(54)} ${String(palabras).padStart(5)} palabras`);
  if (avisos.length) console.log(`       ${avisos.join(' · ')}`);
  dobles.slice(0, 2).forEach((d) => console.log(`       repetido: «${d}…»`));

  if (APLICAR && (cortadas || vacios)) {
    const limpio = texto.replace(/^#{2,3}\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
    /* El salto antes del --- es obligatorio: nuevo-post.js busca "\n---" para
       separar cabecera de cuerpo, y sin él da "Falta la línea ---". */
    fs.writeFileSync(ruta, `${cabecera}\n---\n${limpio}\n`, 'utf8');
  }
}

console.log(`\n  ${conProblemas} de ${ficheros.length} necesitan arreglo · ${totalCortadas} líneas de pie en total`);

if (APLICAR) {
  console.log('\n  Republicando…');
  for (const f of ficheros) {
    try {
      execFileSync('node', [path.join(__dirname, 'nuevo-post.js'), path.join(BORRADORES, f)],
        { cwd: RAIZ, stdio: 'pipe' });
    } catch (e) { console.log(`    ✘ ${f}: ${String(e.message).slice(0, 50)}`); }
  }
  console.log('  ✔ republicados. Ahora:  node tools/schema-persona.js && ./tools/sellar.sh');
} else {
  console.log('  Para limpiarlos y republicar:  node tools/limpiar-blog.js --aplicar');
}
