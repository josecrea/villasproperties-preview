/* seo-textos.js — títulos y descripciones propios de las páginas que build-seo.js
   dejaba con la descripción genérica o con un título en inglés sin intención de
   búsqueda (auditoría V2, 27-oct-2026).

   Va en un fichero aparte para que build-seo.js siga siendo corto y para no pisarse
   con quien añada páginas a su PAGES. build-seo.js lo aplica DESPUÉS de PAGES.

   Regla de la casa: datos que ayudan; nada de «sobrevalorado» ni «se firma X % por debajo».
   La portada NO está aquí a propósito: sus clics vienen de la consulta de marca. */
'use strict';

const MARCA = 'Villa’s Properties';

const TEXTOS = {
  /* Títulos en inglés sin intención de búsqueda → español con la palabra que se busca. */
  'properties.html': { title: `Viviendas en venta en Tenerife Sur — ${MARCA}` },
  'insights.html': { title: `Blog inmobiliario de Tenerife Sur — ${MARCA}` },
  'case-studies.html': { title: `Casos reales de compraventa en Tenerife — ${MARCA}` },
  'intelligence.html': { title: `Datos de precios por zona en Tenerife Sur — ${MARCA}` },
  'market-impact.html': { title: `Market Impact: tu precio contra el mercado — ${MARCA}` },
  'decision-lab.html': { title: `Decision Lab: calculadora de rentabilidad — ${MARCA}` },
  'finance-lab.html': { title: `Calculadora de hipoteca: cuota y entrada — ${MARCA}` },
  'property-brief.html': { title: `Encargo de búsqueda de vivienda en Tenerife — ${MARCA}` },
  'property-compare.html': { title: `Comparador de viviendas en Tenerife Sur — ${MARCA}` },

  /* Legal: no aporta nada en un buscador (15 impresiones, 0 clics). */
  'aviso-legal.html': { noindex: true, robots: 'noindex,follow' },

  /* Blog: antes todas compartían la descripción genérica. */
  'post-como-vender-una-casa-5.html': {
    title: `Vender tu casa: fase 1, valorar el mercado — ${MARCA}`,
    desc: 'Primera fase para vender tu casa: cómo valorarla, leer el mercado actual y fijar un precio realista y defendible antes de salir a anunciar.',
  },
  'post-como-vender-una-casa-fase-2-6.html': {
    title: `Vender tu casa: fase 2, elegir inmobiliaria — ${MARCA}`,
    desc: 'Segunda fase para vender tu casa: vender solo o con inmobiliaria, cómo elegir agencia y cómo preparar la vivienda antes de las primeras visitas.',
  },
  'post-cuanto-vale-realmente-mi-villa-en-tenerife-la-clave-esta-en-la-precision-no-en-la-prisa-2.html': {
    desc: 'Cuánto vale de verdad una villa en Tenerife: por qué el precio de salida pide precisión y no prisa, y cómo fijarlo con datos de su zona.',
  },
  'post-de-adeje-al-norte-las-zonas-de-tenerife-que-marcaran-la-revalorizacion-en-2026-4.html': {
    title: 'Zonas de Tenerife que más se revalorizan en 2026',
    desc: 'Las zonas de Tenerife con más recorrido de revalorización en 2026, de Adeje al norte: dónde está el techo de precios y dónde las oportunidades emergentes.',
  },
  'post-el-precio-de-la-vivienda-en-espana-se-ha-incrementado-un-45-en-los-ultimos-diez-anos-7.html': {
    title: 'La vivienda en España sube un 45 % en diez años',
    desc: 'El metro cuadrado en España pasó de 1.307 € a 1.896 € entre 2016 y 2025 (+45 %), pero no en todas partes por igual: lectura por mercados locales.',
  },
  'post-estudio-anual-del-mercado-inmobiliario-1.html': {
    desc: 'Estudio anual del mercado inmobiliario de Tenerife (2020-2025): venta y alquiler en máximos históricos y por qué Adeje marca el techo de precios.',
  },
  'post-invertir-en-tenerife-por-que-la-seguridad-juridica-es-mas-importante-que-la-rentabilidad-3.html': {
    desc: 'Invertir en Tenerife: por qué la seguridad jurídica pesa más que la rentabilidad y qué comprobar (cargas, servidumbres, documentación) antes de comprar.',
  },
  'post-por-que-tu-casa-no-se-vende-en-tenerife-8.html': {
    desc: 'Si tu casa lleva meses sin venderse en Tenerife Sur, casi siempre es por unos pocos errores evitables: precio, presentación y exposición. Cómo detectarlos.',
  },
  'post-suelo-urbano-canarias-125000-viviendas.html': {
    title: 'Suelo urbano en Canarias: 125.000 viviendas',
    desc: 'Canarias tiene suelo urbano consolidado para 125.024 viviendas según el observatorio Obvia, y el potencial se concentra donde ya está la demanda.',
  },
  'post-vender-casa-tenerife-sur.html': {
    title: 'Vender casa en Tenerife Sur: precio real y plazos',
    desc: 'Vender casa en el sur de Tenerife: precio real por zona, lo que te queda neto tras impuestos, la retención del 3 % a no residentes y los plazos.',
  },
  /* Páginas publicadas después de la auditoría: el título propio pasaba de 60 y Google lo corta. */
  'informe-sur-de-tenerife-2026-10-27.html': { title: 'Informe del sur de Tenerife · octubre 2026' },
  'post-newsletter-sur-de-tenerife-2026-10-27.html': { title: 'Las Rosas +16,6 %: el sur de Tenerife en cifras' },
  'post-mapa-metro-cuadrado.html': { title: 'El mapa del metro cuadrado en Tenerife Sur' },
  'informe-sur-de-tenerife-2026-11-05.html': { title: 'Informe del sur de Tenerife · noviembre 2026' },
  'post-newsletter-sur-de-tenerife-2026-11-05.html': { title: 'San Isidro +11,4 % y la demanda extranjera, en máximos' },
  'post-comprar-vivienda-tenerife-desde-la-ue.html': {
    title: 'Comprar vivienda en Tenerife desde otro país de la UE',
    desc: 'Cómo comprar una vivienda en Tenerife viviendo en otro país de la UE: NIE, poder notarial, cuenta bancaria, hipoteca para no residentes y plazos reales.',
  },
  'post-impuestos-comprar-vivienda-canarias.html': { title: 'Impuestos al comprar vivienda en Canarias (2026)' },
  'post-segunda-residencia-costa-adeje.html': { title: 'Segunda residencia en Costa Adeje: zonas y costes (2026)' },
  'residence-secondaire-costa-adeje-fr.html': {
    title: 'Résidence secondaire à Costa Adeje : zones et coûts (2026)',
    desc: 'Résidence secondaire à Costa Adeje pour acheteurs belges, néerlandais et allemands : zones, coûts réels, fiscalité et démarches avant de signer.',
  },
  'tweede-verblijf-costa-adeje-nl.html': { title: 'Tweede verblijf in Costa Adeje: zones en kosten (2026)' },
  'zweitwohnsitz-costa-adeje-de.html': { title: 'Zweitwohnsitz in Costa Adeje: Zonen und Kosten (2026)' },
};

const MAX_DESC = 155;
const MAX_TITULO = 60;

/* Un título que pasa de 60 pierde primero «Properties» y después la marca entera
   (Google la añade por su cuenta). Si aun así no cabe se deja como está y lo canta
   tools/audit-titulos.js: toca escribirle uno corto arriba, en TEXTOS. */
const tituloCorto = (t) => {
  const s = String(t).trim();
  if (s.length <= MAX_TITULO) return s;
  const m = s.match(/^(.*?)\s*(—|\|)\s*Villa(?:’|')s(?: Properties)?$/);
  if (!m) return s;
  const corta = `${m[1]} ${m[2]} Villa’s`;
  return corta.length <= MAX_TITULO ? corta : (m[1].length <= MAX_TITULO ? m[1] : s);
};

/* Una descripción larga se recorta en el último punto que deje ≥ 70 caracteres;
   si no hay, en la última palabra. Nunca a mitad de cifra. */
const recortaDesc = (s) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= MAX_DESC) return t;
  const corte = t.slice(0, MAX_DESC);
  const punto = corte.lastIndexOf('. ');
  if (punto >= 70) return corte.slice(0, punto + 1);
  return `${corte.slice(0, corte.lastIndexOf(' ')).replace(/[,;:]$/, '')}…`;
};

/* Landings comprar-casa-* y vender-casa-*: el título largo (74-88 car.) se corta en
   los resultados. Sin la marca (Google la añade) y con la fórmula corta si hace falta. */
const esLanding = (f) => /^(comprar|vender)-casa-.+\.html$/.test(f);
const tituloLanding = (t) => {
  let r = t.replace(/\s*\|\s*Villa’s Properties$/, '');
  if (r.length > 60) r = r.replace('precios por zona y margen real', 'precios y margen real');
  if (r.length > 60) r = r.replace(' y qué comprobar', '');
  return r;
};

module.exports = { TEXTOS, recortaDesc, esLanding, tituloLanding, tituloCorto, MAX_DESC, MAX_TITULO };
