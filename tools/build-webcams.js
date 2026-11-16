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
    ctaEye: 'Living here', ctaH: 'Homes for sale<br>near these beaches.',
    ctaP: 'Like what you see? Have a look at what is for sale in the south. We answer in writing, in English.',
    b1: 'See our properties', b1href: '../properties.html', b2: 'Ask us on WhatsApp ↗',
  },
};

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
@media (prefers-reduced-motion:reduce){.cam img{transition:none}}
</style>`;

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
<p class="bankpie">${t.fuente}</p>
</div></section>
<section class="sell-cta" data-header-theme="green"><div class="wrap" style="position:relative;z-index:1">
<div class="eye">${t.ctaEye}</div><h2>${t.ctaH}</h2><p style="max-width:580px">${t.ctaP}</p>
<div class="actions" style="justify-content:flex-start;margin-top:25px"><a class="btn fill" href="${t.b1href}?utm_source=web&amp;utm_medium=webcams&amp;utm_campaign=webcams_${lang}">${t.b1}</a><a class="btn" href="${WA}" target="_blank" rel="noopener">${t.b2}</a></div>
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
