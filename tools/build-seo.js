#!/usr/bin/env node
/* Genera la capa SEO / GEO del preview y la escribe EN EL HTML (no por JS: los
   crawlers de IA y los lectores de enlaces no ejecutan JavaScript).

   Produce en cada página: description, canonical, Open Graph, Twitter Card,
   theme-color y JSON-LD según el tipo. Y a nivel de sitio: robots.txt,
   sitemap.xml, llms.txt y site.webmanifest.

   Uso:  node tools/build-seo.js                          (noindex: es un preview)
         node tools/build-seo.js --index --si-publicar   (abre la indexación)

   El preview se mantiene en noindex por decisión de Jose hasta que la web esté
   acabada: indexarlo ahora lo pondría a competir con villasproperties.es.
*/
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://josecrea.github.io/villasproperties-preview/';
/* Publicar es una decisión de negocio, no un flag que se teclea por inercia:
   indexar el preview duplicaría contenido con villasproperties.es. Por eso
   --index exige confirmación explícita. */
const WANTS_INDEX = process.argv.includes('--index');
const CONFIRMED = process.argv.includes('--si-publicar');
const PUBLISH = WANTS_INDEX && CONFIRMED;
if (WANTS_INDEX && !CONFIRMED) {
  console.error('\n[seo] --index NO aplicado.');
  console.error('[seo] Indexar este preview lo pone a competir con villasproperties.es');
  console.error('[seo] (contenido duplicado). Si de verdad quieres publicarlo:');
  console.error('[seo]   node tools/build-seo.js --index --si-publicar\n');
}
const TODAY = '2026-08-18';

const ORG = {
  name: "Villa's Properties",
  legalName: 'VILLVERG SL',
  phone: '+34667384965',
  street: 'Calle Ángel Arocha, 24',
  locality: 'Granadilla de Abona',
  region: 'Santa Cruz de Tenerife',
  postal: '38594',
  country: 'ES',
  areaServed: ['Adeje', 'Arona', 'Granadilla de Abona', 'San Miguel de Abona', 'Guía de Isora', 'Santiago del Teide'],
  sameAs: [
    'https://www.instagram.com/villasproperties.es/',
    'https://www.facebook.com/profile.php?id=61585337251095',
    'https://www.tiktok.com/@villasproperties.es',
    'https://www.youtube.com/@Villasproperties',
    'https://www.idealista.com/pro/villas-properties/',
    'https://villasproperties.es/',
  ],
};

/* description + tipo por página. Las que no aparecen heredan una genérica. */
const PAGES = {
  'index.html': {
    title: "Villa's Properties — Property Intelligence · Tenerife",
    desc: 'Inmobiliaria en Tenerife Sur con análisis de mercado propio: compra, venta, inversión y financiación con datos reales de cada microzona.',
    type: 'home', priority: '1.0',
  },
  'properties.html': {
    desc: 'Propiedades seleccionadas en Tenerife Sur con superficie, distribución, equipamiento y lectura de mercado de su microzona.',
    type: 'list', priority: '0.9',
  },
  'property.html': {
    desc: 'Ficha completa del inmueble: fotos, superficie, distribución, equipamiento, ubicación y contraste con el precio real de su microzona.',
    type: 'property', priority: '0.8',
  },
  'valuation.html': {
    title: 'Valoración gratis de tu casa en Tenerife Sur — Villa’s Properties',
    desc: 'Calcula gratis lo que vale tu vivienda en Tenerife Sur con datos reales: precio de anuncio, salida realista y valor de escritura del Notariado.',
    type: 'faq', priority: '0.9',
  },
  'insights.html': {
    desc: 'Análisis del mercado inmobiliario de Tenerife Sur con datos reales: precio por metro cuadrado, escrituras, volumen de operaciones y estrategia de venta.',
    type: 'blog', priority: '0.8',
  },
  'sell.html': { desc: 'Vender tu casa en Tenerife Sur con estrategia: valoración, posicionamiento de precio, Market Impact y control de la documentación.', priority: '0.8' },
  'buy.html': { desc: 'Comprar vivienda en Tenerife Sur con criterio: screening de oportunidades, due diligence, financiación y cierre acompañado.', priority: '0.8' },
  'finance.html': { desc: 'Financiación inmobiliaria en Tenerife: capacidad de compra real, entrada, cuota y preparación del expediente hipotecario.', priority: '0.7' },
  'invest.html': { desc: 'Inversión inmobiliaria en Tenerife Sur: yield, CAPEX, liquidez por municipio y estrategia de salida antes de firmar.', priority: '0.7' },
  'intelligence.html': { desc: 'Villa’s Intelligence: ACM, Market Impact y datos de microzona para decidir con números y no con impresiones.', priority: '0.7' },
  'contact.html': { desc: 'Habla con un asesor local de Villa’s Properties en Tenerife Sur. Sin llamadas automáticas.', priority: '0.6' },
  'advisory.html': { desc: 'Asesoramiento inmobiliario integral en Tenerife: estrategia, negociación y control documental de la operación.', priority: '0.6' },
  'case-studies.html': { desc: 'Casos reales de compraventa en Tenerife Sur: qué se hizo, qué datos se usaron y cómo terminó la operación.', priority: '0.6' },
  'decision-lab.html': { desc: 'Decision Lab: yield bruto, CAPEX y upside de salida de una oportunidad inmobiliaria antes de comprometerse.', priority: '0.6' },
  'market-impact.html': { desc: 'Market Impact: cómo se lee un precio publicado frente a las referencias de su zona, la exposición y la demanda real.', priority: '0.6' },
  'finance-lab.html': { desc: 'Finance Lab: simula entrada, cuota y capacidad de compra para una operación en Tenerife.', priority: '0.5' },
  'property-brief.html': { desc: 'Property Brief: define el encargo de búsqueda con criterios objetivos antes de empezar a ver casas.', priority: '0.5' },
  'property-compare.html': { desc: 'Compara propiedades de Tenerife Sur por precio, superficie, €/m² y características.', priority: '0.5' },
  'tenerife.html': { desc: 'Tenerife como dato: zona, regulación, demanda, ticket medio y perfil de comprador por municipio del sur.', priority: '0.6' },
  'privacy.html': { desc: 'Política de privacidad de Villa’s Properties: qué datos tratamos, con qué base legal y cómo ejercer tus derechos.', priority: '0.3', noindex: true },
  '404.html': { desc: 'Página no encontrada en Villa’s Properties.', priority: '0.1', noindex: true },
  'post-mapa-metro-cuadrado.html': {
    desc: 'De 6.233 €/m² en Playa de las Américas a 2.099 € en el casco de Granadilla: el precio real por zona en los seis municipios del sur de Tenerife.',
    type: 'article', priority: '0.8', published: TODAY, category: 'Mercado',
  },
  'post-anuncio-vs-escritura.html': {
    desc: 'La distancia entre el precio de anuncio y el de escritura en Tenerife Sur, municipio a municipio, con datos del Notariado.',
    type: 'article', priority: '0.8', published: TODAY, category: 'Venta',
  },
  'post-donde-se-vende-de-verdad.html': {
    desc: '8.552 compraventas al año en el sur de Tenerife: Arona firma 4 de cada 10 y Guía de Isora una de cada dieciocho.',
    type: 'article', priority: '0.8', published: TODAY, category: 'Inversión',
  },
  'post-como-valorar-tu-vivienda.html': {
    desc: 'Las tres cifras que necesitas para poner precio a tu casa en Tenerife y los cinco errores que cuestan meses de exposición.',
    type: 'article', priority: '0.8', published: TODAY, category: 'Guía',
  },
};

const GENERIC = 'Villa’s Properties: inmobiliaria en Tenerife Sur con análisis de mercado propio para comprar, vender, financiar e invertir con datos reales.';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const titleOf = (html) => (html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1].trim();

/* ---------- JSON-LD por tipo ---------- */
const orgLd = () => ({
  '@type': 'RealEstateAgent',
  '@id': `${BASE}#org`,
  name: ORG.name,
  legalName: ORG.legalName,
  url: BASE,
  telephone: ORG.phone,
  image: `${BASE}assets/brand/logo-placeholder.webp`,
  logo: `${BASE}assets/brand/logo-placeholder.webp`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: ORG.street,
    addressLocality: ORG.locality,
    addressRegion: ORG.region,
    postalCode: ORG.postal,
    addressCountry: ORG.country,
  },
  areaServed: ORG.areaServed.map((a) => ({ '@type': 'City', name: a })),
  knowsLanguage: ['es', 'en'],
  sameAs: ORG.sameAs,
});

const faqLd = () => ({
  '@type': 'FAQPage',
  mainEntity: [
    ['¿La valoración es realmente gratis?', 'Sí. La estimación automática y la primera revisión por un asesor local no tienen coste ni obligan a vender con Villa’s Properties.'],
    ['¿Una valoración de mercado es una tasación?', 'No. Una tasación homologada (ECO/805/2003) la firma una sociedad de tasación con visita e informe registral y sirve para el banco. La valoración de mercado sirve para decidir a qué precio salir.'],
    ['¿De dónde salen los €/m² del valorador?', 'De cuatro fuentes contrastadas: idealista (precio de oferta), Fotocasa (índice de compra), RealAdvisor (mediana por tipología) y el Portal Estadístico del Notariado (valor real de escritura). El Catastro aporta el valor de referencia. Se actualizan cada mes.'],
    ['¿Por qué a veces no dais una cifra?', 'Porque un terreno, un inmueble singular o un municipio sin serie de datos fiable no se valoran con un €/m² de vivienda. Preferimos abstenernos a dar un número que no significa nada.'],
    ['¿Qué municipios cubre la valoración en Tenerife Sur?', 'Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora y Santiago del Teide, con desglose por microzona.'],
  ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

const articleLd = (file, meta, title) => ({
  '@type': 'Article',
  headline: title.replace(/ — Villa’s Properties$/, ''),
  description: meta.desc,
  datePublished: meta.published,
  dateModified: meta.published,
  articleSection: meta.category,
  inLanguage: 'es-ES',
  author: { '@type': 'Organization', name: ORG.name, url: BASE },
  publisher: { '@id': `${BASE}#org` },
  mainEntityOfPage: `${BASE}${file}`,
  isAccessibleForFree: true,
});

const breadcrumbLd = (file, title) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE },
    ...(file.startsWith('post-') ? [{ '@type': 'ListItem', position: 2, name: 'Insights', item: `${BASE}insights.html` }] : []),
    { '@type': 'ListItem', position: file.startsWith('post-') ? 3 : 2, name: title.replace(/ — Villa’s Properties$/, ''), item: `${BASE}${file}` },
  ],
});

const websiteLd = () => ({
  '@type': 'WebSite',
  '@id': `${BASE}#website`,
  url: BASE,
  name: ORG.name,
  inLanguage: 'es-ES',
  publisher: { '@id': `${BASE}#org` },
});

const buildLd = (file, meta, title) => {
  const graph = [];
  if (file === 'index.html') graph.push(orgLd(), websiteLd());
  else graph.push({ '@id': `${BASE}#org`, '@type': 'RealEstateAgent', name: ORG.name, url: BASE });
  if (meta.type === 'faq') graph.push(faqLd());
  if (meta.type === 'article') graph.push(articleLd(file, meta, title));
  if (file !== 'index.html' && file !== '404.html') graph.push(breadcrumbLd(file, title));
  return { '@context': 'https://schema.org', '@graph': graph };
};

/* ---------- Reescritura del <head> ---------- */
const MARK_START = '<!-- seo:start -->';
const MARK_END = '<!-- seo:end -->';

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();
let touched = 0;

files.forEach((file) => {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const meta = PAGES[file] || {};
  const title = meta.title || titleOf(html) || `${ORG.name} — Property Intelligence · Tenerife`;
  const desc = meta.desc || GENERIC;
  const canonical = `${BASE}${file === 'index.html' ? '' : file}`;
  const image = `${BASE}assets/brand/venta-notaria.webp`;
  const noindex = !PUBLISH || meta.noindex;

  const block = [
    MARK_START,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta name="robots" content="${noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">`,
    '<meta name="theme-color" content="#5f8075">',
    '<meta property="og:type" content="website">',
    `<meta property="og:site_name" content="${esc(ORG.name)}">`,
    `<meta property="og:locale" content="es_ES">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${image}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${image}">`,
    '<link rel="manifest" href="site.webmanifest">',
    `<script type="application/ld+json">${JSON.stringify(buildLd(file, meta, title))}</script>`,
    MARK_END,
  ].join('\n');

  /* Fuera lo anterior: el bloque generado sustituye a las metas sueltas. */
  html = html.replace(new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}\\n?`), '');
  html = html.replace(/\s*<meta name="description"[^>]*>/g, '');
  html = html.replace(/\s*<meta name="robots"[^>]*>/g, '');
  html = html.replace(/\s*<meta name="theme-color"[^>]*>/g, '');
  html = html.replace(/\s*<link rel="canonical"[^>]*>/g, '');
  if (meta.title) html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`);

  html = html.replace('</head>', `${block}\n</head>`);
  fs.writeFileSync(filePath, html, 'utf8');
  touched += 1;
});

/* ---------- robots.txt ---------- */
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `# Villa's Properties — preview
User-agent: *
${PUBLISH ? 'Allow: /' : 'Disallow: /'}

# Crawlers de IA listados de forma explícita: al publicar se les permite el
# acceso para poder ser citados; mientras esto sea un preview, se bloquean.
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: ClaudeBot
User-agent: Claude-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
${PUBLISH ? 'Allow: /' : 'Disallow: /'}

${PUBLISH ? `Sitemap: ${BASE}sitemap.xml` : '# Sitemap: se publicará al abrir la indexación.'}
`, 'utf8');

/* ---------- sitemap.xml ---------- */
const urls = files
  .filter((f) => !(PAGES[f] || {}).noindex && f !== '404.html')
  .map((f) => `  <url>
    <loc>${BASE}${f === 'index.html' ? '' : f}</loc>
    <lastmod>${TODAY}</lastmod>
    <priority>${(PAGES[f] || {}).priority || '0.5'}</priority>
  </url>`).join('\n');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');

/* ---------- llms.txt (GEO: qué somos y qué puede citarse) ---------- */
fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# Villa's Properties

> Inmobiliaria en Tenerife Sur (VILLVERG SL) con análisis de mercado propio.
> Cubre Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora y
> Santiago del Teide. Contacto: ${ORG.phone} (WhatsApp).

## Qué hacemos
- Venta con estrategia de precio: rango de anuncio, salida realista y contraste con el valor de escritura del Notariado.
- Compra con due diligence: screening, documentación, financiación y cierre.
- Inversión: yield, CAPEX, liquidez del municipio y estrategia de salida.
- Valoración gratuita en dos minutos con datos reales por microzona.

## Datos que publicamos (actualización mensual)
- €/m² de oferta por municipio y por microzona (26 zonas del sur), fuente idealista.
- €/m² real de escritura por municipio, fuente Portal Estadístico del Notariado.
- Número de compraventas de vivienda al año por municipio, fuente Catastro.
- Contraste entre precio de anuncio y precio de escritura, ponderado por operaciones.

## Cifras destacadas (datos de julio de 2026)
- Rango del sur: 6.233 €/m² en Playa de las Américas frente a 2.099 €/m² en el casco de Granadilla (2,97 veces).
- Diferencia media entre anuncio y escritura ponderada por operaciones: 21,4%.
- Compraventas anuales en los seis municipios del sur: 8.552; Arona concentra el 40,2%.
- Municipio que más sube a 12 meses: San Miguel de Abona (+10,2%). El único que cae: Guía de Isora (-4,8%).

## Páginas
- [Valoración gratis](${BASE}valuation.html): estimación con datos reales por microzona.
- [Mapa de precios de Tenerife Sur](${BASE}post-mapa-metro-cuadrado.html): €/m² por zona.
- [Anuncio frente a escritura](${BASE}post-anuncio-vs-escritura.html): margen real de negociación.
- [Dónde se vende de verdad](${BASE}post-donde-se-vende-de-verdad.html): liquidez por municipio.
- [Cómo valorar tu vivienda](${BASE}post-como-valorar-tu-vivienda.html): método y errores frecuentes.
- [Propiedades](${BASE}properties.html): catálogo con ficha completa.

## Criterio editorial
No publicamos cifras sin fuente ni damos una valoración automática cuando el dato
no es fiable (terrenos, inmuebles singulares o municipios sin serie estadística).
Las estimaciones son orientativas y no sustituyen una tasación homologada.
`, 'utf8');

/* ---------- webmanifest ---------- */
fs.writeFileSync(path.join(ROOT, 'site.webmanifest'), JSON.stringify({
  name: "Villa's Properties — Property Intelligence · Tenerife",
  short_name: "Villa's",
  start_url: './',
  display: 'standalone',
  background_color: '#fbfaf7',
  theme_color: '#5f8075',
  lang: 'es-ES',
  icons: [{ src: 'assets/brand/logo-placeholder.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' }],
}, null, 2), 'utf8');

console.log(`[seo] ${touched} páginas · robots.txt, sitemap.xml (${urls.split('<url>').length - 1} URL), llms.txt y site.webmanifest`);
console.log(`[seo] indexación: ${PUBLISH
  ? 'ABIERTA (index,follow) — revisa el canonical antes de dejarlo así'
  : 'BLOQUEADA (noindex + robots Disallow) — se abre con --index --si-publicar'}`);
