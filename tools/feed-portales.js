#!/usr/bin/env node
/* feed-portales.js — El fichero que leen los portales inmobiliarios.
 *
 * POR QUÉ
 * -------
 * Publicar a mano cada vivienda en cada portal no escala y acaba con precios
 * distintos en cada sitio. Los portales que admiten agencias leen un fichero
 * XML en una dirección fija y lo vuelven a leer solos: se cambia el precio en
 * `properties-data.js`, se regenera esto y todos los portales se actualizan.
 *
 * QUÉ GENERA
 * ----------
 *   feeds/kyero.xml   formato Kyero v3 (el estándar: M-SQ y muchos otros)
 *   feeds/tuad.xml    formato propio de Tuad.es
 *   feeds/img/<slug>/NN.jpg   las fotos en JPG (la web las sirve en WebP y no
 *                             todos los portales lo aceptan)
 *
 * QUÉ VIVIENDAS ENTRAN
 * --------------------
 * Solo las que están «En venta» Y figuran en `fotosLimpias` del fichero de
 * configuración. Las fotos bajadas de idealista llevan su marca de agua en el
 * centro y NO se pueden mandar a otro portal: una vivienda entra aquí cuando
 * sus fotos de `assets/img/<slug>/` son los originales, y solo entonces se
 * añade su slug a esa lista.
 *
 * SE REGENERA, NO SE EDITA
 * ------------------------
 *   node tools/feed-portales.js          # regenera XML y fotos
 *   node tools/tests/feed-portales.test.js   # falla si lo publicado está viejo
 *
 * La fecha de cada vivienda (`<date>`) solo avanza cuando cambian sus datos:
 * los portales la usan para saber si tienen que volver a procesarla. Por eso
 * se guarda una huella por vivienda en `tools/feed-portales.estado.json`.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const CANONICO = 'https://villasproperties.es';
const PROVINCIA = 'Santa Cruz de Tenerife';
const EMAIL = 'info@villasproperties.es';
const TELEFONO = '0034667384965';
const RUTA_CONFIG = path.join(__dirname, 'feed-portales.config.json');
const RUTA_ESTADO = path.join(__dirname, 'feed-portales.estado.json');
const MAX_FOTOS = 50;            // tope de Kyero v3
const MAX_CARACTERISTICA = 35;   // tope de Kyero v3 por característica
const CALIDAD_JPG = '78';

/* Tipos de vivienda de la web → vocabulario común a Kyero y Tuad. Un tipo que
   no esté aquí detiene la generación: mejor parar que publicar un tipo falso. */
const TIPO = {
  Apartamento: 'apartment', Piso: 'apartment', 'Apartamento · loft': 'apartment',
  Ático: 'penthouse', Dúplex: 'duplex', Estudio: 'studio',
  Casa: 'house', Chalet: 'villa', Villa: 'villa', Adosado: 'town house',
};

const xml = (texto) => String(texto)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const tipoDe = (p) => {
  const t = TIPO[p.type];
  if (!t) throw new Error(`tipo de vivienda sin traducir: «${p.type}» (ref ${p.ref}). Añádelo a TIPO.`);
  return t;
};

const tienePiscina = (p) => (p.equipment || []).some((e) => /piscina/i.test(e)) ? 1 : 0;

/* Kyero traduce solo las características a cada idioma: tienen que ser cortas,
   sin puntuación y afirmativas («Sin calefacción» no es una característica). */
const caracteristicas = (p) => [...(p.equipment || []), ...(p.features || [])]
  .filter((c) => c.length <= MAX_CARACTERISTICA && !/[.,:;·()]/.test(c) && !/^sin\s/i.test(c));

const fotosDe = (p) => (p.images || []).slice(0, MAX_FOTOS).map((origen, i) => {
  const destino = `feeds/img/${p.slug}/${String(i + 1).padStart(2, '0')}.jpg`;
  return { origen, destino, url: `${CANONICO}/${destino}` };
});

function seleccionar(inmuebles, config) {
  const limpias = new Set(config.fotosLimpias || []);
  const incluidas = [];
  const excluidas = [];
  for (const p of inmuebles) {
    let motivo = '';
    if (p.status !== 'En venta') motivo = `estado «${p.status}»`;
    else if (!limpias.has(p.slug)) motivo = 'sin fotos limpias (las de idealista llevan marca de agua)';
    else if (!(p.images || []).length) motivo = 'sin fotos';
    if (motivo) excluidas.push({ ref: p.ref, slug: p.slug, motivo });
    else incluidas.push(p);
  }
  return { incluidas, excluidas };
}

const huellaDe = (p) => crypto.createHash('sha256').update(JSON.stringify([
  p.ref, p.title, p.town, p.zone, p.type, p.price, p.built, p.beds, p.baths,
  p.equipment, p.features, p.description, p.coords, p.images,
])).digest('hex').slice(0, 16);

function fechar(inmuebles, estadoPrevio, ahora) {
  const estado = {};
  for (const p of inmuebles) {
    const huella = huellaDe(p);
    const previo = estadoPrevio[p.ref];
    estado[p.ref] = previo && previo.huella === huella ? previo : { huella, fecha: ahora };
  }
  return estado;
}

function kyero(inmuebles, estado) {
  const l = ['<?xml version="1.0" encoding="UTF-8"?>', '<root>', '  <kyero>',
    '    <feed_version>3</feed_version>', '  </kyero>'];
  for (const p of inmuebles) {
    l.push('  <property>',
      `    <id>${xml(p.ref)}</id>`,
      `    <date>${estado[p.ref].fecha}</date>`,
      `    <ref>${xml(p.ref)}</ref>`,
      `    <price>${Math.round(p.price)}</price>`,
      '    <currency>EUR</currency>',
      '    <price_freq>sale</price_freq>',
      `    <type>${tipoDe(p)}</type>`,
      `    <town>${xml(p.town)}</town>`,
      `    <province>${PROVINCIA}</province>`,
      '    <country>Spain</country>');
    if (Array.isArray(p.coords) && p.coords.length === 2) {
      l.push('    <location>', `      <latitude>${p.coords[0]}</latitude>`,
        `      <longitude>${p.coords[1]}</longitude>`, '    </location>');
    }
    if (p.zone) l.push(`    <location_detail>${xml(p.zone.slice(0, 50))}</location_detail>`);
    l.push(`    <beds>${p.beds || 0}</beds>`, `    <baths>${p.baths || 0}</baths>`,
      `    <pool>${tienePiscina(p)}</pool>`,
      '    <surface_area>', `      <built>${p.built || 0}</built>`, '    </surface_area>',
      '    <url>', `      <es>${CANONICO}/property.html?ref=${encodeURIComponent(p.ref)}</es>`, '    </url>',
      '    <desc>', `      <es>${(p.description || []).map(xml).join('&#13;&#13;')}</es>`, '    </desc>');
    const cs = caracteristicas(p);
    if (cs.length) l.push('    <features>', ...cs.map((c) => `      <feature>${xml(c)}</feature>`), '    </features>');
    l.push('    <images>');
    fotosDe(p).forEach((f, i) => l.push(`      <image id="${i + 1}">`, `        <url>${f.url}</url>`, '      </image>'));
    l.push('    </images>', `    <email>${EMAIL}</email>`,
      `    <whatsapp_number>${TELEFONO}</whatsapp_number>`,
      `    <contact_number>${TELEFONO}</contact_number>`, '  </property>');
  }
  l.push('</root>');
  return l.join('\n') + '\n';
}

function tuad(inmuebles, estado, config) {
  const cps = (config && config.codigosPostales) || {};
  const l = ['<?xml version="1.0" encoding="utf-8" standalone="yes"?>', '<root>', '  <tuad>',
    '    <feed_version>1</feed_version>', '  </tuad>'];
  for (const p of inmuebles) {
    l.push('  <realstate>',
      `    <external_id>${xml(p.ref)}</external_id>`,
      `    <external_ref>${xml(p.ref)}</external_ref>`,
      `    <date>${estado[p.ref].fecha}</date>`,
      `    <price>${Math.round(p.price)}</price>`,
      '    <negotiation_type>sale</negotiation_type>',
      `    <type>${tipoDe(p)}</type>`,
      `    <city>${xml(p.town)}</city>`,
      `    <province>${PROVINCIA}</province>`);
    if (cps[p.slug]) l.push(`    <postcode>${xml(cps[p.slug])}</postcode>`);
    if (Array.isArray(p.coords) && p.coords.length === 2) {
      l.push('    <location>', `      <latitude>${p.coords[0]}</latitude>`,
        `      <longitude>${p.coords[1]}</longitude>`, '    </location>');
    }
    if (p.beds) l.push(`    <rooms>${p.beds}</rooms>`);
    if (p.baths) l.push(`    <baths>${p.baths}</baths>`);
    l.push(`    <pool>${tienePiscina(p)}</pool>`, `    <m2>${Math.round(p.built || 0)}</m2>`,
      `    <description>${xml([p.title, ...(p.description || [])].filter(Boolean).join('\n\n'))}</description>`,
      '    <images>');
    fotosDe(p).forEach((f, i) => l.push(`      <image id="${i + 1}">`, `        <url>${f.url}</url>`, '      </image>'));
    l.push('    </images>', '  </realstate>');
  }
  l.push('</root>');
  return l.join('\n') + '\n';
}

const leerJson = (ruta, porDefecto) => (fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta, 'utf8')) : porDefecto);

const ahoraTexto = () => {
  const d = new Date();
  const dos = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())} ${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;
};

function convertirFotos(fotos) {
  let nuevas = 0;
  for (const f of fotos) {
    const origen = path.join(RAIZ, f.origen);
    const destino = path.join(RAIZ, f.destino);
    if (!fs.existsSync(origen)) throw new Error(`no existe la foto ${f.origen}`);
    if (fs.existsSync(destino) && fs.statSync(destino).mtimeMs >= fs.statSync(origen).mtimeMs) continue;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    // sips viene con macOS y lee WebP; así no hace falta instalar nada.
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', CALIDAD_JPG, origen, '--out', destino],
      { stdio: 'ignore' });
    nuevas += 1;
  }
  return nuevas;
}

/* Fotos de viviendas que ya no están en el fichero: fuera, para no dejar
   publicadas imágenes de algo vendido o retirado. */
function retirarFotosSobrantes(fotos) {
  const base = path.join(RAIZ, 'feeds', 'img');
  if (!fs.existsSync(base)) return 0;
  const vigentes = new Set(fotos.map((f) => path.join(RAIZ, f.destino)));
  let quitadas = 0;
  for (const slug of fs.readdirSync(base)) {
    const dir = path.join(base, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const nombre of fs.readdirSync(dir)) {
      const ruta = path.join(dir, nombre);
      if (!vigentes.has(ruta)) { fs.unlinkSync(ruta); quitadas += 1; }
    }
    if (!fs.readdirSync(dir).length) fs.rmdirSync(dir);
  }
  return quitadas;
}

function generar({ soloCalcular = false } = {}) {
  global.window = global.window || {};
  delete require.cache[require.resolve(path.join(RAIZ, 'properties-data.js'))];
  require(path.join(RAIZ, 'properties-data.js'));
  const inmuebles = global.window.VP_PROPERTIES || [];
  if (!inmuebles.length) throw new Error('no hay inmuebles en properties-data.js');

  const config = leerJson(RUTA_CONFIG, { fotosLimpias: [], codigosPostales: {} });
  const { incluidas, excluidas } = seleccionar(inmuebles, config);
  const estado = fechar(incluidas, leerJson(RUTA_ESTADO, {}), ahoraTexto());
  const ficheros = { 'kyero.xml': kyero(incluidas, estado, config), 'tuad.xml': tuad(incluidas, estado, config) };
  const fotos = incluidas.flatMap(fotosDe);
  const resultado = { incluidas, excluidas, ficheros, fotos, estado };
  if (soloCalcular) return resultado;

  fs.mkdirSync(path.join(RAIZ, 'feeds'), { recursive: true });
  for (const [nombre, texto] of Object.entries(ficheros)) fs.writeFileSync(path.join(RAIZ, 'feeds', nombre), texto);
  fs.writeFileSync(RUTA_ESTADO, JSON.stringify(estado, null, 2) + '\n');
  resultado.fotosNuevas = convertirFotos(fotos);
  resultado.fotosQuitadas = retirarFotosSobrantes(fotos);
  return resultado;
}

module.exports = { seleccionar, fechar, kyero, tuad, generar, caracteristicas, fotosDe };

if (require.main === module) {
  try {
    const r = generar();
    console.log(`  ${r.incluidas.length} vivienda(s) en feeds/kyero.xml y feeds/tuad.xml`);
    for (const p of r.incluidas) console.log(`    + ${p.ref}  ${p.slug}  ${p.price} €  ${fotosDe(p).length} fotos  (${r.estado[p.ref].fecha})`);
    for (const e of r.excluidas) console.log(`    - ${e.ref}  ${e.slug}: ${e.motivo}`);
    console.log(`  fotos JPG: ${r.fotosNuevas} nuevas, ${r.fotosQuitadas} retiradas`);
  } catch (e) {
    console.error('  ERROR: ' + e.message);
    process.exit(1);
  }
}
