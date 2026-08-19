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

  /* Fotos subidas desde el Back Office: se pintan como hueco y las rellena
     VPStore.hydrate() cuando IndexedDB responde. */
  const M = (src) => (window.VPStore ? VPStore.mediaSrc(src) : src);
  const A = (src) => (window.VPStore ? VPStore.mediaAttr(src) : '');
  /* El catálogo es contenido editable: todo lo que entre en el HTML se escapa. */
  const E = (v) => (window.VPSafe ? VPSafe.esc(v) : String(v ?? ''));
  const U = (v) => (window.VPSafe ? VPSafe.url(v) : String(v ?? ''));

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
        <img src="${U(M(property.images[0]))}"${A(property.images[0])} alt="${E(property.title)}, ${E(property.zone)}" width="1200" height="800" fetchpriority="high">
        <span class="pgal-count">1 / ${property.images.length}</span>
      </button>
      <div class="pgal-side">
        ${property.images.slice(1, 5).map((src, i) => `
          <button class="pgal-thumb" type="button" data-index="${i + 1}" aria-label="Ampliar foto ${i + 2}">
            <img src="${U(M(src))}"${A(src)} alt="${E(property.title)}: foto ${i + 2}" loading="lazy" width="600" height="400">
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

  /* El vídeo no vive en el repositorio (pesa demasiado para Pages): se aloja en
     Vimeo o YouTube y aquí solo se incrusta. Un .mp4 propio también vale. */
  const videoEmbed = (url) => {
    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
    if (vimeo) return `<div class="pmedia-frame"><iframe src="https://player.vimeo.com/video/${vimeo[1]}?dnt=1" title="Vídeo de ${property.title}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    if (yt) return `<div class="pmedia-frame"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Vídeo de ${property.title}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
    return `<video class="pmedia-video" src="${U(url)}" controls playsinline preload="none" poster="${M(property.images[0])}"></video>`;
  };

  /* ---------- El entorno, con datos comprobables ----------
     "Cerca de todos los servicios" lo escribe cualquier portal y no dice nada.
     Aquí cada servicio sale de OpenStreetMap con su distancia real y su nombre,
     para que quien lo lea pueda ir a mirarlo. Lo genera tools/build-nearby.cjs.

     Las coordenadas son de ZONA, no del portal exacto (no se publica la puerta
     del vendedor), así que las distancias son aproximadas y se dice. */
  const A_PIE_MIN = (m) => Math.max(1, Math.round(m / 75));   // ~4,5 km/h
  const dist = (m) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`.replace('.', ','));

  const entornoBlock = () => {
    const datos = (window.VP_NEARBY || {})[property.ref];
    const servicios = (datos && datos.servicios) || [];
    if (!servicios.length) return '';

    const radio = datos.radio || 1200;
    const por = (id) => servicios.find((s) => s.id === id);

    /* Las ventajas NO se redactan a mano: se deducen de lo que hay medido. Si el
       dato no está, la frase no aparece — antes que rellenar con humo. */
    const ventajas = [];
    const playa = por('playa');
    if (playa && playa.distancia <= 900) {
      ventajas.push(`Playa a ${dist(playa.distancia)}: unos ${A_PIE_MIN(playa.distancia)} min andando${playa.nombre ? ` (${playa.nombre})` : ''}.`);
    }
    const sup = por('supermercado');
    if (sup && sup.distancia <= 700) {
      ventajas.push(`Compra diaria resuelta a pie: ${sup.total} ${sup.total === 1 ? 'supermercado' : 'supermercados'} en ${dist(radio)}, el más cercano a ${dist(sup.distancia)}.`);
    }
    const far = por('farmacia'); const salud = por('salud');
    if (far && far.distancia <= 800) {
      ventajas.push(`Farmacia a ${dist(far.distancia)}${salud ? ` y centro médico a ${dist(salud.distancia)}` : ''}.`);
    }
    const bus = por('guagua');
    if (bus && bus.distancia <= 600) {
      ventajas.push(`Parada de guagua a ${dist(bus.distancia)}: se puede vivir aquí sin coche.`);
    }
    const col = por('colegio');
    if (col && col.distancia <= 1000) ventajas.push(`Colegio a ${dist(col.distancia)}.`);
    const rest = por('restauracion');
    if (rest && rest.total >= 5) {
      ventajas.push(`${rest.total} bares y restaurantes en el radio: zona viva todo el año, no solo en temporada.`);
    }

    const filas = servicios.map((s) => `
      <li class="pnear-item">
        <span class="pnear-cat">${E(s.etiqueta)}</span>
        <span class="pnear-d">${dist(s.distancia)}</span>
        <span class="pnear-n">${s.nombre ? E(s.nombre) : `${s.total} en ${dist(radio)}`}</span>
        <span class="pnear-t">${s.total} en ${dist(radio)}</span>
      </li>`).join('');

    return `
      <section class="section tight" id="entorno">
        <div class="wrap">
          <div class="head" data-reveal>
            <div class="eye">El entorno</div>
            <div>
              <h2>Qué tienes<br>alrededor.</h2>
              <p class="muted">Servicios medidos sobre el mapa en un radio de ${dist(radio)}, no adjetivos. Distancias en línea recta desde la zona del inmueble.</p>
            </div>
          </div>

          ${ventajas.length ? `
            <ul class="pventajas" data-reveal data-stagger-group>
              ${ventajas.map((v) => `<li>${v}</li>`).join('')}
            </ul>` : ''}

          <ul class="pnear" data-reveal data-stagger-group>${filas}</ul>

          <p class="pnear-fuente">Fuente: OpenStreetMap (© colaboradores, ODbL), consultado el ${(window.VP_NEARBY_FECHA || '2026-08-18')}. Si algo ha cambiado o falta, dínoslo y lo corregimos.</p>
        </div>
      </section>`;
  };

  const mediaBlock = () => {
    const items = [];
    if (property.video) items.push(videoEmbed(property.video));
    if (property.tour) items.push(`<a class="btn green" href="${U(property.tour)}" target="_blank" rel="noopener">Abrir tour 360 ↗</a>`);
    if (property.floorplans.length) {
      items.push(`<div class="pplans">${property.floorplans.map((f, i) => `<a href="${U(f)}" target="_blank" rel="noopener"><img src="${U(f)}" alt="Plano ${i + 1} de ${E(property.title)}" loading="lazy"></a>`).join('')}</div>`);
    }
    if (property.documents.length) {
      items.push(`<ul class="pdocs">${property.documents.map((d) => `<li><a href="${U(d.url)}" target="_blank" rel="noopener">${E(d.label)} ↗</a></li>`).join('')}</ul>`);
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
          <span>${E(property.zone)}</span>
        </nav>
        <div class="phead">
          <div>
            <div class="eye">${E(property.status)} · ${E(property.type)} · Ref. ${E(property.ref)}</div>
            <h1>${E(property.title)}</h1>
            <p class="pplace">${E(property.address)} · ${E(property.zone)}, ${E(property.town)}</p>
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
          <h2 class="ph2">${E(property.highlight)}</h2>
          ${property.description.map((t) => `<p>${E(t)}</p>`).join('')}

          <h3 class="ph3">Características</h3>
          <ul class="ptags">
            ${[...property.features, ...property.equipment].map((f) => `<li>${E(f)}</li>`).join('')}
          </ul>

          <h3 class="ph3">Ficha técnica</h3>
          <dl class="pspecs">
            ${specs.map(([k, v]) => `<div><dt>${E(k)}</dt><dd>${E(v)}</dd></div>`).join('')}
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
            <a class="btn green" href="${waLink}" target="_blank" rel="noopener">WhatsApp ↗</a><a class="btn" href="finance.html">Financiar esta compra</a>
            <a class="btn" href="contact.html">Solicitar visita</a>
            <a class="btn" href="${U(property.url)}" target="_blank" rel="noopener">Ver en idealista ↗</a>
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
        <div class="pmap" id="propertyMap" role="application" aria-label="Ubicación aproximada de ${E(property.zone)}"></div>
      </div>
    </section>

    ${entornoBlock()}

    ${mediaBlock()}

    <section class="section tight">
      <div class="wrap">
        <div class="head" data-reveal>
          <div class="eye">Más inmuebles</div>
          <div><h2>Otras propiedades.</h2></div>
        </div>
        <div class="pothers">
          ${props.filter((p) => p.ref !== property.ref).slice(0, 4).map((p) => `
            <a class="pother" href="property.html?ref=${encodeURIComponent(p.ref)}">
              <div class="pother-img" style="background-image:url(${U(M(p.images[0]))})"${A(p.images[0])}></div>
              <div class="pother-body">
                <div class="eye">${E(p.zone)}</div>
                <h3>${E(p.title)}</h3>
                <div class="pother-price">${euro(p.price)} · ${p.built} m²</div>
              </div>
            </a>`).join('')}
        </div>
      </div>
    </section>`;

  window.VPStore?.hydrate();

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
  img.src = M(property.images[0]);
  img.width = 1600; img.height = 1067;
  const caption = lightbox.querySelector('figcaption');
  let index = 0;

  const show = async (i) => {
    index = (i + property.images.length) % property.images.length;
    const src = property.images[index];
    img.src = window.VPStore && VPStore.isLocal(src) ? (await VPStore.urlFor(src.slice(8))) || M(src) : src;
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
  /* En móvil se pasan fotos deslizando, no buscando la flecha. */
  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 45) show(dx < 0 ? index + 1 : index - 1);
  }, { passive: true });

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
