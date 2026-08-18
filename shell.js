/* Villa's Properties — shell común de todas las páginas.
   Antes cada página interior traía su propio header recortado: sin logo, sin
   botón de Back Office y sin gate, así que al navegar desde la home parecía
   otra web. Aquí vive la ÚNICA definición de cabecera, pie y panel privado.

   Debe cargarse ANTES de app.js (que engancha el menú móvil) y backoffice-auth.js
   (que engancha los botones del gate por id). */
(() => {
  'use strict';

  const NAV = [
    ['properties.html', 'Properties'],
    ['sell.html', 'Sell'],
    ['buy.html', 'Buy'],
    ['finance.html', 'Finance'],
    ['invest.html', 'Invest'],
    ['intelligence.html', 'Intelligence'],
    ['insights.html', 'Insights'],
    ['valuation.html', 'Valuation'],
  ];

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  /* Un artículo del blog vive bajo Insights a efectos de navegación. */
  const active = page.startsWith('post-') ? 'insights.html' : page;

  const brand = `
    <a class="brand" href="index.html" aria-label="Villa’s Properties">
      <img class="brand-logo" src="assets/brand/logo-placeholder.webp" alt="" width="44" height="44">
      <div class="lockup">
        <div class="wordmark"><span>VILL</span><span class="a">A</span><span>’S&nbsp;PROPERTIES</span></div>
        <div class="brand-sub">PROPERTY INTELLIGENCE · TENERIFE</div>
      </div>
    </a>`;

  const header = document.querySelector('.header');
  if (header) {
    const advisor = page === 'index.html' ? '#contact' : 'contact.html';
    header.innerHTML = `
      <div class="wrap headerin">
        ${brand}
        <nav class="nav">
          ${NAV.map(([href, label]) => `<a href="${href}"${href === active ? ' class="is-current" aria-current="page"' : ''}>${label}</a>`).join('')}
          <button class="admin" id="openAdmin" type="button">⚙ Back Office</button>
          <a class="advisor" href="${advisor}">Talk to an advisor</a>
        </nav>
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
            <div class="brand-sub">PROPERTY INTELLIGENCE · TENERIFE</div>
          </div>
          <div><div class="eye">Explore</div><p><a href="properties.html">Properties</a><br><a href="sell.html">Sell</a><br><a href="buy.html">Buy</a><br><a href="finance.html">Finance</a><br><a href="invest.html">Invest</a><br><a href="valuation.html">Valoración gratis</a></p></div>
          <div><div class="eye">Intelligence</div><p><a href="intelligence.html">ACM &amp; Market Impact</a><br><a href="insights.html">Insights / Blog</a><br><a href="advisory.html">Advisory</a><br><a href="case-studies.html">Case Studies</a></p></div>
          <div><div class="eye">Follow</div><p><a href="https://villasproperties.es/website/social/instagram" target="_blank" rel="noopener">Instagram</a><br><a href="https://villasproperties.es/website/social/facebook" target="_blank" rel="noopener">Facebook</a><br><a href="https://villasproperties.es/website/social/tiktok" target="_blank" rel="noopener">TikTok</a><br><a href="https://villasproperties.es/website/social/youtube" target="_blank" rel="noopener">YouTube</a></p></div>
        </div>
        <div class="footer-bottom">
          <span>© <span id="year">2026</span> Villa's Properties hecho con Amor · <a href="privacy.html" style="text-decoration:underline">Privacidad</a></span>
          <span><strong>🕒 Tenerife:</strong> <span id="tenerifeClock">--:--:--</span></span>
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
            <div><div class="eye">PRIVATE BACK OFFICE</div><strong>Property editor · prototype</strong></div>
          </div>
          <button class="round" id="closeAdmin" type="button">×</button>
        </div>
        <div class="adminbody">
          <div class="fields">
            <div class="field full"><label>Nombre</label><input id="aName" value="Ocean Residence"></div>
            <div class="field"><label>Precio</label><input id="aPrice" type="number" value="245000"></div>
            <div class="field"><label>Zona</label><input id="aZone" value="Costa Adeje"></div>
            <div class="field"><label>Estado</label><select id="aStatus"><option>For sale</option><option>Reserved</option><option>Sold</option><option>Off-market</option></select></div>
            <div class="field"><label>Estrategia</label><select id="aStrategy"><option>Home</option><option>Income</option><option>Value-add</option><option>Development</option></select></div>
            <div class="field full"><label>Hero video local</label><input id="videoFile" type="file" accept="video/*"></div>
          </div>
          <div style="margin-top:28px"><div class="eye">Características</div><div class="features" id="features" style="margin-top:12px"></div></div>
          <div class="adminactions"><button class="btn green" id="saveAdmin" type="button">Guardar cambios</button></div>
          <div class="statusmsg" id="statusMsg">Prototipo local: producción debe usar Odoo/API + autenticación server-side.</div>
        </div>
      </aside>`);
  }

  /* El CSS del gate solo estaba enlazado en la home. */
  if (!document.querySelector('link[href="backoffice-auth.css"]')) {
    document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'backoffice-auth.css' }));
  }
})();
