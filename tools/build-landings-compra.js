#!/usr/bin/env node
/* build-landings-compra.js — Las landings de "comprar casa en <sitio>".
 *
 * POR QUÉ EXISTEN
 * ---------------
 * El barrido de Google Autocomplete del 25-ago-2026 devolvió 464 frases reales
 * del sur de Tenerife: 239 son de COMPRAR y 54 de VENDER. Se busca 4,4 veces más
 * comprar que vender, y la web no tenía ni una sola página de compra.
 *
 * NO SE COMPITE POR EL LISTADO. Con 5 propiedades en catálogo, pelear
 * "casas en venta en Arona" contra idealista es regalar el trabajo. Lo que sí
 * puede ganar Villa's es la pregunta que hay DEBAJO de esa búsqueda: cuánto se
 * paga de verdad aquí, cuánto margen hay entre lo que se pide y lo que se firma,
 * y qué se compra con el presupuesto que uno tiene. Eso sale del dato del
 * precio escriturado, que ninguna agencia de la comarca publica porque a ninguna le
 * interesa decir en voz alta que el precio de anuncio es ficción.
 *
 * POR QUÉ TAMBIÉN POR NÚCLEO Y NO SOLO POR MUNICIPIO
 * --------------------------------------------------
 * El mismo barrido: "Los Cristianos" tiene 39 frases y "Arona" 35, aunque Los
 * Cristianos SEA Arona. El Médano 16, Costa Adeje dentro de las 81 de Adeje. La
 * gente busca por el nombre del sitio, no por el término administrativo.
 *
 * NO INVENTA FISCALIDAD. Los gastos de compra se enumeran como conceptos; los
 * tipos del ITP canario no se citan aquí porque cambian y requieren verificación
 * contra fuente oficial. Esa es otra página, con su propia comprobación.
 *
 * Uso:  node tools/build-landings-compra.js
 *       node tools/build-seo.js --index --si-publicar   (después: gobierna robots/canonical)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
/* El dominio comercial, NO el de Pages: canonical, og:url y breadcrumbs. */
const DOMINIO = 'https://villasproperties.es';

const fmt = (n) => (n == null ? '—' : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
const dec = (n) => String(n).replace('.', ',');
const E = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const src = fs.readFileSync(path.join(RAIZ, 'market-data.js'), 'utf8');
const MERCADO = JSON.parse(src.match(/window\.VP_MARKET\s*=\s*(\{[\s\S]*\});/)[1]);

/* Se calca el envoltorio de una página que ya existe: mismo CSS, misma cabecera,
   mismo pie. Ni un estilo nuevo. */
const modelo = fs.readFileSync(path.join(RAIZ, 'buy.html'), 'utf8');
const scripts = (modelo.match(/<script src="[^"]+"[^>]*><\/script>/g) || []).join('');
const cssTag = (modelo.match(/<link rel="stylesheet" href="site\.css[^"]*">/) || [''])[0];
const cabecera = (modelo.match(/<header[\s\S]*?<\/header>/) || [''])[0];
const pie = (modelo.match(/<footer[\s\S]*?<\/footer>/) || [''])[0];
const skip = '<a class="skip-link" href="#contenido">Saltar al contenido</a>';

/* Los slugs de venta ya indexados, para enlazar el par vender/comprar del mismo
   sitio. Sin ese enlace cruzado Google elige una de las dos y descarta la otra. */
const SLUG_VENDER = {
  adeje: 'vender-casa-adeje',
  arona: 'vender-casa-arona',
  granadilla: 'vender-casa-granadilla-de-abona',
  'san-miguel': 'vender-casa-san-miguel-de-abona',
  'guia-isora': 'vender-casa-guia-de-isora',
  'santiago-teide': 'vender-casa-santiago-del-teide',
};

const MUNI = {
  adeje: { slug: 'comprar-casa-adeje', geo: [28.1227, -16.7261], cp: '38670',
    comarca: 'Costa suroeste',
    gancho: 'Es el municipio más caro del sur y el que más se estira entre la costa y las medianías: la zona decide más que los metros.' },
  arona: { slug: 'comprar-casa-arona', geo: [28.0997, -16.6810], cp: '38640',
    comarca: 'Costa sur',
    gancho: 'Arona firma cuatro de cada diez compraventas de la comarca. Más operaciones significa más comparables y menos margen para el precio de fantasía.' },
  granadilla: { slug: 'comprar-casa-granadilla-de-abona', geo: [28.1187, -16.5772], cp: '38600',
    comarca: 'Sureste',
    gancho: 'El Médano y el casco funcionan como dos mercados distintos dentro del mismo ayuntamiento.' },
  'san-miguel': { slug: 'comprar-casa-san-miguel-de-abona', geo: [28.0975, -16.6136], cp: '38620',
    comarca: 'Sur',
    gancho: 'Golf del Sur tira del municipio hacia arriba; el casco es de los pocos sitios del sur donde todavía se compra por debajo de la media comarcal.' },
  'guia-isora': { slug: 'comprar-casa-guia-de-isora', geo: [28.2058, -16.7797], cp: '38680',
    comarca: 'Suroeste',
    gancho: 'Es el municipio que más ha subido en doce meses de todo el sur.' },
  'santiago-teide': { slug: 'comprar-casa-santiago-del-teide', geo: [28.2939, -16.8281], cp: '38690',
    comarca: 'Oeste',
    gancho: 'Los Gigantes compite por comprador internacional; el interior, por residente. Dos precios y dos ritmos de venta.' },
};

/* Núcleos: se buscan por su nombre propio, no por el municipio al que pertenecen. */
const NUCLEOS = [
  { slug: 'comprar-casa-los-cristianos', zona: 'los-cristianos', muni: 'arona',
    geo: [28.0489, -16.7181], cp: '38650',
    gancho: 'Es el núcleo más buscado del sur de Tenerife, por delante del propio municipio de Arona al que pertenece.' },
  { slug: 'comprar-casa-costa-adeje', zona: 'costa-adeje', muni: 'adeje',
    geo: [28.0876, -16.7405], cp: '38660',
    gancho: 'Costa Adeje no es una zona de Adeje: para el comprador es un mercado propio, con su precio y su demanda.' },
  { slug: 'comprar-casa-el-medano', zona: 'el-medano', muni: 'granadilla',
    geo: [28.0453, -16.5375], cp: '38612',
    gancho: 'El Médano vive del viento y del residente todo el año, no del turismo de sol y playa. Eso cambia quién compra y para qué.' },
];

/* Presupuestos con los que la gente busca de verdad. Traducir €/m² a metros
   cuadrados es la pregunta que nadie responde: los portales enseñan casas, no
   cuánta casa entra en tu dinero. */
const PRESUPUESTOS = [200000, 300000, 450000];

const faqCompra = (n, ctx) => {
  const { anuncio, notaria, brecha, cv, cara, barata } = ctx;
  const f = [];
  if (brecha) f.push([
    `¿Cuánto se puede negociar de verdad al comprar en ${n}?`,
    `En ${n} se piden ${fmt(anuncio)} €/m² de media y ante notario se firman ${fmt(notaria)} €/m²: una distancia del ${dec(brecha)} %. No es un descuento automático —el dato de escritura mezcla costa y casco, y una casa concreta puede estar por encima o por debajo—, pero sí dice que el precio publicado en esta zona no es el precio de cierre.`,
  ]);
  if (cara && barata && cara.id !== barata.id) f.push([
    `¿Qué zona de ${n} me conviene según lo que puedo gastar?`,
    `Dentro de ${n} hay ${dec((cara.eurM2 / barata.eurM2).toFixed(2))} veces de diferencia entre ${cara.label} (${fmt(cara.eurM2)} €/m²) y ${barata.label} (${fmt(barata.eurM2)} €/m²). Con el mismo dinero se compra casi el doble de superficie cambiando de barrio dentro del mismo municipio.`,
  ]);
  if (cv) f.push([
    `¿Se vende mucho en ${n}?`,
    `El Catastro registra ${fmt(cv)} compraventas de vivienda al año en ${n}. Importa más de lo que parece: donde hay muchas operaciones hay muchos comparables, el precio es más fiable y revender más tarde es más fácil.`,
  ]);
  f.push([
    `¿Qué gastos tiene el comprador además del precio?`,
    `Además del precio: el impuesto de transmisiones (ITP) si es vivienda de segunda mano —o el IGIC y actos jurídicos documentados si es obra nueva—, la notaría, el Registro de la Propiedad, la gestoría y, si hay hipoteca, la tasación. Conviene calcularlo con números concretos antes de firmar arras, porque es la partida que descuadra las operaciones a última hora.`,
  ]);
  f.push([
    `¿Puedo comprar en ${n} si no soy residente en España?`,
    `Sí, no hay restricción para comprar. Lo que sí hace falta es NIE, una cuenta en España para los pagos y justificar el origen de los fondos ante el notario. Si además necesitas financiación, un no residente parte de una aportación propia mayor que un residente, así que conviene tenerlo hablado con el banco antes de hacer una oferta y no después.`,
  ]);
  f.push([
    `¿Cuánto tarda una compra desde la oferta hasta la firma?`,
    `Si se paga sin financiación, unas semanas. Con hipoteca de por medio, el plazo realista rara vez baja de 45 días desde las arras: por debajo de eso el riesgo no es del banco, es de perder la señal. El plazo se negocia en el contrato de arras, y es el punto donde más operaciones se caen.`,
  ]);
  f.push([
    `¿Qué conviene comprobar antes de firmar las arras?`,
    `Nota simple actualizada del Registro (titularidad y cargas), que la descripción registral coincida con la realidad y con el Catastro, que no haya obras sin legalizar, la situación urbanística del suelo, las derramas y el estado de la comunidad, y quién está al corriente del IBI. Encontrar un problema antes de firmar es una negociación; encontrarlo después es un pleito.`,
  ]);
  return f;
};

function pagina({ slug, titulo, h1a, h1b, eyebrow, lede, ctx, faq, filasZonas, tablaPie,
                  presupuestos, otras, parVender, parVenderTexto, breadcrumb, schemaCity, desc,
                  etiquetaNotaria, pieMargen }) {
  const { anuncio, notaria, brecha, cv } = ctx;
  /* Numeración corrida: si una página no lleva la tabla de presupuestos, las
     secciones siguientes no pueden saltarse un número ni repetirlo. */
  let sec = 0;
  const num = () => String(++sec).padStart(2, '0');
  /* La tabla de presupuestos se compone fuera de esta función y por eso no puede
     llamar a num(). Se le reserva su número aquí para que la numeración no repita. */
  const numPresupuestos = presupuestos ? String(sec + 3).padStart(2, '0') : null;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Service',
        serviceType: `Asesoramiento en la compra de vivienda en ${schemaCity.name}`,
        provider: { '@type': 'RealEstateAgent', name: "Villa's Properties",
          telephone: '+34667384965', email: 'info@villasproperties.es',
          address: { '@type': 'PostalAddress', streetAddress: 'Calle Mencey Anaga, 23',
            addressLocality: 'Las Chafiras', postalCode: '38639',
            addressRegion: 'Santa Cruz de Tenerife', addressCountry: 'ES' } },
        areaServed: { '@type': 'City', name: schemaCity.name,
          geo: { '@type': 'GeoCoordinates', latitude: schemaCity.geo[0], longitude: schemaCity.geo[1] } },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR',
          description: 'Primera consulta y lectura de precio de zona sin coste' } },
      { '@type': 'FAQPage', mainEntity: faq.map(([p, r]) => ({
        '@type': 'Question', name: p, acceptedAnswer: { '@type': 'Answer', text: r } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${DOMINIO}/` },
        { '@type': 'ListItem', position: 2, name: 'Comprar', item: `${DOMINIO}/buy.html` },
        { '@type': 'ListItem', position: 3, name: breadcrumb } ] },
    ],
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${E(titulo)}</title>
<meta name="description" content="${E(desc)}">
<link rel="canonical" href="${DOMINIO}/${slug}.html">
<meta property="og:type" content="website">
<meta property="og:title" content="${E(titulo)}">
<meta property="og:description" content="${E(desc)}">
<meta property="og:url" content="${DOMINIO}/${slug}.html">
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
    <div class="eye">${E(eyebrow)}</div>
    <h1>${E(h1a)}<br>${E(h1b)}</h1>
    <p class="pagelede">${lede}</p>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="head" data-reveal><div class="eye">${num()} · El margen real</div>
    <div><h2>Lo que se pide<br>y lo que se firma.</h2></div></div>
    <div class="bankcifras">
      <div><strong>${fmt(anuncio)} €/m²</strong><small>lo que se pide · idealista ${E(MERCADO.meta.dates.idealista)}</small></div>
      ${notaria ? `<div><strong>${fmt(notaria)} €/m²</strong><small>${E(etiquetaNotaria)}</small></div>` : ''}
      ${brecha ? `<div><strong>${dec(brecha)} %</strong><small>distancia entre pedir y firmar</small></div>` : ''}
      ${cv ? `<div><strong>${fmt(cv)}</strong><small>compraventas al año · Catastro ${E(MERCADO.meta.dates.catastro)}</small></div>` : ''}
    </div>
    <p class="bankpie">${pieMargen}</p>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="head" data-reveal><div class="eye">${num()} · Zonas</div>
    <div><h2>Dónde entra<br>tu presupuesto.</h2>
    <p class="muted">${tablaPie}</p></div></div>
    <table class="post-table"><thead><tr><th>Zona</th><th>€/m² de anuncio</th><th>12 meses</th></tr></thead>
    <tbody>${filasZonas}</tbody></table>
    <p class="bankpie">Fuente: idealista, ${E(MERCADO.meta.dates.idealista)}. Precio de anuncio, no de cierre.</p>
  </div></section>

  ${presupuestos ? presupuestos.replace('${n0}', numPresupuestos) : ''}

  <section class="section tight"><div class="wrap">
    <div class="head" data-reveal><div class="eye">${presupuestos ? String(sec + 2).padStart(2,'0') : num()} · Preguntas</div>
    <div><h2>Lo que preguntan<br>los que compran aquí.</h2></div></div>
    <div class="feature-list">
      ${faq.map(([p, r], i) => `<div class="feature-row"><b>${String(i + 1).padStart(2, '0')}</b>`
        + `<div><b>${E(p)}</b><p class="muted">${E(r)}</p></div></div>`).join('')}
    </div>
  </div></section>

  <section class="sell-cta" data-header-theme="green"><div class="wrap" style="position:relative;z-index:1">
    <div class="eye">Sin llamadas automáticas</div>
    <h2>¿Te decimos si<br>ese precio se sostiene?</h2>
    <p style="max-width:580px">Mándanos el anuncio que estás mirando y te contamos qué se está
    firmando de verdad en esa zona, qué margen hay y qué comprobar antes de firmar arras.</p>
    <div class="actions" style="justify-content:flex-start;margin-top:25px">
      <a class="btn fill" href="https://wa.me/34667384965" target="_blank" rel="noopener">Mandar el anuncio ↗</a>
      <a class="btn" href="properties.html">Ver propiedades</a>
    </div>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="eye">Seguir mirando</div>
    <div class="actions" style="justify-content:flex-start;margin-top:16px;flex-wrap:wrap">${otras}</div>
    <p class="muted" style="margin-top:26px">${parVenderTexto} <a href="${parVender}.html">${E(breadcrumb.replace('Comprar', 'Vender'))}</a>.</p>
  </div></section>

</main>
${pie}
${scripts}
</body>
</html>
`;
}

const tablaPresupuestos = (zonas, nombre) => {
  if (!zonas.length) return '';
  const filas = zonas.map((z) => `<tr><td>${E(z.label)}</td>`
    + PRESUPUESTOS.map((p) => `<td>${Math.round(p / z.eurM2)} m²</td>`).join('') + '</tr>').join('');
  return `<section class="section tight"><div class="wrap">
    <div class="head" data-reveal><div class="eye">${'$'}{n0} · Cuánta casa entra</div>
    <div><h2>Qué compras<br>con tu presupuesto.</h2>
    <p class="muted">Superficie aproximada al precio de anuncio de cada zona de ${E(nombre)}.
    Es una regla de tres, no una tasación: sirve para descartar zonas antes de perder fines de semana viéndolas.</p></div></div>
    <table class="post-table"><thead><tr><th>Zona</th>${PRESUPUESTOS.map((p) => `<th>${fmt(p)} €</th>`).join('')}</tr></thead>
    <tbody>${filas}</tbody></table>
  </div></section>`;
};

const filasDe = (zonas) => zonas.map((z) => `<tr><td>${E(z.label)}</td><td>${fmt(z.eurM2)} €/m²</td>`
  + `<td>${z.var1a != null ? (z.var1a > 0 ? '+' : '') + dec(z.var1a) + ' %' : '—'}</td></tr>`).join('');

let hechas = 0;
const enlacesMuni = Object.entries(MUNI).map(([k, c]) =>
  `<a class="btn" href="${c.slug}.html">${E(MERCADO.municipios[k].name)}</a>`);
const enlacesNucleo = NUCLEOS.map((nu) => {
  const z = (MERCADO.municipios[nu.muni].zonas || []).find((x) => x.id === nu.zona);
  return `<a class="btn" href="${nu.slug}.html">${E(z ? z.label : nu.zona)}</a>`;
});

/* ---------- municipios ---------- */
for (const [k, cfg] of Object.entries(MUNI)) {
  const m = MERCADO.municipios[k];
  if (!m) { console.log(`  ⚠ sin datos de mercado: ${k}`); continue; }
  const n = m.name;
  const brecha = m.notaria ? ((m.eurM2 - m.notaria) / m.eurM2 * 100).toFixed(1) : null;
  const zonas = (m.zonas || []).slice().sort((a, b) => b.eurM2 - a.eurM2);
  const ctx = { anuncio: m.eurM2, notaria: m.notaria, brecha, cv: m.catastroCV,
    cara: zonas[0], barata: zonas[zonas.length - 1] };

  const otras = enlacesMuni.filter((_, i) => Object.keys(MUNI)[i] !== k).concat(enlacesNucleo).join('');
  const titulo = `Comprar casa en ${n}: precios por zona y margen real | Villa’s Properties`;
  const desc = `Qué cuesta comprar en ${n}: ${fmt(m.eurM2)} €/m² de anuncio`
    + (m.notaria ? ` frente a ${fmt(m.notaria)} €/m² de escritura` : '')
    + `. Precio zona a zona, cuánta superficie entra en tu presupuesto y qué comprobar antes de firmar.`;

  const html = pagina({
    slug: cfg.slug, titulo, desc,
    eyebrow: `${n.toUpperCase()} · ${cfg.comarca}`,
    h1a: `Comprar casa en ${n}:`, h1b: 'lo que se pide y lo que se firma.',
    lede: `En ${E(n)} se piden <strong>${fmt(m.eurM2)} €/m²</strong> de media`
      + (m.notaria ? ` y ante notario se firman <strong>${fmt(m.notaria)} €/m²</strong>` : '')
      + `. ${E(cfg.gancho)}`,
    ctx, faq: faqCompra(n, ctx), filasZonas: filasDe(zonas),
    tablaPie: ctx.cara && ctx.barata && ctx.cara.id !== ctx.barata.id
      ? `Entre ${E(ctx.cara.label)} y ${E(ctx.barata.label)} hay ${dec((ctx.cara.eurM2 / ctx.barata.eurM2).toFixed(2))} veces de diferencia. La media municipal no describe ninguna casa concreta.`
      : 'La media municipal no describe ninguna casa concreta.',
    presupuestos: tablaPresupuestos(zonas, n),
    etiquetaNotaria: 'lo que se firma · escriturado',
    pieMargen: `El precio de escritura es la media de TODAS las compraventas del municipio, casco y costa incluidos. No es el descuento que vas a conseguir en una casa concreta: es la prueba de que en ${E(n)} el precio publicado y el precio de cierre no son lo mismo.`,
    otras, parVender: SLUG_VENDER[k],
    parVenderTexto: `¿Estás del otro lado y lo que quieres es vender?`,
    breadcrumb: `Comprar casa en ${n}`,
    schemaCity: { name: n, geo: cfg.geo },
  });
  fs.writeFileSync(path.join(RAIZ, `${cfg.slug}.html`), html, 'utf8');
  hechas += 1;
  console.log(`  ✓ ${(cfg.slug + '.html').padEnd(38)} ${fmt(m.eurM2)} €/m² · ${zonas.length} zonas · ${faqCompra(n, ctx).length} preguntas`);
}

/* ---------- núcleos ---------- */
for (const nu of NUCLEOS) {
  const m = MERCADO.municipios[nu.muni];
  const z = (m.zonas || []).find((x) => x.id === nu.zona);
  if (!z) { console.log(`  ⚠ zona no encontrada: ${nu.zona}`); continue; }
  const n = z.label;
  /* El €/m² de escritura se publica por municipio, no por núcleo: se cita como
     lo que es —la referencia del municipio— y no como si fuera del barrio. */
  /* 🔴 NO se publica un % de brecha en las páginas de núcleo. Restar el €/m² de
     escritura del MUNICIPIO al €/m² de anuncio de una zona cara da un número
     enorme y falso: mide la distancia entre un barrio caro y la media municipal,
     no el margen de negociación del barrio. Se dan las dos cifras etiquetadas y
     se explica la relación en la FAQ. */
  const hermanas = (m.zonas || []).slice().sort((a, b) => b.eurM2 - a.eurM2);
  const ctx = { anuncio: z.eurM2, notaria: m.notaria, brecha: null, cv: null,
    cara: hermanas[0], barata: hermanas[hermanas.length - 1] };

  const faq = [
    [`¿Cuánto cuesta comprar en ${n}?`,
     `${n} se mueve en el entorno de ${fmt(z.eurM2)} €/m² de precio de anuncio`
     + (z.var1a != null ? `, con una variación del ${dec(z.var1a)} % en los últimos doce meses` : '')
     + `. Dentro del mismo núcleo la planta, las vistas y la terraza mueven el precio más que los metros.`],
    ...(m.notaria ? [[
      `¿Se firma por debajo de lo que se pide en ${n}?`,
      `En ${m.name}, el municipio al que pertenece ${n}, se firman ante notario ${fmt(m.notaria)} €/m² de media frente a los ${fmt(z.eurM2)} €/m² que se piden en ${n}. Esa referencia es municipal y mezcla costa y casco, así que en ${n} —que está por encima de la media— el margen real es menor, pero existe.`,
    ]] : []),
    ...faqCompra(n, { ...ctx, brecha: null }).filter(([p]) => !p.startsWith('¿Cuánto se puede negociar')),
  ];

  const otras = enlacesMuni.concat(enlacesNucleo.filter((h) => !h.includes(nu.slug))).join('');
  const titulo = `Comprar casa en ${n}: precios reales y qué comprobar | Villa’s Properties`;
  const desc = `Qué cuesta comprar en ${n}: ${fmt(z.eurM2)} €/m² de anuncio`
    + (m.notaria ? ` y ${fmt(m.notaria)} €/m² de escritura en ${m.name}` : '')
    + `. Comparativa con el resto de zonas, superficie por presupuesto y checklist antes de las arras.`;

  const html = pagina({
    slug: nu.slug, titulo, desc,
    eyebrow: `${n.toUpperCase()} · ${m.name}`,
    h1a: `Comprar casa en ${n}:`, h1b: 'el precio real, no el del anuncio.',
    lede: `En ${E(n)} se piden <strong>${fmt(z.eurM2)} €/m²</strong>`
      + (m.notaria ? ` y en ${E(m.name)} se firman ante notario <strong>${fmt(m.notaria)} €/m²</strong> de media` : '')
      + `. ${E(nu.gancho)}`,
    ctx, faq, filasZonas: filasDe(hermanas),
    tablaPie: `${E(n)} dentro de ${E(m.name)}: así queda frente a las demás zonas del municipio.`,
    presupuestos: tablaPresupuestos(hermanas, m.name),
    etiquetaNotaria: `media de ${m.name} · escriturado`,
    pieMargen: `Las dos cifras no son comparables sin más: los ${fmt(z.eurM2)} €/m² son lo que se pide en ${E(n)}, y los ${fmt(m.notaria)} €/m² son la media de escritura de TODO ${E(m.name)}, casco incluido. ${E(n)} está por encima de esa media, así que el margen real aquí es menor que la resta —pero el precio de anuncio sigue sin ser el de cierre.`,
    otras, parVender: SLUG_VENDER[nu.muni],
    parVenderTexto: `¿Lo que quieres es vender en ${E(m.name)}?`,
    breadcrumb: `Comprar casa en ${n}`,
    schemaCity: { name: n, geo: nu.geo },
  });
  fs.writeFileSync(path.join(RAIZ, `${nu.slug}.html`), html, 'utf8');
  hechas += 1;
  console.log(`  ✓ ${(nu.slug + '.html').padEnd(38)} ${fmt(z.eurM2)} €/m² · ${n} (${m.name}) · ${faq.length} preguntas`);
}

console.log(`\n[compra] ${hechas} landings generadas.`);
console.log('[compra] Ahora: node tools/build-seo.js --index --si-publicar   (canonical, robots y sitemap)');
