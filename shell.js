/* Villa's Properties — shell común de todas las páginas.
   Antes cada página interior traía su propio header recortado: sin logo, sin
   botón de Back Office y sin gate, así que al navegar desde la home parecía
   otra web. Aquí vive la ÚNICA definición de cabecera, pie y panel privado.

   Debe cargarse ANTES de app.js (que engancha el menú móvil) y backoffice-auth.js
   (que engancha los botones del gate por id). */
(() => {
  'use strict';

  /* Seis y no ocho: un menú de ocho no se lee, se escanea y se abandona.
     Quedan las puertas de negocio. Finance sale porque es un paso DENTRO de
     comprar o invertir, no un destino; Insights porque el contenido se alcanza
     desde Intelligence y desde el pie. Ambas siguen enlazadas en el footer y
     en el cuerpo, así que no pierden ni tráfico interno ni enlaces para SEO. */
  /* Cinco entradas, una por intención de quien llega:
       Properties  ver qué hay
       Sell        vender  · Buy  comprar
       Finance     el embudo de financiación (es el que paga comisión)
       News        el centro editorial
     Invest e Intelligence salen del menú y se alcanzan desde la portada y desde
     Buy: son argumento, no puerta de entrada, y en el menú competían con las
     cinco que sí lo son. Valuation tampoco va aquí — tiene su propio CTA en la
     cabecera y se enlaza desde media web. */
  /* atelier:villas-idiomas — islas NL/FR/IT: shell.js pisaba el <header> y el
     <footer> entero con innerHTML fijo en español/inglés, así que cualquier
     selector de idioma o nav traducida que pusiera la página estática
     desaparecía en cuanto cargaba este script. Se hace lang-aware: por
     defecto (es o sin lang) el comportamiento es BYTE a BYTE el de antes. */
  const LANG = (document.documentElement.getAttribute('lang') || 'es').toLowerCase();
  const I18N_NAV = {
    es: { properties: 'Properties', sell: 'Sell', buy: 'Buy', finance: 'Finance', news: 'News', advisor: 'Valoración gratis', claim: 'INTELIGENCIA INMOBILIARIA · TENERIFE', explore: 'Explore', intelligenceEye: 'Intelligence', follow: 'Follow', privacy: 'Privacidad', legal: 'Aviso legal', backoffice: 'Private back office', restricted: 'Acceso restringido' },
    nl: { properties: 'Properties', sell: 'Verkopen', buy: 'Kopen', finance: 'Financiering', news: 'Nieuws', advisor: 'Gratis waardebepaling', claim: 'VASTGOEDINTELLIGENTIE · TENERIFE', explore: 'Verkennen', intelligenceEye: 'Intelligence', follow: 'Volgen', privacy: 'Privacybeleid', legal: 'Juridische kennisgeving', backoffice: 'Private back office', restricted: 'Beperkte toegang' },
    fr: { properties: 'Properties', sell: 'Vendre', buy: 'Acheter', finance: 'Financement', news: 'Actualités', advisor: 'Estimation gratuite', claim: 'INTELLIGENCE IMMOBILIÈRE · TENERIFE', explore: 'Explorer', intelligenceEye: 'Intelligence', follow: 'Suivre', privacy: 'Confidentialité', legal: 'Mentions légales', backoffice: 'Private back office', restricted: 'Accès restreint' },
    it: { properties: 'Properties', sell: 'Vendere', buy: 'Comprare', finance: 'Finanziamento', news: 'Notizie', advisor: 'Valutazione gratuita', claim: "INTELLIGENCE IMMOBILIARE · TENERIFE", explore: 'Esplora', intelligenceEye: 'Intelligence', follow: 'Segui', privacy: 'Privacy', legal: 'Note legali', backoffice: 'Private back office', restricted: 'Accesso riservato' },
    en: { properties: 'Properties', sell: 'Sell', buy: 'Buy', finance: 'Finance', news: 'News', advisor: 'Free valuation', claim: 'DATA-DRIVEN PROPERTY INTELLIGENCE · TENERIFE', explore: 'Explore', intelligenceEye: 'Intelligence', follow: 'Follow', privacy: 'Privacy', legal: 'Legal notice', backoffice: 'Private back office', restricted: 'Restricted access' },
    de: { properties: 'Properties', sell: 'Verkaufen', buy: 'Kaufen', finance: 'Finanzierung', news: 'Neuigkeiten', advisor: 'Kostenlose Bewertung', claim: 'IMMOBILIENINTELLIGENZ · TENERIFFA', explore: 'Entdecken', intelligenceEye: 'Intelligence', follow: 'Folgen', privacy: 'Datenschutz', legal: 'Impressum', backoffice: 'Private back office', restricted: 'Eingeschränkter Zugang' },
  };
  const T = I18N_NAV[LANG] || I18N_NAV.es;
  /* Las páginas de la isla viven un nivel más abajo (nl/ fr/ it/): todo
     enlace/recurso relativo que shell.js inyecta necesita '../'. Fuera de la
     isla (76 páginas en es, sin lang o lang="es") esto es '' y no cambia nada. */
  const ISLAND_BASE = LANG !== 'es' ? '../' : '';
  /* Enlaces que salen de la isla (todo lo que no sea contact.html/guia-comprador
     en su propio idioma) van al español, marcados: hreflang + title localizado. */
  const FOREIGN_TITLE = { nl: 'deze pagina is in het Spaans', fr: 'cette page est en espagnol', it: 'questa pagina è in spagnolo', en: 'this page is in Spanish', de: 'diese Seite ist auf Spanisch' };
  const outMark = LANG !== 'es' ? ` hreflang="es" title="${FOREIGN_TITLE[LANG]}"` : '';

  const NAV = [
    ['properties.html', T.properties],
    ['sell.html', T.sell],
    ['buy.html', T.buy],
    ['finance.html', T.finance],
    ['insights.html', T.news],
  ];

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  /* Un artículo del blog vive bajo Insights a efectos de navegación. */
  const active = page.startsWith('post-') ? 'insights.html' : page;

  const brand = `
    <a class="brand" href="${ISLAND_BASE}index.html" aria-label="Villa’s Properties"${outMark}>
      <img class="brand-logo" src="${ISLAND_BASE}assets/brand/logo-placeholder.webp" alt="" width="44" height="44">
      <div class="lockup">
        <div class="wordmark"><span>VILL</span><span class="a">A</span><span>’S&nbsp;PROPERTIES</span></div>
        <div class="brand-sub">${T.claim}</div>
      </div>
    </a>`;

  const header = document.querySelector('.header');
  if (header) {
    /* El botón destacado ofrece algo gratis en lugar de pedir un compromiso:
       "hablar con un asesor" obliga a dar el paso social, "valoración gratis"
       no. Y la valoración es el mayor gancho de captación de vendedores, que
       al salir Valuation del menú se había quedado sin sitio visible.
       Contacto no pierde nada: ya se enlaza desde 15 páginas y desde el pie. */
    const advisor = `${ISLAND_BASE}valuation.html`;
    /* El selector de idioma vivía en el <nav> estático de la página; shell.js
       va a reemplazar ese <nav>, así que se rescata ANTES de pisarlo y se
       reinserta después (en vez de hacer que cada página lo regenere). */
    const savedSwitch = header.querySelector('.lang-switch');
    const switchHtml = savedSwitch ? savedSwitch.outerHTML : '';
    header.innerHTML = `
      <div class="wrap headerin">
        ${brand}
        <nav class="nav">
          ${NAV.map(([href, label]) => `<a href="${ISLAND_BASE}${href}"${href === active ? ' class="is-current" aria-current="page"' : ''}${outMark}>${label}</a>`).join('')}
          <a class="advisor" href="${advisor}"${outMark}>${T.advisor}</a>
        </nav>${switchHtml}
        <button class="menu-toggle" id="mobileAdmin" type="button">⚙ Config</button>
      </div>`;
  }

  const footer = document.querySelector('.footer');
  if (footer) {
    footer.innerHTML = `
      <div class="wrap">
        <div class="footergrid">
          <div class="lockup">
            <div class="wordmark"><span>VILLA’S&nbsp;PROPERTIES</span></div>
            <div class="brand-sub">${T.claim}</div>
          </div>
          <div><div class="eye">${T.explore}</div><p><a href="${ISLAND_BASE}properties.html"${outMark}>${T.properties}</a><br><a href="${ISLAND_BASE}sell.html"${outMark}>${T.sell}</a><br><a href="${ISLAND_BASE}buy.html"${outMark}>${T.buy}</a><br><a href="${ISLAND_BASE}finance.html"${outMark}>${T.finance}</a><br><a href="${ISLAND_BASE}invest.html"${outMark}>Invest</a><br><a href="${ISLAND_BASE}valuation.html"${outMark}>${T.advisor}</a></p></div>
          <div><div class="eye">${T.intelligenceEye}</div><p><a href="${ISLAND_BASE}intelligence.html"${outMark}>ACM &amp; Market Impact</a><br><a href="${ISLAND_BASE}insights.html"${outMark}>Insights / Blog</a><br><a href="${ISLAND_BASE}advisory.html"${outMark}>Advisory</a><br><a href="${ISLAND_BASE}case-studies.html"${outMark}>Case Studies</a></p></div>
          <div><div class="eye">${T.follow}</div><p><a href="https://villasproperties.es/website/social/instagram" target="_blank" rel="noopener">Instagram</a><br><a href="https://villasproperties.es/website/social/facebook" target="_blank" rel="noopener">Facebook</a><br><a href="https://villasproperties.es/website/social/tiktok" target="_blank" rel="noopener">TikTok</a><br><a href="https://villasproperties.es/website/social/youtube" target="_blank" rel="noopener">YouTube</a></p></div>
        </div>
        <div class="footer-bottom">
          <span>© <span id="year">2026</span> Villa's Properties hecho con Amor · <a href="${ISLAND_BASE}privacy.html" style="text-decoration:underline"${outMark}>${T.privacy}</a> · <a href="${ISLAND_BASE}aviso-legal.html" style="text-decoration:underline"${outMark}>${T.legal}</a></span>
          <span><strong>🕒 Tenerife:</strong> <span id="tenerifeClock">--:--:--</span></span>
            <button class="admin footer-admin" id="openAdmin" type="button">
              <span class="footer-admin__t">${T.backoffice}</span>
              <span class="footer-admin__s">${T.restricted}</span>
            </button>
        </div>
      </div>`;
  }

  /* Panel privado: mismo Back Office en todas las páginas, tras el gate. */
  if (!document.getElementById('adminPanel')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="overlay" id="overlay"></div>
      <aside class="adminpanel" id="adminPanel">
        <div class="adminhead">
          <div class="brand">
            <svg class="monogram" viewBox="0 0 100 70" aria-hidden="true"><path d="M8 8 L35 60 L60 8"/><path d="M62 60 V8 H82 C94 8 98 16 98 27 C98 39 91 46 80 46 H62"/></svg>
            <div><div class="eye">PRIVATE BACK OFFICE</div><strong>Catálogo · fotos y datos</strong></div>
          </div>
          <button class="round" id="closeAdmin" type="button">×</button>
        </div>
        <div class="adminbody">
          <div class="fields">
            <div class="field full"><label for="aName">Nombre</label><input id="aName" value="Ocean Residence"></div>
            <div class="field"><label for="aPrice">Precio</label><input id="aPrice" type="number" value="245000"></div>
            <div class="field"><label for="aZone">Zona</label><input id="aZone" value="Costa Adeje"></div>
            <div class="field"><label for="aStatus">Estado</label><select id="aStatus"><option>For sale</option><option>Reserved</option><option>Sold</option><option>Off-market</option></select></div>
            <div class="field"><label for="aStrategy">Estrategia</label><select id="aStrategy"><option>Home</option><option>Income</option><option>Value-add</option><option>Development</option></select></div>
            <div class="field full"><label for="videoFile">Hero video local</label><input id="videoFile" type="file" accept="video/*"></div>
          </div>
          <div style="margin-top:28px"><div class="eye">Características</div><div class="features" id="features" style="margin-top:12px"></div></div>
          <div class="adminactions"><button class="btn green" id="saveAdmin" type="button">Guardar cambios</button></div>
          <div class="statusmsg" id="statusMsg">Catálogo real. Lo que edites se guarda en este navegador hasta que lo publiques.</div>
        </div>
      </aside>`);
  }

  /* El editor del catálogo (backoffice.js + el catálogo) pesa ~28 KB y solo lo
     usa el equipo: se carga cuando el panel se abre de verdad, no en cada
     visita. Escuchamos la clase del panel porque el gate corta el clic en fase
     de captura y no llegaría a un listener nuestro. */
  const panel = document.getElementById('adminPanel');
  if (panel) {
    let loaded = false;
    const load = (src) => new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const el = document.createElement('script');
      el.src = src;
      el.onload = resolve;
      el.onerror = resolve;
      document.body.appendChild(el);
    });
    new MutationObserver(async () => {
      if (loaded || !panel.classList.contains('open')) return;
      loaded = true;
      await load(`${ISLAND_BASE}vp-safe.js`);
      await load(`${ISLAND_BASE}vp-store.js`);
      await load(`${ISLAND_BASE}properties-data.js`);
      await load(`${ISLAND_BASE}vp-publish.js`);
      await load(`${ISLAND_BASE}bo-blog.js`);
      await load(`${ISLAND_BASE}backoffice.js`);
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  }

  /* El CSS del gate solo estaba enlazado en la home. */
  if (!document.querySelector(`link[href="${ISLAND_BASE}backoffice-auth.css"]`)) {
    document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${ISLAND_BASE}backoffice-auth.css` }));
  }
})();
