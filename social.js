/* Villa's Properties — redes sociales y compartir.
   Perfiles reales (resueltos desde las redirecciones de villasproperties.es),
   botones del pie, botón flotante de WhatsApp y barra de compartir en los
   contenidos (artículos y fichas de inmueble). */
(() => {
  'use strict';

  const WHATSAPP = '34667384965';

  /* Logos de marca (Simple Icons, CC0) en fill; utilidades en trazo. */
  const ICONS = {
    instagram: '<svg class="brandicon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.26 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.07.36-2.24.41-1.27.06-1.65.07-4.86.07s-3.59-.01-4.86-.07c-1.17-.06-1.82-.26-2.24-.42-.57-.22-.96-.48-1.38-.9-.42-.42-.69-.82-.9-1.38-.16-.42-.36-1.07-.42-2.24-.04-1.26-.06-1.65-.06-4.84s.02-3.59.06-4.86c.06-1.17.26-1.81.42-2.23.21-.57.48-.96.9-1.38.42-.42.81-.69 1.38-.9.42-.17 1.05-.36 2.22-.42 1.28-.05 1.65-.06 4.86-.06zM12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.3-1.46.72-2.13 1.38C1.35 2.68.94 3.35.63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.94 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32A6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>',
    facebook: '<svg class="brandicon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.1 23.69v-7.98H6.63v-3.67H9.1v-1.58c0-4.08 1.85-5.98 5.86-5.98.4 0 .96.04 1.47.1.4.06.78.13 1.14.2v3.32a8.6 8.6 0 0 0-.65-.04 26.8 26.8 0 0 0-.74-.01c-.7 0-1.25.1-1.67.31-.28.14-.51.35-.68.62-.26.42-.37 1-.37 1.75v1.3h3.92l-.39 2.1-.28 1.57h-3.25v8.24C19.4 23.24 24 18.18 24 12.04 24 5.42 18.63.05 12 .05S0 5.42 0 12.04c0 5.63 3.87 10.35 9.1 11.65z"/></svg>',
    tiktok: '<svg class="brandicon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.53.02c1.3-.02 2.6-.01 3.9-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03a10.7 10.7 0 0 1-4.2-.97c-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75a7.6 7.6 0 0 1-1.35 3.94 7.44 7.44 0 0 1-5.91 3.21 7.3 7.3 0 0 1-4.08-1.03A7.62 7.62 0 0 1 1.6 17.25a12 12 0 0 1-.01-1.49 7.6 7.6 0 0 1 2.58-4.96 7.4 7.4 0 0 1 6.15-1.72c.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87a3.3 3.3 0 0 0 2.77-1.61c.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    youtube: '<svg class="brandicon" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>',
    whatsapp: '<svg class="brandicon" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.23-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.25-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.03 1.02-1.03 2.48 0 1.46 1.06 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.22-3.74.99 1-3.65-.24-.38a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.49-8.42"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.4 13.6a3.5 3.5 0 0 0 5 0l2.8-2.8a3.5 3.5 0 0 0-5-5l-1.3 1.3"/><path d="M13.6 10.4a3.5 3.5 0 0 0-5 0l-2.8 2.8a3.5 3.5 0 0 0 5 5l1.3-1.3"/></svg>',
    x: '<svg class="brandicon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.6 6.7l8.4 6 8.4-6"/></svg>',
  };


  const NETWORKS = [
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/villasproperties.es/' },
    { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61585337251095' },
    { id: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@villasproperties.es' },
    { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@Villasproperties' },
    { id: 'whatsapp', label: 'WhatsApp', url: `https://wa.me/${WHATSAPP}` },
  ];

  /* Los perfiles también viajan en el JSON-LD de la organización (sameAs). */
  window.VP_SOCIAL = NETWORKS;

  /* ---------- Pie: iconos en vez de una lista de texto ---------- */
  const followColumn = [...document.querySelectorAll('.footergrid > div')]
    .find((col) => col.querySelector('.eye')?.textContent.trim() === 'Follow');

  if (followColumn) {
    followColumn.innerHTML = `
      <div class="eye">Follow</div>
      <ul class="social-list">
        ${NETWORKS.map((n) => `
          <li><a href="${n.url}" target="_blank" rel="noopener" aria-label="${n.label}" title="${n.label}">
            ${ICONS[n.id]}<span>${n.label}</span>
          </a></li>`).join('')}
      </ul>`;
  }

  /* ---------- Botón flotante de WhatsApp ---------- */
  if (!document.getElementById('waFloat')) {
    const wa = document.createElement('a');
    wa.id = 'waFloat';
    wa.className = 'wa-float';
    wa.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola, os escribo desde la web de Villa’s Properties.')}`;
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Escribir por WhatsApp');
    wa.innerHTML = `${ICONS.whatsapp}<span>WhatsApp</span>`;
    document.body.appendChild(wa);
  }

  /* ---------- Compartir (artículos y fichas) ---------- */
  const mount = document.querySelector('[data-share]');
  if (mount) {
    const url = location.href;
    const title = document.title.replace(/ — Villa’s Properties$/, '');
    const targets = [
      { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}` },
      { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
      { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
      { id: 'mail', label: 'Email', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n${url}`)}` },
    ];
    mount.innerHTML = `
      <span class="eye">Compartir</span>
      <div class="share-row">
        ${targets.map((t) => `<a href="${t.href}" target="_blank" rel="noopener" aria-label="Compartir en ${t.label}" title="${t.label}">${ICONS[t.id]}</a>`).join('')}
        <button type="button" id="copyLink" aria-label="Copiar enlace" title="Copiar enlace">${ICONS.link}</button>
      </div>`;

    const copy = document.getElementById('copyLink');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        copy.classList.add('is-done');
        setTimeout(() => copy.classList.remove('is-done'), 1800);
      } catch {
        window.prompt('Copia el enlace:', url);
      }
    });
  }
})();
