#!/usr/bin/env node
/* build-fichas.js — Una URL indexable por vivienda: vivienda-<slug>.html
 *
 * POR QUÉ
 * -------
 * Hasta ahora las 7 viviendas vivían detrás de UNA sola URL (property.html?ref=…):
 * título genérico «Ficha de propiedad», canonical a property.html, el contenido
 * pintado por JavaScript y solo property.html en el sitemap. Google veía una página
 * sin contenido propio (GSC 26-jul→25-oct: 33 impresiones, 0 clics, posición 6,4).
 *
 * QUÉ HACE
 * --------
 * Sale de properties-data.js (FUENTE ÚNICA; aquí no se copia ningún dato):
 *   1. vivienda-<slug>.html por vivienda, con title/description/canonical propios,
 *      H1, ficha técnica, descripción, fotos con alt, enlaces a hermanas y landings,
 *      y JSON-LD RealEstateListing + Offer + BreadcrumbList. El contenido principal
 *      está en el HTML (sin JS); property.js lo sustituye por la ficha interactiva.
 *   2. Reescribe en index.html y properties.html (tarjetas prerenderizadas) los
 *      enlaces property.html?ref=<ref> → vivienda-<slug>.html.
 *   3. Inyecta «Viviendas en venta» (entre marcas) en las landings comprar-casa-*.
 *   4. Borra vivienda-*.html cuya vivienda ya no esté en properties-data.js.
 * El sitemap y llms.txt los escribe tools/build-seo.js (que lee los mismos datos).
 *
 * SE REGENERA, NO SE EDITA
 * ------------------------
 *   node tools/build-fichas.js           escribe
 *   node tools/build-fichas.js --check   no escribe; sale con 1 si algo está desfasado
 * Orden tras tocar datos:  build-fichas → build-seo (--index --si-publicar) → sellar.sh
 * Estado 'En venta' = indexable e InStock. Cualquier otro estado = noindex + SoldOut
 * y fuera del sitemap: una vivienda vendida no se publica como disponible.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const BASE = 'https://villasproperties.es';
const PREFIJO = 'vivienda-';
const CHECK = process.argv.includes('--check');
const WA = '34667384965';

global.window = {};
require(path.join(RAIZ, 'properties-data.js'));
const props = global.window.VP_PROPERTIES || [];
if (!props.length) { console.error('[fichas] properties-data.js vacío: no se toca nada.'); process.exit(1); }

const E = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const miles = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const euro = (v) => `${miles(v)} €`;
const archivo = (p) => `${PREFIJO}${p.slug}.html`;
const urlDe = (p) => `${BASE}/${archivo(p)}`;
const enVenta = (p) => p.status === 'En venta';
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

/* Se lee de property.html para no duplicar el CSP ni la lista de scripts: si cambian
   allí (o sellar.sh refresca el ?v=), las fichas heredan al regenerar. */
const plantilla = fs.readFileSync(path.join(RAIZ, 'property.html'), 'utf8');
const csp = (plantilla.match(/<meta http-equiv="Content-Security-Policy"[^>]*>/) || [''])[0];
const sello = (plantilla.match(/site\.css\?v=(\d+)/) || [, ''])[1];
const scripts = (plantilla.match(/<\/footer>\s*([\s\S]*?)<\/body>/) || [, ''])[1].trim();
if (!csp || !sello || !scripts) { console.error('[fichas] property.html no tiene el formato esperado.'); process.exit(1); }

/* Landings que existen: municipio (zoneKey) y zona (zoneId). */
const landingMuni = { adeje: 'comprar-casa-adeje', arona: 'comprar-casa-arona',
  granadilla: 'comprar-casa-granadilla-de-abona', 'san-miguel': 'comprar-casa-san-miguel-de-abona',
  'guia-isora': 'comprar-casa-guia-de-isora', 'santiago-teide': 'comprar-casa-santiago-del-teide' };
const landingZona = { 'costa-adeje': 'comprar-casa-costa-adeje', 'los-cristianos': 'comprar-casa-los-cristianos',
  'el-medano': 'comprar-casa-el-medano' };
const existe = (slug) => fs.existsSync(path.join(RAIZ, `${slug}.html`));
const landingsDe = (p) => [
  [landingZona[p.zoneId], `Comprar casa en ${p.zone}`],
  [landingMuni[p.zoneKey], `Comprar casa en ${p.town}`],
].filter(([s]) => s && existe(s)).map(([s, t]) => ({ href: `${s}.html`, texto: t }));

const tipoSchema = (t) => (/^(Casa|Chalet|Villa)/i.test(t) ? 'House' : 'Apartment');
const absoluta = (rel) => `${BASE}/${String(rel).replace(/^\//, '')}`;

/* Google corta hacia los 60-65 caracteres: la marca entra entera solo si cabe. */
const titulo = (p) => {
  const base = `${p.titleShort} · ${euro(p.price)}`;
  return [' | Villa’s Properties', ' | Villa’s'].map((m) => base + m).find((t) => t.length <= 65) || base;
};
const descripcion = (p) => `${p.type} en venta en ${p.zone} (${p.town}): ${p.built} m² construidos, `
  + `${plural(p.beds, 'dormitorio', 'dormitorios')}, ${plural(p.baths, 'baño', 'baños')}. ${euro(p.price)}. `
  + 'Fotos y ficha completa.';

const jsonld = (p) => {
  const url = urlDe(p);
  const imgs = (p.images || []).slice(0, 6).map(absoluta);
  const bien = {
    '@type': tipoSchema(p.type),
    name: p.title,
    numberOfBedrooms: p.beds,
    numberOfBathroomsTotal: p.baths,
    floorSize: { '@type': 'QuantitativeValue', value: p.built, unitCode: 'MTK' },
    /* Sin calle ni número: la ficha publica la ZONA, no la puerta del vendedor. */
    address: { '@type': 'PostalAddress', addressLocality: p.town, addressRegion: 'Santa Cruz de Tenerife', addressCountry: 'ES' },
  };
  if (p.year) bien.yearBuilt = p.year;
  if (Array.isArray(p.coords) && p.coords.length === 2) bien.geo = { '@type': 'GeoCoordinates', latitude: p.coords[0], longitude: p.coords[1] };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@id': `${BASE}/#org`, '@type': 'RealEstateAgent', name: "Villa's Properties", url: `${BASE}/` },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Propiedades', item: `${BASE}/properties.html` },
        { '@type': 'ListItem', position: 3, name: p.titleShort, item: url },
      ] },
      {
        '@type': 'RealEstateListing', '@id': `${url}#listing`, url, mainEntityOfPage: url,
        name: p.title, inLanguage: 'es-ES',
        description: Array.isArray(p.description) ? p.description[0] : p.description,
        image: imgs,
        about: bien,
        offers: {
          '@type': 'Offer', price: p.price, priceCurrency: 'EUR',
          availability: enVenta(p) ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          seller: { '@id': `${BASE}/#org` },
        },
      },
    ],
  };
};

const ficha = (p) => {
  const otras = props.filter((o) => o.slug !== p.slug && enVenta(o));
  const wa = `https://wa.me/${WA}?text=${encodeURIComponent(`Hola, me interesa la referencia ${p.ref} — ${p.title} (${p.zone}, ${euro(p.price)}). ¿Podemos hablar?`)}`;
  const specs = [
    ['Superficie construida', `${p.built} m²`], ['Superficie útil', `${p.useful} m²`],
    ['Dormitorios', p.beds], ['Baños', p.baths], ['Planta', p.floor],
    ['Ascensor', p.lift ? 'Sí' : 'No'], ['Orientación', p.orientation], ['Año de construcción', p.year],
    ['Estado', p.condition], ['Comunidad', p.community ? `${p.community} €/mes` : 'No consta'],
    ['Certificado energético', p.energy], ['Referencia', p.ref],
  ];
  const fotos = (p.images || []).slice(0, 5);
  const robots = enVenta(p) ? 'index,follow,max-image-preview:large,max-snippet:-1' : 'noindex,follow';
  const t = titulo(p);
  const d = descripcion(p);
  const og = fotos.length ? absoluta(fotos[0]) : `${BASE}/assets/brand/venta-notaria.webp`;
  const enlaces = landingsDe(p);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${E(t)}</title>
<link rel="icon" type="image/webp" href="assets/brand/logo-placeholder.webp">
<link rel="stylesheet" href="site.css?v=${sello}">
${csp}
<meta name="referrer" content="strict-origin-when-cross-origin">
<!-- fichas:start (generado por tools/build-fichas.js desde properties-data.js: no editar a mano) -->
<meta name="description" content="${E(d)}">
<link rel="canonical" href="${urlDe(p)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#5f8075">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Villa's Properties">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="${E(t)}">
<meta property="og:description" content="${E(d)}">
<meta property="og:url" content="${urlDe(p)}">
<meta property="og:image" content="${E(og)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${E(t)}">
<meta name="twitter:description" content="${E(d)}">
<meta name="twitter:image" content="${E(og)}">
<link rel="manifest" href="site.webmanifest">
<script type="application/ld+json">${JSON.stringify(jsonld(p))}</script>
<!-- fichas:end -->
</head>
<body>
<a class="skip-link" href="#propertyView">Saltar al contenido</a>
<header class="header solid"></header>

<main id="propertyView">
  <section class="phero">
    <div class="wrap">
      <nav class="pbread" aria-label="Migas de pan">
        <a href="index.html">Inicio</a> <span>·</span>
        <a href="properties.html">Properties</a> <span>·</span>
        <span>${E(p.zone)}</span>
      </nav>
      <div class="phead">
        <div>
          <div class="eye">${E(p.status)} · ${E(p.type)} · Ref. ${E(p.ref)}</div>
          <h1>${E(p.title)}</h1>
          <p class="pplace">${E(p.zone)}, ${E(p.town)}</p>
        </div>
        <div class="pprice"><strong>${euro(p.price)}</strong><span>${miles(p.pricePerM2)} €/m²</span></div>
      </div>
    </div>
  </section>
  <section class="section tight" style="padding-top:0"><div class="wrap">
    <div class="pgal"><div class="pgal-side" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
${fotos.map((src, i) => `      <img src="${E(src)}" alt="${E(p.title)} — ${E(p.zone)}, ${E(p.town)}: foto ${i + 1}" width="1200" height="800"${i ? ' loading="lazy"' : ' fetchpriority="high"'}>`).join('\n')}
    </div></div>
    <div class="pquick">
      <div><small>Construidos</small><strong>${p.built} m²</strong></div>
      <div><small>Útiles</small><strong>${p.useful} m²</strong></div>
      <div><small>Dormitorios</small><strong>${p.beds}</strong></div>
      <div><small>Baños</small><strong>${p.baths}</strong></div>
      <div><small>Año</small><strong>${p.year}</strong></div>
    </div>
  </div></section>
  <section class="section tight"><div class="wrap pmain"><div class="pcol">
    <div class="eye">La propiedad</div>
    <h2 class="ph2">${E(p.highlight)}</h2>
${(p.description || []).map((x) => `    <p>${E(x)}</p>`).join('\n')}
    <h3 class="ph3">Características</h3>
    <ul class="ptags">
${[...(p.features || []), ...(p.equipment || [])].map((f) => `      <li>${E(f)}</li>`).join('\n')}
    </ul>
    <h3 class="ph3">Ficha técnica</h3>
    <dl class="pspecs">
${specs.map(([k, v]) => `      <div><dt>${E(k)}</dt><dd>${E(v)}</dd></div>`).join('\n')}
    </dl>
    <p><a class="btn fill" href="${wa}" target="_blank" rel="noopener">Hablar de esta vivienda por WhatsApp ↗</a>
    <a class="btn" href="contact.html">Pedir información</a></p>
${enlaces.length ? `    <p class="muted">${enlaces.map((l) => `<a href="${l.href}">${E(l.texto)}</a>`).join(' · ')}</p>\n` : ''}    <h3 class="ph3">Más viviendas en venta</h3>
    <ul class="ptags">
${otras.map((o) => `      <li><a href="${archivo(o)}">${E(o.titleShort)} · ${euro(o.price)}</a></li>`).join('\n')}
    </ul>
  </div></div></section>
</main>

<footer class="footer"></footer>
<script>window.VP_FICHA_REF=${JSON.stringify(p.slug)};</script>
${scripts}
</body>
</html>
`;
};

/* ---------- Escritura (o comprobación) ---------- */
let desfasados = 0;
const escribe = (ruta, contenido) => {
  const abs = path.join(RAIZ, ruta);
  const actual = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  if (actual === contenido) return;
  desfasados += 1;
  if (CHECK) { console.error(`[fichas] DESFASADO: ${ruta}`); return; }
  fs.writeFileSync(abs, contenido, 'utf8');
};

props.forEach((p) => escribe(archivo(p), ficha(p)));

/* Huérfanas: vivienda-*.html sin vivienda en los datos. */
const vigentes = new Set(props.map(archivo));
fs.readdirSync(RAIZ).filter((f) => f.startsWith(PREFIJO) && f.endsWith('.html') && !vigentes.has(f)).forEach((f) => {
  desfasados += 1;
  if (CHECK) { console.error(`[fichas] HUÉRFANA: ${f}`); return; }
  fs.unlinkSync(path.join(RAIZ, f));
  console.warn(`[fichas] borrada ${f}: añade en _redirects  /${f}  /properties.html  301`);
});

/* Tarjetas prerenderizadas: property.html?ref=<ref> → ficha propia. */
['index.html', 'properties.html'].forEach((f) => {
  let html = fs.readFileSync(path.join(RAIZ, f), 'utf8');
  props.forEach((p) => { html = html.split(`property.html?ref=${p.ref}`).join(archivo(p)); });
  escribe(f, html);
});

/* Landings de compra: bloque entre marcas, antes del CTA final. */
const M0 = '<!-- fichas:viviendas:start -->';
const M1 = '<!-- fichas:viviendas:end -->';
const reBloque = new RegExp(`\\s*${M0}[\\s\\S]*?${M1}`);
const listas = [...Object.entries(landingMuni).map(([k, s]) => [s, props.filter((p) => p.zoneKey === k && enVenta(p)), 'en ' + (props.find((p) => p.zoneKey === k) || {}).town]),
  ...Object.entries(landingZona).map(([k, s]) => [s, props.filter((p) => p.zoneId === k && enVenta(p)), null])];
listas.forEach(([slug, lista, _]) => {
  if (!existe(slug)) return;
  const ruta = `${slug}.html`;
  let html = fs.readFileSync(path.join(RAIZ, ruta), 'utf8');
  html = html.replace(reBloque, '');
  if (lista.length) {
    const bloque = `\n  ${M0}\n  <section class="section tight"><div class="wrap">\n    <div class="eye">Viviendas en venta</div>\n`
      + `    <ul class="ptags" style="margin-top:16px">\n${lista.map((p) => `      <li><a href="${archivo(p)}">${E(p.titleShort)} · ${euro(p.price)}</a></li>`).join('\n')}\n    </ul>\n  </div></section>\n  ${M1}\n`;
    html = html.replace('\n  <section class="sell-cta"', `${bloque}\n  <section class="sell-cta"`);
    if (!html.includes(M0)) { console.error(`[fichas] ${ruta}: no encuentro .sell-cta para anclar el bloque`); process.exit(1); }
  }
  escribe(ruta, html);
});

if (CHECK) {
  if (desfasados) { console.error(`[fichas] ${desfasados} fichero(s) desfasado(s): ejecuta node tools/build-fichas.js`); process.exit(1); }
  console.log('[fichas] al día');
} else {
  console.log(`[fichas] ${props.length} fichas (${props.filter(enVenta).length} en venta) · ${desfasados} fichero(s) escritos`);
}
