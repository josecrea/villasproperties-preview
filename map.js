/* Villa's Properties — mapa de precios de Tenerife Sur (Leaflet + OpenStreetMap).
   Leaflet y la geometría solo se descargan cuando el mapa entra en pantalla.
   Los datos salen de window.VP_MARKET (market-data.js), igual que el valorador. */
(() => {
  'use strict';

  const container = document.getElementById('priceMap');
  if (!container) return;

  const market = window.VP_MARKET || { meta: { dates: {} }, municipios: {} };
  const TOWNS = market.municipios;
  const DATES = market.meta.dates || {};

  /* Nombre del municipio en geo-tenerife-sur.js → clave de VP_MARKET */
  const GEO_KEYS = {
    'Adeje': 'adeje',
    'Arona': 'arona',
    'Granadilla de Abona': 'granadilla',
    'San Miguel de Abona': 'san-miguel',
    'Guía de Isora': 'guia-isora',
    'Santiago del Teide': 'santiago-teide',
  };

  /* Posición de la etiqueta cuando el centroide provoca solapes. */
  const CHIP_POS = {
    granadilla: [28.115, -16.485],
    'san-miguel': [28.0, -16.605],
    arona: [28.045, -16.71],
  };

  const STYLE_BASE = { color: '#5f8075', weight: 1.3, opacity: 0.8, fillColor: '#5f8075', fillOpacity: 0.16 };
  const STYLE_HOVER = { fillColor: '#c9ad95', fillOpacity: 0.34, weight: 2 };
  const STYLE_ON = { color: '#20242a', fillColor: '#c9ad95', fillOpacity: 0.46, weight: 2.2 };

  const perM2 = (value) => `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €/m²`;
  const delta = (pct) => `${pct > 0 ? '+' : ''}${pct.toLocaleString('es-ES')}%`;

  const loadAsset = (kind, url) => new Promise((resolve, reject) => {
    const el = kind === 'css'
      ? Object.assign(document.createElement('link'), { rel: 'stylesheet', href: url })
      : Object.assign(document.createElement('script'), { src: url });
    el.onload = () => resolve(url);
    el.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
    document.head.appendChild(el);
  });

  const panel = document.getElementById('mapPanel');

  const renderPanel = (key) => {
    const town = TOWNS[key];
    if (!panel || !town) return;
    const zonas = [...(town.zonas || [])].sort((a, b) => b.eurM2 - a.eurM2);
    const maxZone = zonas.length ? zonas[0].eurM2 : town.eurM2;
    panel.innerHTML = `
      <header class="mp-head">
        <div>
          <div class="eye">${town.var1a >= 0 ? 'Sube' : 'Baja'} ${delta(town.var1a)} · 12 meses</div>
          <h3>${town.name}</h3>
          <p class="mp-price">${perM2(town.eurM2)}</p>
        </div>
        <button type="button" class="btn green mp-cta" data-town="${key}">Valorar aquí ↗</button>
      </header>
      <div class="mp-sources">
        <div><span>idealista</span><b>${perM2(town.eurM2)}</b><small>${DATES.idealista || ''}</small></div>
        <div><span>Escritura</span><b>${town.notaria ? perM2(town.notaria) : '—'}</b><small>precio escriturado</small></div>
        <div><span>Operaciones</span><b>${town.catastroCV ? String(town.catastroCV).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '—'}</b><small>Catastro ${DATES.catastro || ''}</small></div>
      </div>
      <ul class="mp-zones">
        ${zonas.map((z) => `<li><span>${z.label}</span><i><b style="width:${Math.round((z.eurM2 / maxZone) * 100)}%"></b></i><em>${perM2(z.eurM2)}</em></li>`).join('')}
      </ul>
      <footer class="mp-foot">Precio medio de oferta por zona · idealista ${DATES.idealista || ''}</footer>`;

    const cta = panel.querySelector('.mp-cta');
    cta.addEventListener('click', () => {
      /* En el valorador rellenamos el wizard; fuera de él, navegamos con preset. */
      const select = document.getElementById('vMunicipality');
      if (select) {
        select.value = key;
        select.dispatchEvent(new Event('change'));
        document.getElementById('valorador')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        location.href = `valuation.html?municipio=${key}`;
      }
    });
  };

  const initMap = () => {
    if (typeof window.L === 'undefined' || typeof window.GEO_SUR === 'undefined') return;

    const map = window.L.map(container, {
      scrollWheelZoom: false,
      fadeAnimation: false,
      zoomControl: true,
      attributionControl: true,
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 14,
      minZoom: 9,
    }).addTo(map);

    const layers = {};
    const chips = {};
    const bounds = [];

    const select = (key) => {
      container.dataset.selected = key;
      Object.entries(layers).forEach(([k, layer]) => layer.setStyle(k === key ? STYLE_ON : STYLE_BASE));
      Object.entries(chips).forEach(([k, chip]) => {
        chip.getElement()?.querySelector('.map-chip-in')?.classList.toggle('is-on', k === key);
      });
      renderPanel(key);
    };

    Object.entries(window.GEO_SUR).forEach(([geoName, info]) => {
      const key = GEO_KEYS[geoName];
      const town = TOWNS[key];
      if (!town) return;

      const layer = window.L.geoJSON({ type: 'Feature', geometry: info.geojson }, { style: STYLE_BASE }).addTo(map);
      layers[key] = layer;
      bounds.push(layer.getBounds());

      const chip = window.L.marker(CHIP_POS[key] || [info.lat, info.lon], {
        icon: window.L.divIcon({
          className: 'map-chip',
          html: `<div class="map-chip-in"><b>${town.name}</b><span>${perM2(town.eurM2)}</span></div>`,
          iconSize: [0, 0],
        }),
        keyboard: false,
      }).addTo(map);
      chips[key] = chip;

      layer.on('click', () => select(key));
      chip.on('click', () => select(key));
      layer.on('mouseover', () => { if (container.dataset.selected !== key) layer.setStyle(STYLE_HOVER); });
      layer.on('mouseout', () => { if (container.dataset.selected !== key) layer.setStyle(STYLE_BASE); });
    });

    const all = bounds.reduce((acc, b) => (acc ? acc.extend(b) : window.L.latLngBounds(b)), null);
    /* Las etiquetas de precio sobresalen del contorno: más aire en pantallas
       estrechas para que no se corten contra el borde del mapa. */
    const padFor = () => (window.innerWidth < 700 ? 0.3 : 0.1);
    const fit = () => { if (all) map.fitBounds(all.pad(padFor())); };
    fit();

    /* Pantalla completa: el wrap se mueve a <body> porque un ancestro con
       transform (los reveals de motion.js) rompería position:fixed. */
    const wrap = container.closest('.pricemap-wrap');
    const expand = document.getElementById('mapExpand');
    const placeholder = document.createComment('pricemap');
    const setExpanded = (expanded) => {
      if (!wrap || !expand) return;
      if (expanded) {
        wrap.parentNode.insertBefore(placeholder, wrap);
        document.body.appendChild(wrap);
      } else if (placeholder.parentNode) {
        placeholder.parentNode.insertBefore(wrap, placeholder);
        placeholder.remove();
      }
      wrap.classList.toggle('is-expanded', expanded);
      document.body.style.overflow = expanded ? 'hidden' : '';
      expand.textContent = expanded ? '✕ Cerrar' : '⤢ Ampliar';
      setTimeout(() => { map.invalidateSize(); fit(); }, 60);
    };
    if (expand && wrap) {
      expand.addEventListener('click', () => setExpanded(!wrap.classList.contains('is-expanded')));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && wrap.classList.contains('is-expanded')) setExpanded(false);
      });
    }

    const preset = new URLSearchParams(location.search).get('municipio');
    select(TOWNS[preset] ? preset : 'adeje');
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      Promise.all([loadAsset('css', 'vendor/leaflet.css'), loadAsset('js', 'vendor/leaflet.js')])
        .then(() => loadAsset('js', 'assets/geo-tenerife-sur.js'))
        .then(initMap)
        .catch((error) => {
          console.warn('[mapa] no disponible:', error);
          container.innerHTML = '<div class="map-fallback">El mapa no se ha podido cargar. Los datos por municipio siguen disponibles en el valorador.</div>';
        });
    });
  }, { rootMargin: '260px' });
  observer.observe(container);
})();
