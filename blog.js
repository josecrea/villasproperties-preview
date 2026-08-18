/* Villa's Properties — render del blog (índice con filtros + "seguir leyendo").
   Un único origen de datos (window.VP_POSTS) para no duplicar el listado en
   cada página. Sin dependencias. */
(() => {
  'use strict';

  const posts = window.VP_POSTS || [];
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const E = (v) => (window.VPSafe ? VPSafe.esc(v) : String(v ?? ''));
  const U = (v) => (window.VPSafe ? VPSafe.url(v) : String(v ?? ''));

  const dateLabel = (iso) => {
    const d = new Date(`${iso}T12:00:00`);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  const byDate = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

  /* Miniatura generativa: cada artículo tiene su propia composición geométrica
     en vez de una foto de stock que no dice nada. */
  const figure = (post) => `<div class="pcard-fig" data-fig="${post.figure || 'plain'}" data-accent="${post.accent || 'sand'}" aria-hidden="true"><i></i><b></b></div>`;

  const linkAttrs = (post) => (post.external
    ? `href="${U(post.slug)}" target="_blank" rel="noopener"`
    : `href="${U(post.slug)}"`);

  const card = (post) => `
    <article class="pcard${post.external ? ' is-external' : ''}" data-category="${E(post.category)}" data-stagger>
      <a class="pcard-link" ${linkAttrs(post)}>
        ${figure(post)}
        <div class="pcard-body">
          <div class="pcard-meta"><span class="eye">${E(post.category)}</span><span>${dateLabel(post.date)} · ${post.read}</span></div>
          <h3>${E(post.title)}</h3>
          <p>${E(post.dek)}</p>
          <span class="pcard-cta eye">${post.external ? 'Leer en el blog ↗' : 'Leer el análisis ↗'}</span>
        </div>
      </a>
    </article>`;

  /* ---------- Índice ---------- */
  const grid = $('#blogGrid');
  if (grid) {
    const ordered = posts.slice().sort(byDate);
    const lead = ordered.find((p) => p.featured) || ordered[0];
    const rest = ordered.filter((p) => p !== lead);

    const hero = $('#blogFeatured');
    if (hero && lead) {
      hero.innerHTML = `
        <a class="pfeat-link" ${linkAttrs(lead)}>
          ${figure(lead)}
          <div class="pfeat-body">
            <div class="pcard-meta"><span class="eye">Destacado · ${lead.category}</span><span>${dateLabel(lead.date)} · ${lead.read}</span></div>
            <h2>${E(lead.title)}</h2>
            <p>${E(lead.dek)}</p>
            <span class="pcard-cta eye">${lead.external ? 'Leer en el blog ↗' : 'Leer el análisis ↗'}</span>
          </div>
        </a>`;
    }

    const render = (category) => {
      /* En 'Todo' el destacado ya está arriba; al filtrar por categoría se
         incluye para no dejar la rejilla coja. */
      const list = category === 'Todo' ? rest : ordered.filter((p) => p.category === category);
      grid.innerHTML = list.length
        ? list.map(card).join('')
        : '<p class="muted">Todavía no hay artículos en esta categoría.</p>';
    };

    const filters = $('#blogFilters');
    if (filters) {
      const categories = ['Todo', ...[...new Set(posts.map((p) => p.category))]];
      filters.innerHTML = categories
        .map((c, i) => `<button type="button" class="pfilter${i === 0 ? ' is-on' : ''}" data-cat="${E(c)}">${E(c)}</button>`)
        .join('');
      filters.addEventListener('click', (event) => {
        const button = event.target.closest('.pfilter');
        if (!button) return;
        $$('.pfilter', filters).forEach((b) => b.classList.toggle('is-on', b === button));
        render(button.dataset.cat);
      });
    }

    render('Todo');
  }

  /* ---------- Seguir leyendo (dentro de un post) ---------- */
  const related = $('#blogRelated');
  if (related) {
    const current = (location.pathname.split('/').pop() || '').toLowerCase();
    const list = posts
      .filter((p) => p.slug.toLowerCase() !== current)
      .sort(byDate)
      .slice(0, 3);
    related.innerHTML = list.map(card).join('');
  }

  /* Progreso de lectura: barra fina superior en las páginas de artículo. */
  const bar = $('#readProgress');
  if (bar) {
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      bar.style.transform = `scaleX(${total > 0 ? Math.min(doc.scrollTop / total, 1) : 0})`;
    };
    document.addEventListener('scroll', update, { passive: true });
    update();
  }
})();
