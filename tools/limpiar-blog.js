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
  /^\s*\**#{0,3}\s*Compartir\b/i,          // el widget de compartir de Odoo
  /^\s*\**#{0,3}\s*Archivar\s*\**\s*$/i,
  /^\s*Todas las fechas/i,
  /^\s*Leer siguiente\s*$/i,
  /^\s*\**#{0,3}\s*Enlaces útiles/i,
  /^\s*\**#{0,3}\s*Síganos/i,
  /^\s*\**#{0,3}\s*Contáctenos/i,
  /^\s*\**#{0,3}\s*Nuestra empresa/i,
  /configurar sus redes sociales/i,
  /Permitir (todas las|solo las) cookies/i,
  /hecho con Amor/i,
];

/* Restos sueltos que Odoo deja dentro del cuerpo y no marcan el final: se
   borran línea a línea en vez de cortar por ellos. */
/* El placeholder del editor a veces queda PEGADO al final de una línea de
   texto real —"…vender tu casa en Tenerife! piece a escribir aquí…"— así que
   cortar por él se llevaría el cierre del artículo. Se borra en línea. */
/* Odoo exporta algunos encabezados envueltos en negrita —"**### Compartir"— y
   el conversor a HTML no los reconoce como encabezado: los publica tal cual,
   con las almohadillas y los asteriscos a la vista. Se normalizan antes. */
const NORMALIZAR = [
  [/^\s*\*\*\s*(#{2,3})\s*/gm, '$1 '],      // **## Título  →  ## Título
  [/^(#{2,3}[^\n]*?)\s*\*\*\s*$/gm, '$1'],   // ## Título**  →  ## Título
  /* Marcas duplicadas: "## ## 3. Análisis". Salen cuando el original ya traía
     almohadillas y la regla de arriba añade las suyas. El conversor solo quita
     las tres primeras letras, así que el segundo par acaba DENTRO del <h2>. */
  [/^(#{2,3})\s+#{2,3}\s+/gm, '$1 '],
];

/* Las negritas quedaron descompensadas al exportar: hay líneas con un número
   IMPAR de "**", porque el <strong> de origen abría en una línea y cerraba en
   otra. El conversor solo transforma los pares, así que el asterisco huérfano
   se publica tal cual: "El precio inadecuado** es la causa número uno".

   Se corrige por línea, que es donde vive el desajuste: si sobra uno, se quita
   el último. No se intenta adivinar dónde iba la apertura — perder una negrita
   es mucho menos malo que publicar un asterisco suelto. */
const equilibrarNegritas = (linea) => {
  const marcas = (linea.match(/\*\*/g) || []).length;
  if (marcas % 2 === 0) return linea;
  const ultimo = linea.lastIndexOf('**');
  return linea.slice(0, ultimo) + linea.slice(ultimo + 2);
};

/* Almohadillas que no están al principio de la línea no son un encabezado:
   son residuo del exportador y se ven como "###" en medio del texto. */
const quitarAlmohadillasSueltas = (linea) => (
  /^\s*#{2,3}\s/.test(linea) ? linea : linea.replace(/#{2,}/g, '').replace(/\s{2,}/g, ' ')
);

/* Un encabezado necesita una línea en blanco DELANTE o el conversor lo trata
   como parte del párrafo anterior y lo publica como texto: "…el tiempo de
   venta. ## Situación del mercado inmobiliario actual". Se garantiza aquí, que
   es más fiable que confiar en cómo venía el original. */
const airearEncabezados = (texto) => texto
  /* Encabezado pegado EN MEDIO de una línea: "…/ 3295). ## 3. Análisis de…".
     Hay que partir la línea primero; buscar solo tras un salto no lo pilla. */
  .replace(/([.:!?)\]"»])\s+(#{2,3}\s)/g, '$1\n\n$2')
  .replace(/([^\n])\n(#{2,3}\s)/g, '$1\n\n$2');

/* Asteriscos que no envuelven nada: "¿Cuánto vale? ** La clave está…". Quedan
   cuando el <strong> de origen abarcaba un salto de línea. */
/* Frases pegadas: "…mediterráneos.En el otro extremo…". Salen cuando el
   exportador funde el final de un <li> con el <p> siguiente. Solo se separa
   cuando delante hay una palabra de dos letras o más, para no romper siglas
   ni decimales. */
const separarFrasesPegadas = (texto) => texto
  .replace(/([a-záéíóúñü]{2,})([.:!?])([A-ZÁÉÍÓÚÑ¿¡])/g, '$1$2 $3');

const quitarAsteriscosHuerfanos = (texto) => texto
  /* Tres o más seguidos no son negrita de nada: son un cierre duplicado. Van
     primero, porque un "****" el contador de pares lo da por equilibrado. */
  .replace(/\*{3,}/g, '')
  .replace(/(^|\s)\*\*(\s|$)/gm, '$1$2')
  .replace(/\*\*\s*$/gm, '');

const EN_LINEA = [
  /* El exportador se comió las dos primeras letras en algún caso —quedó
     "piece a escribir aquí"— así que no se ancla al principio de la palabra. */
  /\s*\S*piece a escribir aquí\.{0,3}\s*$/i,
  /\s*\**\s*COMPARTE\s*\**\s*$/i,
];

const RESTOS = [
  /^\s*​+\s*$/,                             // líneas con solo espacios de ancho cero
  /* Ojo: este patrón exige AL MENOS un asterisco. Sin el `+`, la expresión
     casaba también con las líneas vacías y se las llevaba por delante — y sin
     línea en blanco entre bloques, el conversor a HTML mete el artículo entero
     dentro del primer encabezado. Los nueve importados se publicaron así: 928
     palabras dentro de un <h2>. */
  /^\s*\*+\s*$/,
];

/* Después de cortar quedan colas: "en ​**", "# 2025 tenerife", "**COMPARTE**".
   Son trozos del widget de Odoo que caen en líneas separadas, así que el corte
   por marcador no los pilla. Se quitan desde el final mientras la línea no
   parezca prosa: pocas palabras y sin puntuación de cierre. Se para en la
   primera que sí lo parezca, para no comerse el cierre del artículo. */
const podarCola = (texto) => {
  const lineas = texto.split('\n')
    .map((l) => EN_LINEA.reduce((acc, re) => acc.replace(re, ''), l));
  while (lineas.length) {
    const l = lineas[lineas.length - 1].trim();
    const palabras = l.replace(/[*#​]/g, '').trim().split(/\s+/).filter(Boolean);
    const esProsa = palabras.length >= 6 || /[.!?»)]$/.test(l);
    if (l === '' || !esProsa) { lineas.pop(); continue; }
    break;
  }
  return lineas.join('\n').trim();
};

const cortar = (texto) => {
  const lineas = texto.split('\n');
  for (let i = 0; i < lineas.length; i += 1) {
    if (INICIO_DEL_PIE.some((re) => re.test(lineas[i]))) {
      const limpio = podarCola(lineas.slice(0, i).join('\n'));
      return { texto: limpio, cortadas: lineas.length - limpio.split('\n').length };
    }
  }
  const limpio = podarCola(texto);
  return { texto: limpio, cortadas: texto.split('\n').length - limpio.split('\n').length };
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
    const base = separarFrasesPegadas(quitarAsteriscosHuerfanos(
      airearEncabezados(NORMALIZAR.reduce((t, [re, a]) => t.replace(re, a), texto)),
    ));
    const limpio = base
      .split('\n')
      .map(quitarAlmohadillasSueltas)
      .map(equilibrarNegritas).filter((l) => !RESTOS.some((re) => re.test(l))).join('\n')
      .replace(/^#{2,3}\s*$/gm, '')
      .replace(/\n{3,}/g, '\n\n').trim();
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
