#!/usr/bin/env node
/**
 * Página «Las playas del sur, ahora»: cámaras públicas de SkylineWebcams.
 *
 *   node tools/build-webcams.js
 *
 * Escribe webcams-playas-tenerife-sur.html (es) y <idioma>/webcams.html (de, en, fr, it, nl).
 *
 * CONDICIONES DE SKYLINEWEBCAMS (terms-of-use, leídas el 16-nov-2026): se puede insertar una
 * cámara en una web propia «using the code provided by the "Embed" function, without modifying
 * it». Ese código es exactamente:  <a href="URL" target="_blank"><img src="IMG" alt="TÍTULO"></a>
 * Por eso embed() no añade atributos (ni loading, ni rel, ni clases): el tamaño se da por CSS.
 * Lo que se inserta es una imagen que ellos renuevan cada 2 minutos; el vídeo en directo solo
 * puede emitirlo en otra web el dueño de la cámara. No copiar ni alojar las imágenes.
 *
 * Skyline no tiene versión en neerlandés: la página nl enlaza a la inglesa.
 * Clima: AEMET, estación Tenerife Sur Aeropuerto, valores normales 1981-2010.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://villasproperties.es/';
const CAMS = JSON.parse(fs.readFileSync(path.join(__dirname, 'webcams.json'), 'utf8'));
const SKY = 'https://www.skylinewebcams.com';
const RUTA = 'webcam/espana/canarias/santa-cruz-de-tenerife';
const ES = 'webcams-playas-tenerife-sur.html';
const WA = 'https://wa.me/34667384965';

const T = {
  es: {
    sky: 'es', title: 'Webcams de las playas del sur de Tenerife, ahora',
    desc: '14 cámaras públicas de las playas del sur de Tenerife: Costa Adeje, Los Cristianos, El Médano y Los Gigantes. Así está el tiempo ahora mismo.',
    eye: 'AHORA MISMO · SUR DE TENERIFE', h1: 'Así están ahora<br>las playas del sur.',
    lede: 'Catorce cámaras públicas, de Los Gigantes a El Médano. Cada imagen se renueva cada dos minutos: recarga la página para ver la última, o pulsa una cámara para ver el vídeo en directo.',
    credito: 'Imágenes de <a href="' + SKY + '/es.html" target="_blank" rel="noopener">SkylineWebcams</a>. Al pulsar una imagen sales a su web.',
    climaEye: 'El clima, en cifras', climaH: 'No es un día<br>de suerte.',
    c1: 'máxima media en enero', c2: 'mínima media en enero', c3: 'horas de sol al año', c4: 'días de lluvia al año',
    fuente: 'Fuente: AEMET, estación Tenerife Sur Aeropuerto, valores normales 1981-2010.',
    mesH: 'Mes a mes', mMes: 'Mes', mMax: 'Máxima °C', mMin: 'Mínima °C', mSol: 'Horas de sol', mLluvia: 'Días de lluvia', mNota: 'Medias diarias de cada mes. Día de lluvia: 1 mm o más.',
    ctaEye: 'Vivir aquí', ctaH: 'Viviendas en venta<br>cerca de estas playas.',
    ctaP: 'Si lo que ves te gusta, mira qué hay en venta en el sur. Te respondemos por escrito, sin llamadas automáticas.',
    b1: 'Ver viviendas', b1href: 'properties.html', b2: 'Escribir por WhatsApp ↗',
  },
  nl: {
    sky: 'en', title: 'Webcams stranden Zuid-Tenerife: zo is het nu',
    desc: '14 openbare webcams van de stranden in het zuiden van Tenerife: Costa Adeje, Los Cristianos, El Médano en Los Gigantes. Zo is het weer op dit moment.',
    eye: 'OP DIT MOMENT · ZUID-TENERIFE', h1: 'Zo ziet het er nu uit<br>op de stranden in het zuiden.',
    lede: 'Veertien openbare webcams, van Los Gigantes tot El Médano. Elk beeld wordt om de twee minuten vernieuwd: herlaad de pagina voor het laatste beeld, of klik op een camera voor de live video.',
    credito: 'Beelden van <a href="' + SKY + '/en.html" target="_blank" rel="noopener">SkylineWebcams</a> (website in het Engels). Een klik op een beeld brengt u naar hun site.',
    climaEye: 'Het klimaat in cijfers', climaH: 'Geen toevallig<br>mooie dag.',
    c1: 'gemiddelde maximumtemperatuur in januari', c2: 'gemiddelde minimumtemperatuur in januari', c3: 'uren zon per jaar', c4: 'regendagen per jaar',
    fuente: 'Bron: AEMET, weerstation Tenerife Sur Aeropuerto, normalen 1981-2010.',
    mesH: 'Maand per maand', mMes: 'Maand', mMax: 'Maximum °C', mMin: 'Minimum °C', mSol: 'Uren zon', mLluvia: 'Regendagen', mNota: 'Daggemiddelden per maand. Regendag: 1 mm of meer.',
    ctaEye: 'Hier wonen', ctaH: 'Woningen te koop<br>bij deze stranden.',
    ctaP: 'Bevalt wat u ziet? Bekijk wat er in het zuiden te koop staat. Wij antwoorden schriftelijk in het Nederlands.',
    b1: 'Bekijk onze woningen', b1href: 'woningen.html', b2: 'Stel uw vraag via WhatsApp ↗',
  },
  de: {
    sky: 'de', title: 'Webcams Strände Teneriffa Süd: so sieht es jetzt aus',
    desc: '14 öffentliche Webcams der Strände im Süden Teneriffas: Costa Adeje, Los Cristianos, El Médano und Los Gigantes. So ist das Wetter in diesem Moment.',
    eye: 'IN DIESEM MOMENT · TENERIFFA SÜD', h1: 'So sieht es jetzt aus<br>an den Stränden im Süden.',
    lede: 'Vierzehn öffentliche Webcams, von Los Gigantes bis El Médano. Jedes Bild wird alle zwei Minuten erneuert: Laden Sie die Seite neu, um das aktuelle Bild zu sehen, oder klicken Sie auf eine Kamera für das Live-Video.',
    credito: 'Bilder von <a href="' + SKY + '/de.html" target="_blank" rel="noopener">SkylineWebcams</a>. Ein Klick auf ein Bild führt Sie auf deren Website.',
    climaEye: 'Das Klima in Zahlen', climaH: 'Kein zufällig<br>schöner Tag.',
    c1: 'mittlere Höchsttemperatur im Januar', c2: 'mittlere Tiefsttemperatur im Januar', c3: 'Sonnenstunden pro Jahr', c4: 'Regentage pro Jahr',
    fuente: 'Quelle: AEMET, Wetterstation Tenerife Sur Aeropuerto, Normalwerte 1981-2010.',
    mesH: 'Monat für Monat', mMes: 'Monat', mMax: 'Max. °C', mMin: 'Min. °C', mSol: 'Sonnen&shy;stunden', mLluvia: 'Regen&shy;tage', mNota: 'Tagesmittel je Monat. Regentag: 1 mm oder mehr.',
    ctaEye: 'Hier wohnen', ctaH: 'Immobilien zum Kauf<br>in der Nähe dieser Strände.',
    ctaP: 'Gefällt Ihnen, was Sie sehen? Schauen Sie, was im Süden zum Verkauf steht. Wir antworten Ihnen schriftlich auf Deutsch.',
    b1: 'Unsere Immobilien ansehen', b1href: 'immobilien.html', b2: 'Frage per WhatsApp stellen ↗',
  },
  fr: {
    sky: 'fr', title: 'Webcams des plages du sud de Tenerife, en ce moment',
    desc: '14 webcams publiques des plages du sud de Tenerife : Costa Adeje, Los Cristianos, El Médano et Los Gigantes. Le temps qu’il fait en ce moment.',
    eye: 'EN CE MOMENT · SUD DE TENERIFE', h1: 'Les plages du sud,<br>en ce moment.',
    lede: 'Quatorze webcams publiques, de Los Gigantes à El Médano. Chaque image est renouvelée toutes les deux minutes : rechargez la page pour voir la dernière, ou cliquez sur une caméra pour la vidéo en direct.',
    credito: 'Images de <a href="' + SKY + '/fr.html" target="_blank" rel="noopener">SkylineWebcams</a>. Un clic sur une image vous amène sur leur site.',
    climaEye: 'Le climat en chiffres', climaH: 'Ce n’est pas<br>un jour de chance.',
    c1: 'température maximale moyenne en janvier', c2: 'température minimale moyenne en janvier', c3: 'heures de soleil par an', c4: 'jours de pluie par an',
    fuente: 'Source : AEMET, station Tenerife Sur Aeropuerto, normales 1981-2010.',
    mesH: 'Mois par mois', mMes: 'Mois', mMax: 'Maximale °C', mMin: 'Minimale °C', mSol: 'Heures de soleil', mLluvia: 'Jours de pluie', mNota: 'Moyennes journalières de chaque mois. Jour de pluie : 1 mm ou plus.',
    ctaEye: 'Vivre ici', ctaH: 'Biens à vendre<br>près de ces plages.',
    ctaP: 'Ce que vous voyez vous plaît ? Regardez ce qui est à vendre dans le sud. Nous vous répondons par écrit, en français.',
    b1: 'Voir nos biens', b1href: 'biens.html', b2: 'Poser une question par WhatsApp ↗',
  },
  it: {
    sky: 'it', title: 'Webcam delle spiagge del sud di Tenerife, adesso',
    desc: '14 webcam pubbliche delle spiagge del sud di Tenerife: Costa Adeje, Los Cristianos, El Médano e Los Gigantes. Che tempo fa in questo momento.',
    eye: 'IN QUESTO MOMENTO · SUD DI TENERIFE', h1: 'Le spiagge del sud,<br>in questo momento.',
    lede: 'Quattordici webcam pubbliche, da Los Gigantes a El Médano. Ogni immagine si rinnova ogni due minuti: ricarichi la pagina per vedere l’ultima, oppure clicchi su una webcam per il video in diretta.',
    credito: 'Immagini di <a href="' + SKY + '/it.html" target="_blank" rel="noopener">SkylineWebcams</a>. Cliccando su un’immagine si apre il loro sito.',
    climaEye: 'Il clima in cifre', climaH: 'Non è un giorno<br>fortunato.',
    c1: 'temperatura massima media a gennaio', c2: 'temperatura minima media a gennaio', c3: 'ore di sole all’anno', c4: 'giorni di pioggia all’anno',
    fuente: 'Fonte: AEMET, stazione Tenerife Sur Aeropuerto, valori normali 1981-2010.',
    mesH: 'Mese per mese', mMes: 'Mese', mMax: 'Massima °C', mMin: 'Minima °C', mSol: 'Ore di sole', mLluvia: 'Giorni di pioggia', mNota: 'Medie giornaliere di ogni mese. Giorno di pioggia: 1 mm o più.',
    ctaEye: 'Vivere qui', ctaH: 'Immobili in vendita<br>vicino a queste spiagge.',
    ctaP: 'Le piace quello che vede? Guardi cosa c’è in vendita nel sud. Le rispondiamo per iscritto, in italiano.',
    b1: 'Vedi i nostri immobili', b1href: 'immobili.html', b2: 'Scriva su WhatsApp ↗',
  },
  en: {
    sky: 'en', title: 'South Tenerife beach webcams: what it looks like now',
    desc: '14 public webcams of the beaches in the south of Tenerife: Costa Adeje, Los Cristianos, El Médano and Los Gigantes. The weather right now.',
    eye: 'RIGHT NOW · SOUTH TENERIFE', h1: 'The southern beaches,<br>right now.',
    lede: 'Fourteen public webcams, from Los Gigantes to El Médano. Each image is renewed every two minutes: reload the page for the latest one, or click a camera for the live video.',
    credito: 'Images by <a href="' + SKY + '/en.html" target="_blank" rel="noopener">SkylineWebcams</a>. Clicking an image takes you to their site.',
    climaEye: 'The climate in figures', climaH: 'Not just<br>a lucky day.',
    c1: 'average high in January', c2: 'average low in January', c3: 'hours of sunshine a year', c4: 'rainy days a year',
    fuente: 'Source: AEMET, Tenerife Sur Aeropuerto station, 1981-2010 normals.',
    mesH: 'Month by month', mMes: 'Month', mMax: 'High °C', mMin: 'Low °C', mSol: 'Hours of sunshine', mLluvia: 'Rainy days', mNota: 'Daily averages for each month. Rainy day: 1 mm or more.',
    ctaEye: 'Living here', ctaH: 'Homes for sale<br>near these beaches.',
    ctaP: 'Like what you see? Have a look at what is for sale in the south. We answer in writing, in English.',
    b1: 'See our properties', b1href: '../properties.html', b2: 'Ask us on WhatsApp ↗',
  },
};

// AEMET, Tenerife Sur Aeropuerto, normales 1981-2010: [máxima, mínima, horas de sol, días de lluvia ≥ 1 mm].
const MESES = [[21.7, 15.2, 193, 1.8], [22.0, 15.0, 195, 2.2], [23.1, 15.6, 226, 1.9], [23.1, 16.0, 219, 1.1],
  [23.9, 17.0, 246, 0.3], [25.4, 18.8, 259, 0.0], [27.7, 20.2, 295, 0.0], [28.4, 21.1, 277, 0.2],
  [27.9, 21.1, 213, 0.6], [26.8, 20.0, 214, 1.6], [24.8, 18.2, 193, 1.9], [22.8, 16.5, 195, 3.5]];
const ESCALA = [10, 30]; // °C que abarca la barra de temperaturas
const dec = (lang, n) => n.toFixed(1).replace('.', lang === 'en' ? '.' : ',');
const pct = (n) => (((n - ESCALA[0]) / (ESCALA[1] - ESCALA[0])) * 100).toFixed(1);

function tablaClima(lang) {
  const t = T[lang];
  const mes = new Intl.DateTimeFormat(lang, { month: 'long', timeZone: 'UTC' });
  const filas = MESES.map(([max, min, sol, lluvia], i) => {
    const nombre = mes.format(new Date(Date.UTC(2026, i, 1)));
    return `<tr><th scope="row">${nombre[0].toUpperCase() + nombre.slice(1)}</th><td>${dec(lang, max)}<span class="u"> °C</span></td><td>${dec(lang, min)}<span class="u"> °C</span></td><td class="climabar" aria-hidden="true"><span style="left:${pct(min)}%;width:${(pct(max) - pct(min)).toFixed(1)}%"></span></td><td>${sol}</td><td>${dec(lang, lluvia)}</td></tr>`;
  }).join('\n');
  return `<h3 class="camzona">${t.mesH}</h3>
<div class="climawrap"><table class="clima">
<thead><tr><th scope="col">${t.mMes}</th><th scope="col">${t.mMax}</th><th scope="col">${t.mMin}</th><th aria-hidden="true"></th><th scope="col">${t.mSol}</th><th scope="col">${t.mLluvia}</th></tr></thead>
<tbody>
${filas}
</tbody></table></div>
<p class="bankpie">${t.mNota} ${t.fuente}</p>`;
}

const cifra = (lang, n) => (lang === 'en' ? (n === '2.725' ? '2,725' : n.replace(',', '.')) : n);
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// El código de «Embed» de SkylineWebcams, tal cual. No añadir atributos.
function embed(cam, sky) {
  const url = `${SKY}/${sky}/${RUTA}/${cam.slug}.html`;
  return `<a href="${url}" target="_blank"><img src="https://embed.skylinewebcams.com/img/${cam.id}.jpg" alt="${attr(cam.titulos[sky])}"></a>`;
}

const CSS = `<style>
.camzona{margin:44px 0 14px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.camgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}
.cam{margin:0}
.cam a{display:block;aspect-ratio:16/9;background:#e9ece9;overflow:hidden;border-radius:4px}
.cam img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.cam a:hover img,.cam a:focus-visible img{transform:scale(1.03)}
.cam figcaption{margin-top:8px;font-size:15px}
.vcgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:28px 18px}
.vc{display:block;color:inherit;text-decoration:none}
.vc img{display:block;width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;border-radius:4px;background:#e9ece9}
.vc-zona{display:block;margin-top:12px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.vc strong{display:block;margin-top:6px;font-size:17px;font-weight:500;line-height:1.3}
.vc-precio{display:block;margin-top:8px;font-size:22px;letter-spacing:-.02em}
.vc:hover strong,.vc:focus-visible strong{text-decoration:underline}
.climawrap{overflow-x:auto}
.clima{width:100%;border-collapse:collapse;font-size:15px;font-variant-numeric:tabular-nums}
.clima th,.clima td{padding:11px 14px 11px 0;text-align:right;border-bottom:1px solid rgba(0,0,0,.1);white-space:nowrap}
.clima th:first-child{text-align:left;font-weight:500}
.clima thead th{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:400}
.clima .climabar{width:34%;min-width:120px;position:relative;padding:0}
.clima .climabar span{position:absolute;top:50%;height:8px;margin-top:-4px;border-radius:4px;background:linear-gradient(90deg,#7fb3c8,#e8a04c)}
@media (max-width:640px){.clima .climabar,.clima thead th:nth-child(4){display:none}.clima{font-size:14px}.clima th,.clima td{padding-right:8px}.clima td:last-child,.clima th:last-child{padding-right:0}.clima thead th{white-space:normal;letter-spacing:.06em;font-size:10px;vertical-align:bottom}}
@media (max-width:400px){.clima .u{display:none}.clima{font-size:13px}.clima th,.clima td{padding-right:6px}}
@media (prefers-reduced-motion:reduce){.cam img{transition:none}}
</style>`;

const utm = (lang) => `utm_source=web&amp;utm_medium=webcams&amp;utm_campaign=webcams_${lang}`;
const LISTADO = { nl: 'woningen.html', de: 'immobilien.html', fr: 'biens.html', it: 'immobili.html' };

// Viviendas en venta. En nl/de/fr/it salen del listado ya traducido de ese idioma (misma foto,
// título y precio que allí); en es y en, de properties-data.js, con enlace a la ficha en español.
function viviendas(lang) {
  if (LISTADO[lang]) {
    const h = fs.readFileSync(path.join(ROOT, lang, LISTADO[lang]), 'utf8');
    const arts = h.match(/<article class="property vl-item"[\s\S]*?<\/article>/g) || [];
    if (!arts.length) throw new Error(`[webcams] ${lang}: ${LISTADO[lang]} no tiene viviendas`);
    return arts.map((a) => {
      const g = (re) => { const m = a.match(re); if (!m) throw new Error(`[webcams] ${lang}: tarjeta sin ${re}`); return m[1]; };
      return { href: `${LISTADO[lang]}?${utm(lang)}#${g(/ id="([^"]+)"/)}`, img: g(/<img src="([^"]+)"/), titulo: g(/<h3>([\s\S]*?)<\/h3>/), zona: g(/<div class="meta">([\s\S]*?)<\/div>/), precio: g(/<div class="price">([\s\S]*?)<\/div>/) };
    });
  }
  const w = {};
  require('vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'properties-data.js'), 'utf8'), { window: w });
  const pre = lang === 'es' ? '' : '../';
  return w.VP_PROPERTIES.filter((p) => p.status === 'En venta').map((p) => ({
    href: `${pre}vivienda-${p.slug}.html?${utm(lang)}`, hreflang: lang !== 'es', img: pre + p.images[0],
    titulo: p.title, zona: `${p.zone} · ${p.town}`, precio: `${p.price.toLocaleString('es-ES')} €`,
  }));
}

function cuerpo(lang) {
  const t = T[lang];
  const zonas = [...new Set(CAMS.map((c) => c.zona))];
  const rejilla = zonas.map((z) => `<h3 class="camzona">${z}</h3>
<div class="camgrid">${CAMS.filter((c) => c.zona === z).map((c) => `<figure class="cam">${embed(c, t.sky)}<figcaption>${c.nombre}</figcaption></figure>`).join('')}</div>`).join('\n');
  return `${CSS}
<section class="pagehero"><div class="wrap"><div class="eye">${t.eye}</div><h1>${t.h1}</h1><p class="pagelede">${t.lede}</p></div></section>
<section class="section tight"><div class="wrap">
${rejilla}
<p class="bankpie" style="margin-top:28px">${t.credito}</p>
</div></section>
<section class="section tight"><div class="wrap">
<div class="head"><div class="eye">${t.climaEye}</div><div><h2>${t.climaH}</h2></div></div>
<div class="bankcifras">
<div><strong>${cifra(lang, '21,7')} °C</strong><small>${t.c1}</small></div>
<div><strong>${cifra(lang, '15,2')} °C</strong><small>${t.c2}</small></div>
<div><strong>${cifra(lang, '2.725')}</strong><small>${t.c3}</small></div>
<div><strong>15</strong><small>${t.c4}</small></div>
</div>
${tablaClima(lang)}
</div></section>
<section class="section tight" id="viviendas"><div class="wrap">
<div class="head"><div class="eye">${t.ctaEye}</div><div><h2>${t.ctaH}</h2><p class="muted">${t.ctaP}</p></div></div>
<div class="vcgrid">${viviendas(lang).map((v) => `<a class="vc" href="${v.href}"${v.hreflang ? ' hreflang="es"' : ''}><img src="${v.img}" alt="" loading="lazy" decoding="async" width="1200" height="800"><span class="vc-zona">${v.zona}</span><strong>${v.titulo}</strong><span class="vc-precio">${v.precio}</span></a>`).join('')}</div>
<div class="actions" style="justify-content:flex-start;margin-top:32px"><a class="btn fill" href="${t.b1href}?${utm(lang)}">${t.b1}</a><a class="btn" href="${WA}" target="_blank" rel="noopener">${t.b2}</a></div>
</div></section>`;
}

const IDIOMAS = ['de', 'en', 'fr', 'it', 'nl'];
const alternates = () => [`<link rel="alternate" hreflang="es" href="${BASE}${ES}">`]
  .concat(IDIOMAS.map((l) => `<link rel="alternate" hreflang="${l}" href="${BASE}${l}/webcams.html">`)).join('');

// Misma política de seguridad que la portada (las imágenes https ya están permitidas).
const CSP = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/<meta http-equiv="Content-Security-Policy"[^>]*>/) || [''])[0];

function paginaEs() {
  const t = T.es;
  const url = BASE + ES;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t.title}</title>
${CSP}
<link rel="stylesheet" href="site.css?v=202610271905">
<!-- seo:start -->
<meta name="description" content="${attr(t.desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#5f8075">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Villa's Properties">
<meta property="og:locale" content="es_ES">
<meta property="og:title" content="${attr(t.title)}">
<meta property="og:description" content="${attr(t.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}assets/brand/tenerife-mercado.webp">
<meta name="twitter:card" content="summary_large_image">
<link rel="manifest" href="site.webmanifest">
<!-- seo:end -->
${alternates()}
</head>
<body>
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="header solid"></header>
<main id="contenido">
${cuerpo('es')}
</main>
<footer class="footer"></footer>
<script src="vp-safe.js?v=202610271905" defer></script><script src="vp-lead.js?v=202610271905" defer></script><script src="vp-consent.js?v=202610271905" defer></script><script src="shell.js?v=202610271905" defer></script><script src="app.js?v=202610271905" defer></script><script src="motion.js?v=202610271905" defer></script>
</body>
</html>
`;
}

// Las páginas de idioma heredan cabecera, pie y CSP de <idioma>/guia-comprador.html.
function paginaIdioma(lang) {
  const t = T[lang];
  let h = fs.readFileSync(path.join(ROOT, lang, 'guia-comprador.html'), 'utf8');
  const una = (re, por) => {
    if (!re.test(h)) throw new Error(`[webcams] ${lang}: la plantilla no tiene ${re}`);
    h = h.replace(re, por);
  };
  h = h.split('guia-comprador.html').join('webcams.html');
  una(/<title>[^<]*<\/title>/, `<title>${t.title} | Villa's Properties</title>`);
  una(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${attr(t.desc)}">`);
  una(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${attr(t.title)}">`);
  una(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${attr(t.desc)}">`);
  una(/<meta property="og:type" content="article">/, '<meta property="og:type" content="website">');
  una(/(<link rel="alternate" hreflang=)/, `<link rel="alternate" hreflang="es" href="${BASE}${ES}">$1`);
  una(/<main id="contenido">[\s\S]*<\/main>/, `<main id="contenido">\n${cuerpo(lang)}\n</main>`);
  return h;
}

function main() {
  fs.writeFileSync(path.join(ROOT, ES), paginaEs());
  for (const l of IDIOMAS) fs.writeFileSync(path.join(ROOT, l, 'webcams.html'), paginaIdioma(l));
  console.log(`[webcams] ${CAMS.length} cámaras · ${ES} + ${IDIOMAS.map((l) => `${l}/webcams.html`).join(', ')}`);
}

if (require.main === module) main();
module.exports = { embed, CAMS, T };
