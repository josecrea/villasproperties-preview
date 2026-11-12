#!/usr/bin/env node
/* Fichero de publicación automática para Spainhouses.net («XML para Carteras de
 * Propiedades», https://www.spainhouses.net/es/inmobiliarias/especificaciones-publicacion.html).
 *
 * Sale de `properties-data.js` (datos y precio) y de `tools/i18n/viviendas_i18n.json`
 * (textos en alemán, neerlandés, italiano y francés). Solo entran las viviendas que
 * tienen esos textos y fotos JPG en `assets/feed/<slug>/`.
 *
 * La `fecha` de cada vivienda solo cambia cuando cambia su contenido: el portal la usa
 * para saber qué actualizar. Se guarda en `tools/feeds/estado-spainhouses.json`.
 *
 * Uso: node tools/feeds/build-feed-spainhouses.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const RAIZ = path.resolve(__dirname, '..', '..');
const WEB = 'https://villasproperties.es';
const SALIDA = path.join(RAIZ, 'feed', 'spainhouses.xml');
const ESTADO = path.join(__dirname, 'estado-spainhouses.json');
const ESQUEMA = 'https://xcp.entersoftweb.com/sh/xsd/cartera.xsd';
const PROVINCIA = 'Santa Cruz de Tenerife';
const MAX_FOTOS = 20;
const IDIOMAS_EXTRA = ['de', 'nl', 'it', 'fr'];

/* Código postal por zona. La dirección NO se publica (mostrarDireccion = 0): en el
   campo obligatorio va solo el nombre de la zona, nunca la calle del vendedor. */
const CODIGO_POSTAL = { 'Las Chafiras': '38639', 'Los Abrigos': '38618', 'Casco Urbano': '38670', 'El Fraile': '38632' };
const ORIENTACION = { Norte: 1, Sur: 2, Este: 3, Oeste: 4, Noreste: 5, Noroeste: 6, Sureste: 7, Suroeste: 8 };
const CONSERVACION_BUENA = 2;
const DECIMALES_COORDENADA = 3;          // ≈ 100 m: sitúa la zona, no el portal

const escapar = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const etiqueta = (nombre, valor) => (valor === null || valor === undefined || valor === '' ? '' : `<${nombre}>${escapar(valor)}</${nombre}>`);
const booleano = (v) => (v ? 1 : 0);

function leerFichas(raiz = RAIZ) {
  const ventana = {};
  const contexto = vm.createContext({ window: ventana });
  vm.runInContext(fs.readFileSync(path.join(raiz, 'properties-data.js'), 'utf8'), contexto);
  return ventana.VP_PROPERTIES;
}

/* «Ático» → Piso + Ático; «Apartamento · loft» → Loft; el resto, tal cual si el portal lo conoce. */
function tipoInmueble(tipo) {
  const t = String(tipo || '').toLowerCase();
  if (t.includes('loft')) return { tipo: 'Loft' };
  if (t.includes('ático') || t.includes('atico')) return { tipo: 'Piso', ext: 'Ático' };
  if (t.includes('estudio')) return { tipo: 'Estudio' };
  if (t.includes('piso')) return { tipo: 'Piso' };
  if (t.includes('dúplex') || t.includes('duplex')) return { tipo: 'Dúplex' };
  if (t.includes('villa')) return { tipo: 'Villa' };
  if (t.includes('chalet')) return { tipo: 'Chalet' };
  if (t.includes('casa')) return { tipo: 'Casa' };
  return { tipo: 'Apartamento' };
}

/* «F · 257,95 kWh/m² año · …» → { letra: 'F', consumo: '257.95' }. Sin letra, nada. */
function energia(texto) {
  const m = String(texto || '').match(/^\s*([A-G])\s*·\s*([\d.,]+)\s*kWh/i);
  if (!m) return {};
  return { letra: m[1].toUpperCase(), consumo: m[2].replace(/\./g, '').replace(',', '.') };
}

function textoTraducido(t) {
  const partes = [];
  if (t.parrafos[0]) partes.push(t.parrafos[0]);
  if (t.puntos.length) partes.push(t.puntos.map((p) => `• ${p}`).join('\n'));
  partes.push(...t.parrafos.slice(1));
  return `${t.titulo}\n\n${partes.join('\n\n')}`;
}

function descripciones(ficha, traducciones) {
  const es = `${ficha.title}\n\n${[].concat(ficha.description || []).join('\n\n')}`;
  const lista = [['es', es]];
  for (const idioma of IDIOMAS_EXTRA) {
    if (traducciones && traducciones[idioma]) lista.push([idioma, textoTraducido(traducciones[idioma])]);
  }
  return lista;
}

function fotos(slug, raiz = RAIZ) {
  const carpeta = path.join(raiz, 'assets', 'feed', slug);
  if (!fs.existsSync(carpeta)) return [];
  return fs.readdirSync(carpeta).filter((f) => /^\d+\.jpg$/.test(f)).sort().slice(0, MAX_FOTOS)
    .map((f) => `${WEB}/assets/feed/${slug}/${f}`);
}

function tiene(ficha, patron) {
  return [].concat(ficha.features || [], ficha.equipment || []).some((x) => patron.test(String(x)));
}

function propiedad(ficha, traducciones, fecha, urls) {
  const tipo = tipoInmueble(ficha.type);
  const e = energia(ficha.energy);
  const cp = CODIGO_POSTAL[ficha.zone];
  if (!cp) throw new Error(`falta el código postal de la zona «${ficha.zone}» (ref. ${ficha.ref})`);
  if (!urls.length) throw new Error(`la vivienda ${ficha.ref} no tiene fotos JPG en assets/feed/${ficha.slug}/`);
  const [lat, lon] = ficha.coords.map((n) => Number(n).toFixed(DECIMALES_COORDENADA));
  const desc = descripciones(ficha, traducciones)
    .map(([idioma, texto]) => `<descripcion><idioma>${idioma}</idioma><texto>${escapar(texto)}</texto></descripcion>`).join('\n');
  const lineas = [
    etiqueta('referencia', ficha.ref),
    etiqueta('fecha', fecha),
    etiqueta('tipoInmueble', tipo.tipo),
    etiqueta('tipoInmuebleExt', tipo.ext),
    etiqueta('tipoOferta', 'Venta'),
    `<descripcionPrincipal>\n${desc}\n</descripcionPrincipal>`,
    etiqueta('antiguedad', ficha.year),
    etiqueta('tipoConservacion', /buen estado/i.test(ficha.condition || '') ? CONSERVACION_BUENA : null),
    etiqueta('superficieUtil', ficha.useful),
    etiqueta('superficieConstruida', ficha.built),
    etiqueta('calificacionEnergetica', e.letra),
    etiqueta('consumoEnergetico', e.consumo),
    etiqueta('precio', ficha.price),
    etiqueta('codigoPostal', cp),
    etiqueta('provincia', PROVINCIA),
    etiqueta('localidad', ficha.town),
    etiqueta('direccion', ficha.zone),
    etiqueta('mostrarDireccion', 0),
    etiqueta('geoLocalizacion', `${lat},${lon}`),
    etiqueta('dormitorios', ficha.beds),
    etiqueta('baños', ficha.baths),
    etiqueta('piscina', booleano(tiene(ficha, /piscina/i))),
    etiqueta('jardines', booleano(tiene(ficha, /jard[ií]n/i))),
    etiqueta('terrazas', booleano(tiene(ficha, /terraza/i))),
    etiqueta('exterior', booleano(/exterior/i.test(ficha.floor || ''))),
    etiqueta('tipoOrientacion', ORIENTACION[ficha.orientation]),
    etiqueta('comunidad', ficha.community),
    etiqueta('ascensor', booleano(ficha.lift)),
    `<listaImagenes>\n${urls.map((u) => `<imagen><url>${escapar(u)}</url></imagen>`).join('\n')}\n</listaImagenes>`,
  ].filter(Boolean);
  return `<propiedad>\n${lineas.join('\n')}\n</propiedad>`;
}

/* La fecha solo avanza si cambia el contenido de la vivienda. */
function fechar(cuerpos, estadoPrevio, ahora) {
  const estado = {};
  for (const [ref, cuerpo] of Object.entries(cuerpos)) {
    const huella = crypto.createHash('sha256').update(cuerpo).digest('hex').slice(0, 16);
    const previo = estadoPrevio[ref];
    estado[ref] = previo && previo.huella === huella ? previo : { huella, fecha: ahora };
  }
  return estado;
}

const sello = (d) => d.toISOString().slice(0, 19);

function construir({ fichas, traducciones, estadoPrevio = {}, ahora = sello(new Date()), raiz = RAIZ }) {
  const elegidas = fichas.filter((f) => traducciones[f.ref] && fotos(f.slug, raiz).length);
  const SIN_FECHA = '0000-00-00T00:00:00';
  const cuerpos = Object.fromEntries(elegidas.map((f) => [f.ref, propiedad(f, traducciones[f.ref], SIN_FECHA, fotos(f.slug, raiz))]));
  const estado = fechar(cuerpos, estadoPrevio, ahora);
  const ultima = Object.values(estado).map((x) => x.fecha).sort().pop() || ahora;
  const bloques = elegidas.map((f) => cuerpos[f.ref].replace(SIN_FECHA, estado[f.ref].fecha));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<carteraPropiedades xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="${ESQUEMA}">\n<fecha>${ultima}</fecha>\n<listaPropiedades>\n${bloques.join('\n')}\n</listaPropiedades>\n</carteraPropiedades>\n`;
  return { xml, estado, referencias: elegidas.map((f) => f.ref) };
}

function main() {
  const traducciones = JSON.parse(fs.readFileSync(path.join(RAIZ, 'tools', 'i18n', 'viviendas_i18n.json'), 'utf8'));
  const estadoPrevio = fs.existsSync(ESTADO) ? JSON.parse(fs.readFileSync(ESTADO, 'utf8')) : {};
  const { xml, estado, referencias } = construir({ fichas: leerFichas(), traducciones, estadoPrevio });
  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  fs.writeFileSync(SALIDA, xml);
  fs.writeFileSync(ESTADO, `${JSON.stringify(estado, null, 1)}\n`);
  console.log(`feed/spainhouses.xml: ${referencias.length} viviendas (${referencias.join(', ')})`);
}

module.exports = { construir, propiedad, tipoInmueble, energia, fechar, leerFichas, escapar };
if (require.main === module) main();
