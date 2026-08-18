/* Villa's Properties — ficha de inmueble (property.html?ref=<referencia>).
   Renderiza galería, ficha técnica, descripción, media (vídeo/planos/tour),
   ubicación y la lectura de mercado del inmueble contra el €/m² real de su
   microzona (market-data.js). */
(() => {
  'use strict';

  const WHATSAPP = '34667384965';
  const root = document.getElementById('propertyView');
  if (!root) return;

  const props = window.VP_PROPERTIES || [];
  const market = (window.VP_MARKET || { municipios: {} }).municipios;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const euro = (v) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  const perM2 = (v) => `${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €/m²`;

  const params = new URLSearchParams(location.search);
  const property = props.find((p) => p.ref === params.get('ref') || p.slug === params.get('ref')) || props[0];

  if (!property) {
    root.innerHTML = '<div class="wrap"><p class="muted">No hay inmuebles publicados.</p></div>';
    return;
  }

  /* Google recorta el title a ~60-65 caracteres: usamos el corto (tipología +
     zona), que además es el que se busca. */
  document.title = `${property.titleShort || property.title} — Villa’s Properties`;
  const desc = $('meta[name="description"]');
  if (desc) desc.setAttribute('content', `${property.type} en ${property.zone}, ${property.town}. ${property.built} m², ${property.beds} hab, ${property.baths} baños. ${euro(property.price)}.`);

  /* ---------- Lectura de mercado: el inmueble contra su microzona ---------- */
  const marketRead = () => {
    const town = market[property.zoneKey];
    if (!town) return null;
    const zone = (town.zonas || []).find((z) => z.id === property.zoneId);
    const reference = zone ? zone.eurM2 : town.eurM2;
    const gap = ((property.pricePerM2 / reference) - 1) * 100;
    return { town, zone, reference, gap };
  };
  const mk = marketRead();

  const marketVerdict = (gap) => {
    if (gap <= -12) return ['Por debajo de su zona', 'El €/m² publicado queda claramente por debajo de la referencia de la microzona.'];
    if (gap <= -4) return ['Ajustado', 'El precio se sitúa algo por debajo de la referencia de la zona.'];
    if (gap < 6) return ['En línea', 'El precio publicado está en línea con la referencia de la microzona.'];
    return ['Por encima de su zona', 'El €/m² publicado supera la referencia de la microzona: hay que justificar la prima.'];
  };

  /* ---------- Galería ---------- */
  const gallery = () => `
    <div class="pgal">
      <button class="pgal-main" type="button" data-index="0" aria-label="Ampliar foto 1">
        <img src="${property.images[0]}" alt="${property.title}, ${property.zone}" width="1200" height="800" fetchpriority="high">
        <span class="pgal-count">1 / ${property.images.length}</span>
      </button>
      <div class="pgal-side">
        ${property.images.slice(1, 5).map((src, i) => `
          <button class="pgal-thumb" type="button" data-index="${i + 1}" aria-label="Ampliar foto ${i + 2}">
            <img src="${src}" alt="${property.title}: foto ${i + 2}" loading="lazy" width="600" height="400">
            ${i === 3 && property.images.length > 5 ? `<span class="pgal-more">+${property.images.length - 5} fotos</span>` : ''}
          </button>`).join('')}
      </div>
    </div>`;

  const specs = [
    ['Superficie construida', `${property.built} m²`],
    ['Superficie útil', `${property.useful} m²`],
    ['Dormitorios', property.beds],
    ['Baños', property.baths],
    ['Planta', property.floor],
    ['Ascensor', property.lift ? 'Sí' : 'No'],
    ['Orientación', property.orientation],
    ['Año de construcción', property.year],
    ['Estado', property.condition],
    ['Comunidad', property.community ? `${property.community} €/mes` : 'No consta'],
    ['Certificado energético', property.energy],
    ['Referencia', property.ref],
  ];

  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Hola, me interesa la referencia ${property.ref} — ${property.title} (${property.zone}, ${euro(property.price)}). ¿Podemos hablar?`)}`;

  const mediaBlock = () => {
    const items = [];
    if (property.video) items.push(`<video class="pmedia-video" src="${property.video}" controls playsinline preload="none" poster="${property.images[0]}"></video>`);
    if (property.tour) items.push(`<a class="btn green" href="${property.tour}" target="_blank" rel="noopener">Abrir tour 360 ↗</a>`);
    if (property.floorplans.length) {
      items.push(`<div class="pplans">${property.floorplans.map((f, i) => `<a href="${f}" target="_blank" rel="noopener"><img src="${f}" alt="Plano ${i + 1} de ${property.title}" loading="lazy"></a>`).join('')}</div>`);
    }
    if (property.documents.length) {
      items.push(`<ul class="pdocs">${property.documents.map((d) => `<li><a href="${d.url}" target="_blank" rel="noopener">${d.label} ↗</a></li>`).join('')}</ul>`);
    }
    /* Sin inventar material que no existe: se dice qué falta y se ofrece pedirlo. */
    const pending = [
      !property.video && 'vídeo',
      !property.tour && 'tour 360',
      !property.floorplans.length && 'plano acotado',
      !property.documents.length && 'nota simple y documentación',
    ].filter(Boolean);

    return `
      <section class="section tight" id="media">
        <div class="wrap">
          <div class="head" data-reveal>
            <div class="eye">Media y documentación</div>
            <div><h2>Todo lo que se ve antes de visitar.</h2></div>
          </div>
          ${items.join('') || ''}
          ${pending.length ? `
            <div class="pmedia-pending">
              <div class="eye">Pendiente de producción</div>
              <p>De este inmueble todavía no están publicados: <strong>${pending.join(', ')}</strong>. Los preparamos a petición antes de la visita, sin compromiso.</p>
              <a class="btn green" href="${waLink}" target="_blank" rel="noopener">Pedir vídeo y plano ↗</a>
            </div>` : ''}
        </div>
      </section>`;
  };

  root.innerHTML = `
    <section class="phero">
      <div class="wrap">
        <nav class="pbread" aria-label="Migas de pan">
          <a href="index.html">Inicio</a> <span>·</span>
          <a href="properties.html">Properties</a> <span>·</span>
          <span>${property.zone}</span>
        </nav>
        <div class="phead">
          <div>
            <div class="eye">${property.status} · ${property.type} · Ref. ${property.ref}</div>
            <h1>${property.title}</h1>
            <p class="pplace">${property.address} · ${property.zone}, ${property.town}</p>
          </div>
          <div class="pprice">
            <strong>${euro(property.price)}</strong>
            <span>${perM2(property.pricePerM2)}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section tight" style="padding-top:0">
      <div class="wrap">
        ${gallery()}
        <div class="pquick">
          <div><small>Construidos</small><strong>${property.built} m²</strong></div>
          <div><small>Útiles</small><strong>${property.useful} m²</strong></div>
          <div><small>Dormitorios</small><strong>${property.beds}</strong></div>
          <div><small>Baños</small><strong>${property.baths}</strong></div>
          <div><small>Planta</small><strong>${property.floor.split(' ')[0]}</strong></div>
          <div><small>Año</small><strong>${property.year}</strong></div>
        </div>
      </div>
    </section>

    <section class="section tight">
      <div class="wrap pmain">
        <div class="pcol">
          <div class="eye">La propiedad</div>
          <h2 class="ph2">${property.highlight}</h2>
          ${property.description.map((p) => `<p>${p}</p>`).join('')}

          <h3 class="ph3">Características</h3>
          <ul class="ptags">
            ${[...property.features, ...property.equipment].map((f) => `<li>${f}</li>`).join('')}
          </ul>

          <h3 class="ph3">Ficha técnica</h3>
          <dl class="pspecs">
            ${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
          </dl>

          <div data-share></div>
        </div>

        <aside class="pside">
          <div class="pcard-side">
            <div class="eye">Villa’s Intelligence</div>
            ${mk ? `
              <h3>${marketVerdict(mk.gap)[0]}</h3>
              <div class="pgap ${mk.gap < 0 ? 'is-under' : 'is-over'}">${mk.gap >= 0 ? '+' : ''}${mk.gap.toFixed(1)}%</div>
              <p class="muted">${marketVerdict(mk.gap)[1]}</p>
              <div class="pmini">
                <div><span>Este inmueble</span><b>${perM2(property.pricePerM2)}</b></div>
                <div><span>${mk.zone ? mk.zone.label : mk.town.name}</span><b>${perM2(mk.reference)}</b></div>
                <div><span>${mk.town.name} · escritura</span><b>${mk.town.notaria ? perM2(mk.town.notaria) : '—'}</b></div>
                <div><span>${mk.town.name} · 12 meses</span><b>${mk.town.var1a >= 0 ? '+' : ''}${mk.town.var1a}%</b></div>
              </div>
              <a class="eye plink" href="post-mapa-metro-cuadrado.html">Ver el mapa de precios ↗</a>
            ` : '<p class="muted">Sin referencia de mercado para esta zona.</p>'}
          </div>

          <div class="pcard-side pcta-side">
            <div class="eye">Hablar con un asesor</div>
            <h3>¿La vemos?</h3>
            <p class="muted">Te contamos lo que no está en el anuncio: estado real, comunidad, documentación y margen de negociación.</p>
            <a class="btn green" href="${waLink}" target="_blank" rel="noopener">WhatsApp ↗</a>
            <a class="btn" href="contact.html">Solicitar visita</a>
            <a class="btn" href="${property.url}" target="_blank" rel="noopener">Ver en idealista ↗</a>
          </div>
        </aside>
      </div>
    </section>

    <section class="section tight" id="ubicacion">
      <div class="wrap">
        <div class="head" data-reveal>
          <div class="eye">Ubicación</div>
          <div><h2>${property.zone}, ${property.town}.</h2><p class="muted">Zona aproximada: la dirección exacta se facilita en la visita.</p></div>
        </div>
        <div class="pmap" id="propertyMap" role="application" aria-label="Ubicación aproximada de ${property.zone}"></div>
      </div>
    </section>

    ${mediaBlock()}

    <section class="section tight">
      <div class="wrap">
        <div class="head" data-reveal>
          <div class="eye">Más inmuebles</div>
          <div><h2>Otras propiedades.</h2></div>
        </div>
        <div class="pothers">
          ${props.filter((p) => p.ref !== property.ref).slice(0, 4).map((p) => `
            <a class="pother" href="property.html?ref=${p.ref}">
              <div class="pother-img" style="background-image:url(${p.images[0]})"></div>
              <div class="pother-body">
                <div class="eye">${p.zone}</div>
                <h3>${p.title}</h3>
                <div class="pother-price">${euro(p.price)} · ${p.built} m²</div>
              </div>
            </a>`).join('')}
        </div>
      </div>
    </section>`;

  /* ---------- Lightbox ---------- */
  const lightbox = document.createElement('div');
  lightbox.className = 'plight';
  lightbox.innerHTML = `
    <button class="plight-close" type="button" aria-label="Cerrar">×</button>
    <button class="plight-prev" type="button" aria-label="Anterior">←</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="plight-next" type="button" aria-label="Siguiente">→</button>`;
  document.body.appendChild(lightbox);

  const img = lightbox.querySelector('img');
  /* Con src vacío el navegador reserva 0x0 y algunos hacen una petición inútil. */
  img.src = property.images[0];
  img.width = 1600; img.height = 1067;
  const caption = lightbox.querySelector('figcaption');
  let index = 0;

  const show = (i) => {
    index = (i + property.images.length) % property.images.length;
    img.src = property.images[index];
    img.alt = `${property.title}: foto ${index + 1} de ${property.images.length}`;
    caption.textContent = `${index + 1} / ${property.images.length} · ${property.zone}`;
  };
  const open = (i) => { show(i); lightbox.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
  const close = () => { lightbox.classList.remove('is-open'); document.body.style.overflow = ''; };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-index]');
    if (button) open(Number(button.dataset.index));
  });
  lightbox.querySelector('.plight-close').addEventListener('click', close);
  lightbox.querySelector('.plight-prev').addEventListener('click', () => show(index - 1));
  lightbox.querySelector('.plight-next').addEventListener('click', () => show(index + 1));
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'ArrowLeft') show(index - 1);
  });

  /* ---------- Mapa de ubicación (mismo Leaflet que el mapa de precios) ---------- */
  const mapEl = document.getElementById('propertyMap');
  const loadAsset = (kind, url) => new Promise((resolve, reject) => {
    const el = kind === 'css'
      ? Object.assign(document.createElement('link'), { rel: 'stylesheet', href: url })
      : Object.assign(document.createElement('script'), { src: url });
    el.onload = () => resolve(); el.onerror = () => reject(new Error(url));
    document.head.appendChild(el);
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      Promise.all([loadAsset('css', 'vendor/leaflet.css'), loadAsset('js', 'vendor/leaflet.js')])
        .then(() => {
          const map = window.L.map(mapEl, { scrollWheelZoom: false, attributionControl: true })
            .setView(property.coords, 15);
          window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
            maxZoom: 18,
          }).addTo(map);
          /* Círculo, no chincheta: la ubicación publicada es la zona. */
          window.L.circle(property.coords, {
            radius: 320, color: '#5f8075', weight: 1.4, fillColor: '#5f8075', fillOpacity: 0.22,
          }).addTo(map);
        })
        .catch(() => { mapEl.innerHTML = '<div class="map-fallback">El mapa no se ha podido cargar.</div>'; });
    });
  }, { rootMargin: '250px' });
  if (mapEl) observer.observe(mapEl);

  /* ---------- Datos estructurados para buscadores y asistentes ---------- */
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description[0],
    url: `${location.origin}${location.pathname}?ref=${property.ref}`,
    datePosted: '2026-08-18',
    image: property.images.slice(0, 6).map((src) => new URL(src, location.href).href),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'RealEstateAgent', name: "Villa's Properties", telephone: '+34667384965' },
    },
    about: {
      '@type': 'Apartment',
      name: property.title,
      numberOfRooms: property.beds,
      numberOfBathroomsTotal: property.baths,
      yearBuilt: property.year,
      floorSize: { '@type': 'QuantitativeValue', value: property.built, unitCode: 'MTK' },
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.town,
        addressRegion: 'Santa Cruz de Tenerife',
        addressCountry: 'ES',
      },
      geo: { '@type': 'GeoCoordinates', latitude: property.coords[0], longitude: property.coords[1] },
    },
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
})();
