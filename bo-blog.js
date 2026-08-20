/* bo-blog.js — Escribir y publicar un artículo del blog desde el navegador.
 *
 * POR QUÉ
 * -------
 * El back office dejaba editar el catálogo, pero un artículo nuevo obligaba a
 * abrir la terminal (tools/nuevo-post.js). Para quien lleva la web sin tocar
 * código, eso no es autonomía. Esto añade una pestaña "Blog" que hace lo mismo
 * que el script, pero desde el panel y publicando en un solo commit.
 *
 * CÓMO SALE IDÉNTICO A LOS DEMÁS
 * ------------------------------
 * No se escribe la plantilla del artículo aquí —se desincronizaría con la de
 * nuevo-post.js a la primera— sino que se DESCARGA un artículo ya publicado y
 * se le cambia lo que varía: título, fecha, entradilla, cuerpo y schema. Así
 * hereda cabecera, pie, scripts y estilos sin copiarlos.
 *
 * QUÉ COMMIT HACE
 * ---------------
 * Tres ficheros en un solo commit, por la misma vía que el catálogo
 * (VPPublish.commit): el post nuevo, blog-data.js con la entrada añadida y
 * sitemap.xml con la URL. Los mismos tres que toca nuevo-post.js.
 */
(() => {
  'use strict';
  if (window.VPBlog) return;

  const DOMINIO = 'https://villasproperties.es';
  const MODELO = 'post-mapa-metro-cuadrado.html';   // plantilla: un artículo propio y estable
  const ID_AUTOR = `${DOMINIO}/contact.html#valeria-villa`;
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const E = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

  const enLinea = (t) => E(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\[([^\]]+)\]\(([a-z0-9-]+\.html[^)]*)\)/g, '<a href="$2">$1</a>');

  /* Mismo conversor que nuevo-post.js: un bloque por línea en blanco. */
  const aHtml = (txt) => txt.split(/\n{2,}/).map((bloque) => {
    const b = bloque.trim();
    if (!b) return '';
    if (b.startsWith('## ')) return `<h2>${E(b.slice(3))}</h2>`;
    if (b.startsWith('### ')) return `<h3>${E(b.slice(4))}</h3>`;
    if (b.startsWith('> ')) return `<p class="pullq">${enLinea(b.slice(2))}</p>`;
    if (/^[-*] /.test(b)) {
      const li = b.split('\n').map((l) => `<li>${enLinea(l.replace(/^[-*] /, ''))}</li>`).join('');
      return `<ul class="post-list">${li}</ul>`;
    }
    return `<p>${enLinea(b)}</p>`;
  }).filter(Boolean).join('\n    ');

  const fechaLarga = (iso) => {
    const [a, m, d] = iso.split('-');
    return `${Number(d)} de ${MESES[Number(m) - 1]} de ${a}`;
  };

  /* Descarga la plantilla y devuelve el HTML del artículo nuevo. Todo lo que
     NO cambia entre artículos —header, footer, scripts, CSS— se hereda del
     modelo tal cual. */
  const construirPost = async (meta, cuerpoTexto) => {
    const shell = await (await fetch(`${MODELO}?v=${Date.now()}`)).text();
    const slug = meta.slug || slugify(meta.titulo);
    const fichero = `post-${slug}.html`;
    const url = `${DOMINIO}/${fichero}`;
    const lectura = meta.lectura || `${Math.max(3, Math.round(cuerpoTexto.split(/\s+/).length / 220))} min`;

    let html = shell;
    const rep = (re, val) => { html = html.replace(re, val); };

    rep(/<title>[^<]*<\/title>/, `<title>${E(meta.tituloseo || meta.titulo)} — Villa’s Properties</title>`);
    rep(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${E(meta.entradilla)}">`);
    rep(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
    rep(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${E(meta.titulo)}">`);
    rep(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${E(meta.entradilla)}">`);
    rep(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
    rep(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${E(meta.titulo)}">`);
    rep(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${E(meta.entradilla)}">`);
    /* La imagen de compartir vuelve a la genérica del blog: la del modelo es la
       de su artículo, no la de este. Cuando haya foto propia se cambia aparte. */
    const ogGen = `${DOMINIO}/assets/brand/tenerife-mercado.webp`;
    rep(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${ogGen}">`);
    rep(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${ogGen}">`);

    /* JSON-LD: se reescribe el nodo Article con los datos nuevos y se mantiene
       la Person (autora) que ya viene en la plantilla. */
    html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (todo, cuerpo) => {
      let d; try { d = JSON.parse(cuerpo); } catch { return todo; }
      const nodos = d['@graph'] || (Array.isArray(d) ? d : [d]);
      for (const n of nodos) {
        if (n['@type'] !== 'Article') continue;
        n.headline = meta.titulo;
        n.description = meta.entradilla;
        n.datePublished = meta.fecha;
        n.dateModified = meta.fecha;
        n.articleSection = meta.categoria;
        n.mainEntityOfPage = url;
        n.author = { '@id': ID_AUTOR };
      }
      /* El BreadcrumbList de la plantilla lleva el nombre y la URL del artículo
         modelo en su último escalón: si no se cambia, el post nuevo dice en el
         schema que es "El mapa del metro cuadrado". */
      for (const nodo of nodos) {
        if (nodo['@type'] !== 'BreadcrumbList') continue;
        const items = nodo.itemListElement || [];
        const ultimo = items[items.length - 1];
        if (ultimo) { ultimo.name = meta.titulo; ultimo.item = url; }
      }
      const out = d['@graph'] ? { ...d, '@graph': nodos } : { '@context': 'https://schema.org', '@graph': nodos };
      return `<script type="application/ld+json">${JSON.stringify(out)}</script>`;
    });

    /* La cabecera del artículo: categoría, fecha, lectura, firma, titular y
       entradilla. Se sustituye el bloque entero del post-hero. */
    const claseTitular = meta.titulo.length > 62 ? ' class="titular-muy-largo"'
      : meta.titulo.length > 42 ? ' class="titular-largo"' : '';
    const kicker = `<div class="post-kicker"><b>${E(meta.categoria)}</b>`
      + `<span>${fechaLarga(meta.fecha)}</span><span>${lectura} de lectura</span>`
      + `<span class="post-firma">Por <a href="contact.html" rel="author">Valeria Villa</a>, CEO</span></div>`;
    rep(/<div class="post-kicker">[\s\S]*?<\/div>/, kicker);
    rep(/<h1[^>]*>[\s\S]*?<\/h1>/, `<h1${claseTitular}>${E(meta.titulo)}</h1>`);
    rep(/<p class="post-dek">[\s\S]*?<\/p>/, `<p class="post-dek">${E(meta.entradilla)}</p>`);

    /* El cuerpo. */
    rep(/<div class="post-body">[\s\S]*?<\/div>\s*<\/article>/,
      `<div class="post-body">\n    ${aHtml(cuerpoTexto)}\n    </div>\n  </article>`);

    return { fichero, url, html, slug, lectura, meta };
  };

  /* blog-data.js con la entrada nueva delante. Se descarga el actual para no
     perder los que ya hay. */
  const construirBlogData = async (post) => {
    const actual = await (await fetch(`blog-data.js?v=${Date.now()}`)).text();
    const entrada = `  {
    slug: '${post.fichero}',
    category: '${post.meta.categoria}',
    title: ${JSON.stringify(post.meta.titulo)},
    dek: ${JSON.stringify(post.meta.entradilla)},
    date: '${post.meta.fecha}',
    read: '${post.lectura}',
    accent: 'atlantic',
    figure: 'chart',
  },
`;
    if (actual.includes(`'${post.fichero}'`)) return actual;    // ya existe: no duplicar
    return actual.replace('window.VP_POSTS = [\n', `window.VP_POSTS = [\n${entrada}`);
  };

  const construirSitemap = async (post) => {
    const actual = await (await fetch(`sitemap.xml?v=${Date.now()}`)).text();
    if (actual.includes(post.fichero)) return actual;
    const hoy = post.meta.fecha;
    return actual.replace('</urlset>',
      `  <url><loc>${post.url}</loc><lastmod>${hoy}</lastmod><priority>0.7</priority></url>\n</urlset>`);
  };

  /* API que usa el panel. Devuelve los tres ficheros listos para el commit. */
  window.VPBlog = {
    validar(meta, cuerpo) {
      const faltan = [];
      if (!meta.titulo || meta.titulo.trim().length < 8) faltan.push('un título de al menos 8 caracteres');
      if (!meta.categoria) faltan.push('una categoría');
      if (!meta.entradilla || meta.entradilla.trim().length < 40) faltan.push('una entradilla de al menos 40 caracteres');
      if (!cuerpo || cuerpo.trim().split(/\s+/).length < 120) faltan.push('un cuerpo de al menos 120 palabras');
      if (meta.entradilla && meta.entradilla.length > 165) faltan.push('una entradilla más corta (máx. 165)');
      return faltan;
    },

    async preparar(meta, cuerpo) {
      const fecha = meta.fecha || new Date().toISOString().slice(0, 10);
      const post = await construirPost({ ...meta, fecha }, cuerpo);
      const blogData = await construirBlogData(post);
      const sitemap = await construirSitemap(post);
      /* Formato de VPPublish.commit: [{ path, bytes }]. bytes = Uint8Array. */
      const enc = (s) => new TextEncoder().encode(s);
      return {
        post,
        files: [
          { path: post.fichero, bytes: enc(post.html) },
          { path: 'blog-data.js', bytes: enc(blogData) },
          { path: 'sitemap.xml', bytes: enc(sitemap) },
        ],
      };
    },
  };
})();
