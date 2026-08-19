#!/usr/bin/env node
/* build-landings.js — Las seis landings de "vender casa en <municipio>".
 *
 * POR QUÉ GENERADAS Y NO ESCRITAS A MANO
 * --------------------------------------
 * Son la puerta de entrada de SEO local: "vender casa en Adeje" es lo que
 * teclea quien quiere vender, y hoy es el contenido que más vendedores trae a
 * villasproperties.es. Pero citan cifras —€/m² de anuncio, de escritura, por
 * zona— que cambian cada mes. Escritas a mano, al mes siguiente mienten.
 *
 * Generándolas desde market-data.js, actualizar los precios actualiza también
 * las seis landings. Es la misma razón por la que market-data.js se genera del
 * JSON canónico y no se edita.
 *
 * NO ENSUCIAN EL SITIO, y es deliberado:
 *   - no entran en el menú principal, que se queda en seis entradas
 *   - se alcanzan desde sell.html, que es donde tiene sentido buscarlas
 *   - se enlazan entre sí (interlinking), que es lo que Google premia
 *   - usan el mismo CSS y la misma cabecera que el resto: no hay estilos nuevos
 *
 * Uso:  node tools/build-landings.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DOMINIO = 'https://josecrea.github.io/villasproperties-preview';

/* Coordenadas REALES de cada municipio. Las landings de la web actual llevan
   las seis las mismas —las de la empresa—, que para SEO local es como no
   ponerlas: el buscador no distingue un municipio de otro. */
/* EL SLUG NO ES LIBRE. Estas URLs ya están indexadas en villasproperties.es:
   si la web nueva las publica con otro nombre, al migrar dan 404 y se pierde
   el posicionamiento acumulado, que es justo lo que se venía a conservar.
   Se usan las de la web viva, tal cual, aunque sean más largas. */
const SLUG = {
  adeje: 'vender-casa-adeje',
  arona: 'vender-casa-arona',
  granadilla: 'vender-casa-granadilla-de-abona',
  'san-miguel': 'vender-casa-san-miguel-de-abona',
  'guia-isora': 'vender-casa-guia-de-isora',
  'santiago-teide': 'vender-casa-santiago-del-teide',
};

const MUNI = {
  adeje: { geo: [28.1227, -16.7261], cp: '38670', comarca: 'Costa suroeste',
    gancho: 'Entre Costa Adeje y las medianías hay más diferencia que entre dos municipios distintos.' },
  arona: { geo: [28.0997, -16.6810], cp: '38640', comarca: 'Costa sur',
    gancho: 'Arona firma cuatro de cada diez compraventas de la comarca: es el municipio con más salida.' },
  granadilla: { geo: [28.1187, -16.5772], cp: '38600', comarca: 'Sureste',
    gancho: 'El Médano y el casco son dos mercados distintos dentro del mismo ayuntamiento.' },
  'san-miguel': { geo: [28.0975, -16.6136], cp: '38620', comarca: 'Sur',
    gancho: 'Golf del Sur tira del municipio, pero el casco se mueve en otra liga de precio.' },
  'guia-isora': { geo: [28.2058, -16.7797], cp: '38680', comarca: 'Suroeste',
    gancho: 'Abama marca el techo de precio de todo el sur, y arrastra la media del municipio.' },
  'santiago-teide': { geo: [28.2939, -16.8281], cp: '38690', comarca: 'Oeste',
    gancho: 'Los Gigantes vende a comprador internacional; el interior, a residente.' },
};

/* Las preguntas vienen de las landings que ya funcionan: son las que la gente
   hace de verdad. Se conservan y se les actualiza la cifra. */
const FAQ_COMUN = (n, d) => [
  [`¿Por qué el precio de escritura de ${n} es más bajo que el de los portales?`,
   `Porque los ${fmt(d.notaria)} €/m² del Notariado son la media de TODAS las compraventas del municipio —casco, medianías y costa—, mientras que el €/m² de los portales es lo que se pide, y se pide más en la zona cara. No es que se venda barato: es que se está midiendo otra cosa.`],
  [`¿Qué gastos tiene el vendedor en ${n}?`,
   `Habitualmente la plusvalía municipal (IIVTNU) del Ayuntamiento de ${n} salvo pacto en contrario, la cancelación registral de la hipoteca si la hubiera, el certificado energético y la ganancia patrimonial en el IRPF. Se calcula antes de firmar, no después.`],
  ['¿Puedo vender si tengo la vivienda alquilada?',
   'Sí. El contrato de arrendamiento sigue vivo para el comprador y el inquilino puede tener derecho de adquisición preferente según el caso. Hay que planificarlo antes de publicar, no cuando ya hay oferta.'],
  ['¿La licencia de vivienda vacacional se transmite con la venta?',
   'No. La Ley 6/2025 de Ordenación Sostenible del Uso Turístico de Viviendas extingue la habilitación con la transmisión de la propiedad. Si tu vivienda tiene licencia turística, conviene decirlo desde el principio: cambia el precio y el tipo de comprador.'],
  ['¿La valoración es gratis y sin compromiso?',
   'Sí. La estimación es inmediata y la revisión de un asesor local no tiene coste ni obliga a firmar ningún encargo de venta.'],
];

const fmt = (n) => (n == null ? '—' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
const E = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Datos de mercado: la misma fuente que el valorador. */
const src = fs.readFileSync(path.join(RAIZ, 'market-data.js'), 'utf8');
const MERCADO = JSON.parse(src.match(/window\.VP_MARKET\s*=\s*(\{[\s\S]*\});/)[1]);

/* Cabecera, pie y scripts se heredan de una página existente: si mañana se
   añade un script o cambia el menú, las landings lo heredan sin tocarlas. */
const modelo = fs.readFileSync(path.join(RAIZ, 'sell.html'), 'utf8');
const scripts = (modelo.match(/<script src="[^"]+"[^>]*><\/script>/g) || []).join('');
const cssTag = (modelo.match(/<link rel="stylesheet" href="site\.css[^"]*">/) || [''])[0];
const cabecera = (modelo.match(/<header[\s\S]*?<\/header>/) || [''])[0];
const pie = (modelo.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
const skip = '<a class="skip-link" href="#contenido">Saltar al contenido</a>';

const hoy = new Date().toISOString().slice(0, 10);
const claves = Object.keys(MERCADO.municipios);
let hechas = 0;

for (const [k, m] of Object.entries(MERCADO.municipios)) {
  const cfg = MUNI[k];
  if (!cfg) { console.log(`  ⚠ sin configuración: ${k}`); continue; }
  const n = m.name;
  const fichero = `${SLUG[k]}.html`;
  const brecha = m.notaria ? ((m.eurM2 - m.notaria) / m.eurM2 * 100).toFixed(1).replace('.', ',') : null;
  const zonas = (m.zonas || []).slice().sort((a, b) => b.eurM2 - a.eurM2);
  const cara = zonas[0]; const barata = zonas[zonas.length - 1];

  const faq = [
    [`¿Cuánto vale mi casa en ${cara ? cara.label : n}?`,
     `${cara ? cara.label : n} se mueve en el entorno de ${fmt(cara ? cara.eurM2 : m.eurM2)} €/m² de precio de anuncio, pero el cierre depende de la planta, las vistas, la terraza y el estado. Esa cifra es el punto de partida de la conversación, no el precio.`],
    ...FAQ_COMUN(n, m),
  ];

  const filasZonas = zonas.map((z) => `<tr><td>${E(z.label)}</td><td>${fmt(z.eurM2)} €/m²</td>`
    + `<td>${z.var1a != null ? (z.var1a > 0 ? '+' : '') + String(z.var1a).replace('.', ',') + ' %' : '—'}</td></tr>`).join('');

  const otras = claves.filter((x) => x !== k).map((x) =>
    `<a class="btn" href="${SLUG[x]}.html">${E(MERCADO.municipios[x].name)}</a>`).join('');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service', serviceType: `Venta de vivienda en ${n}`,
        provider: { '@type': 'RealEstateAgent', name: "Villa's Properties",
          telephone: '+34667384965', email: 'info@villasproperties.es',
          address: { '@type': 'PostalAddress', addressLocality: n, postalCode: cfg.cp,
            addressRegion: 'Santa Cruz de Tenerife', addressCountry: 'ES' } },
        areaServed: { '@type': 'City', name: n,
          geo: { '@type': 'GeoCoordinates', latitude: cfg.geo[0], longitude: cfg.geo[1] } },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR',
          description: 'Valoración y estrategia de precio sin coste ni compromiso' } },
      { '@type': 'FAQPage', mainEntity: faq.map(([p, r]) => ({
        '@type': 'Question', name: p, acceptedAnswer: { '@type': 'Answer', text: r } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${DOMINIO}/` },
        { '@type': 'ListItem', position: 2, name: 'Vender', item: `${DOMINIO}/sell.html` },
        { '@type': 'ListItem', position: 3, name: `Vender casa en ${n}` } ] },
    ],
  };

  const titulo = `Vender casa en ${n}: precio real por zonas | Villa’s Properties`;
  const desc = `Cuánto vale de verdad tu vivienda en ${n}: ${fmt(m.eurM2)} €/m² de anuncio`
    + (m.notaria ? ` frente a ${fmt(m.notaria)} €/m² de escritura ante notario` : '')
    + '. Valoración gratuita y sin compromiso.';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${E(titulo)}</title>
<meta name="description" content="${E(desc)}">
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="${DOMINIO}/${fichero}">
<meta property="og:type" content="website">
<meta property="og:title" content="${E(titulo)}">
<meta property="og:description" content="${E(desc)}">
<meta property="og:url" content="${DOMINIO}/${fichero}">
<meta property="og:image" content="${DOMINIO}/assets/brand/tenerife-mercado.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${E(titulo)}">
<meta name="twitter:image" content="${DOMINIO}/assets/brand/tenerife-mercado.webp">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
${cssTag}
</head>
<body>
${skip}
${cabecera}
<main id="contenido">

  <section class="pagehero"><div class="wrap">
    <div class="eye">${E(n.toUpperCase())} · ${E(cfg.comarca)}</div>
    <h1>Vender casa en ${E(n)}:<br>lo que se pide y lo que se firma.</h1>
    <p class="pagelede">En ${E(n)} se piden <strong>${fmt(m.eurM2)} €/m²</strong> de media`
    + (m.notaria ? ` y se firman ante notario <strong>${fmt(m.notaria)} €/m²</strong>` : '')
    + `. ${E(cfg.gancho)}</p>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="head" data-reveal><div class="eye">01 · ${E(n)} en cifras</div>
    <div><h2>El número que importa<br>es el que se escritura.</h2></div></div>
    <div class="bankcifras">
      <div><strong>${fmt(m.eurM2)} €/m²</strong><small>lo que se pide · idealista ${E(MERCADO.meta.dates.idealista)}</small></div>
      ${m.notaria ? `<div><strong>${fmt(m.notaria)} €/m²</strong><small>lo que se firma · Notariado</small></div>` : ''}
      ${brecha ? `<div><strong>${brecha} %</strong><small>distancia entre pedir y firmar</small></div>` : ''}
    </div>
    <p class="bankpie">La diferencia no es un descuento que puedas negociar sin más: el dato de
    escritura es la media de todas las compraventas del municipio, casco incluido. Sirve para
    saber dónde está el suelo, no para poner precio a ciegas.</p>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="head" data-reveal><div class="eye">02 · Zonas</div>
    <div><h2>El €/m² de ${E(n)},<br>zona a zona.</h2>
    <p class="muted">La media municipal no describe ninguna casa concreta.${cara && barata && cara !== barata
      ? ` Entre ${E(cara.label)} y ${E(barata.label)} hay ${(cara.eurM2 / barata.eurM2).toFixed(2).replace('.', ',')} veces de diferencia.` : ''}</p></div></div>
    <table class="post-table"><thead><tr><th>Zona</th><th>€/m² de anuncio</th><th>12 meses</th></tr></thead>
    <tbody>${filasZonas}</tbody></table>
    <p class="bankpie">Fuente: idealista, ${E(MERCADO.meta.dates.idealista)}. Precio de anuncio, no de cierre.</p>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="head" data-reveal><div class="eye">03 · Preguntas</div>
    <div><h2>Lo que preguntan<br>los que venden aquí.</h2></div></div>
    <div class="feature-list">
      ${faq.map(([p, r], i) => `<div class="feature-row"><b>${String(i + 1).padStart(2, '0')}</b>`
        + `<div><b>${E(p)}</b><p class="muted">${E(r)}</p></div></div>`).join('')}
    </div>
  </div></section>

  <section class="sell-cta" data-header-theme="green"><div class="wrap" style="position:relative;z-index:1">
    <div class="eye">Valoración gratis · sin compromiso</div>
    <h2>¿Empezamos por<br>el número real?</h2>
    <p style="max-width:580px">Te decimos qué se pide en tu zona de ${E(n)}, qué se firma de verdad
    y en qué punto de esa horquilla está tu vivienda.</p>
    <div class="actions" style="justify-content:flex-start;margin-top:25px">
      <a class="btn fill" href="valuation.html?municipio=${encodeURIComponent(k)}">Valorar mi vivienda ↗</a>
      <a class="btn" href="https://wa.me/34667384965" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="eye">Otros municipios donde trabajamos</div>
    <div class="actions" style="justify-content:flex-start;margin-top:16px;flex-wrap:wrap">${otras}</div>
  </div></section>

</main>
${pie}
${scripts}
</body>
</html>
`;

  fs.writeFileSync(path.join(RAIZ, fichero), html, 'utf8');
  hechas += 1;
  console.log(`  ✓ ${fichero.padEnd(34)} ${fmt(m.eurM2)} €/m² · ${zonas.length} zonas · ${faq.length} preguntas`);
}

/* Alta en el sitemap: sin esto existen pero nadie las descubre. */
const rutaSm = path.join(RAIZ, 'sitemap.xml');
if (fs.existsSync(rutaSm)) {
  let sm = fs.readFileSync(rutaSm, 'utf8');
  for (const k of claves) {
    const f = `${SLUG[k]}.html`;
    if (sm.includes(f)) continue;
    sm = sm.replace('</urlset>',
      `  <url><loc>${DOMINIO}/${f}</loc><lastmod>${hoy}</lastmod><priority>0.9</priority></url>\n</urlset>`);
  }
  fs.writeFileSync(rutaSm, sm, 'utf8');
}

console.log(`\n${hechas} landings generadas y dadas de alta en el sitemap.`);
