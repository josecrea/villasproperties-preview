/* Villa's Properties V2 — Valorador gratis (Tenerife Sur).
   Motor de estimación sobre datos reales de mercado (window.VP_MARKET, generado
   desde la fuente única de la verdad de precios). Tres decisiones de producto:

   1. No inventamos una cifra donde no hay dato → abstención honesta.
   2. La horquilla se ensancha cuanta menos evidencia hay (villa, sin zona).
   3. Separamos precio de ANUNCIO de salida REALISTA y de valor de ESCRITURA.
*/
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '34667384965';
  const market = window.VP_MARKET || { meta: { dates: {} }, municipios: {} };
  const TOWNS = market.municipios;
  const DATES = market.meta.dates || {};

  const TYPE_LABEL = { piso: 'Piso / apartamento', casa: 'Casa / chalet', villa: 'Villa', otro: 'Terreno u otro' };
  const CONDITION_FACTOR = { reformar: 0.82, bueno: 1, reformado: 1.12, premium: 1.28 };
  const CONDITION_LABEL = { reformar: 'A reformar', bueno: 'Buen estado', reformado: 'Reformado', premium: 'Calidades premium' };
  const FEATURES = [
    { id: 'terrace', label: 'Terraza', factor: 0.04 },
    { id: 'elevator', label: 'Ascensor', factor: 0.03 },
    { id: 'seaView', label: 'Vistas al mar', factor: 0.12 },
    { id: 'parking', label: 'Garaje', factor: 0.05 },
  ];
  const SURFACE_MIN = 15;
  const SURFACE_MAX = 2000;
  /* Diferencia habitual entre precio de anuncio y salida realista (10-15%). */
  const REALISTIC_LOW = 0.85;
  const REALISTIC_HIGH = 0.9;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const form = $('#vpValuation');
  if (!form) return;

  const euro = (value) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
      .format(Math.round(value / 1000) * 1000);
  /* es-ES no agrupa miles en cifras de 4 dígitos ("4607"); forzamos "4.607". */
  const perM2 = (value) => `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €/m²`;
  const delta = (pct) => `${pct > 0 ? '+' : ''}${pct.toLocaleString('es-ES')}%`;
  const groupThousands = (value) => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  /* ---------- Estado y navegación del wizard ---------- */
  let estimate = null;

  const goToStep = (step) => {
    $$('.vw-step', form).forEach((panel) => panel.classList.toggle('is-active', panel.dataset.step === String(step)));
    $$('.vw-dot').forEach((dot) => {
      const n = Number(dot.dataset.step);
      dot.classList.toggle('is-on', step === 'done' || n <= Number(step));
    });
    const anchor = $('#valorador');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const setError = (id, message) => {
    const slot = $(`[data-error-for="${id}"]`);
    const input = $(`#${id}`);
    if (slot) slot.textContent = message || '';
    if (input) input.classList.toggle('is-invalid', Boolean(message));
  };
  const clearErrors = (ids) => ids.forEach((id) => setError(id, ''));

  /* ---------- Municipio → zonas ---------- */
  const townSelect = $('#vMunicipality');
  const zoneSelect = $('#vZone');

  const populateTowns = () => {
    townSelect.innerHTML = '<option value="">Selecciona municipio</option>'
      + Object.entries(TOWNS).map(([key, t]) => `<option value="${key}">${t.name}</option>`).join('')
      + '<option value="otro">Otro municipio de Tenerife</option>';
  };

  const populateZones = (key) => {
    const town = TOWNS[key];
    const zones = town ? town.zonas || [] : [];
    zoneSelect.innerHTML = `<option value="">${zones.length ? 'Media del municipio' : 'Sin zonas disponibles'}</option>`
      + zones.map((z) => `<option value="${z.id}">${z.label} · ${perM2(z.eurM2)}</option>`).join('');
    zoneSelect.disabled = !zones.length;
  };

  populateTowns();
  populateZones('');
  townSelect.addEventListener('change', () => {
    setError('vMunicipality', '');
    populateZones(townSelect.value);
    renderTownPreview(townSelect.value);
  });

  /* El mapa y las landings enlazan con ?municipio=<clave>: llegan con el
     municipio ya decidido, no se lo volvemos a preguntar. */
  const preset = new URLSearchParams(location.search).get('municipio');
  if (preset && TOWNS[preset]) {
    townSelect.value = preset;
    populateZones(preset);
  }

  /* Vista previa del municipio en el propio paso 1: el dato antes de pedir nada. */
  const preview = $('#vTownPreview');
  const renderTownPreview = (key) => {
    const town = TOWNS[key];
    if (!preview) return;
    if (!town) {
      preview.innerHTML = '<div class="eye">Mercado</div><p class="muted">Elige municipio y verás su dato de mercado antes de continuar.</p>';
      return;
    }
    const rows = [
      ['Oferta idealista', perM2(town.eurM2)],
      town.notaria ? ['Escritura · Notariado', perM2(town.notaria)] : null,
      town.var1a !== null && town.var1a !== undefined ? ['12 meses', delta(town.var1a)] : null,
      town.catastroCV ? ['Compraventas / año', groupThousands(town.catastroCV)] : null,
    ].filter(Boolean);
    preview.innerHTML = `<div class="eye">${town.name}</div><div class="vw-preview-grid">${
      rows.map(([label, value]) => `<div><small>${label}</small><strong>${value}</strong></div>`).join('')
    }</div>`;
  };
  renderTownPreview(townSelect.value);

  /* ---------- Lectura del formulario ---------- */
  const readInput = () => {
    const key = townSelect.value;
    const town = TOWNS[key] || null;
    const zone = town ? (town.zonas || []).find((z) => z.id === zoneSelect.value) || null : null;
    return {
      type: ($('input[name="vType"]:checked') || {}).value || 'piso',
      municipality: key,
      town,
      zone,
      address: $('#vAddress').value.trim(),
      surface: Number($('#vSurface').value),
      bedrooms: $('#vBedrooms').value,
      condition: $('#vCondition').value,
      features: FEATURES.filter((f) => $(`#${f.id}`).checked),
    };
  };

  /* ---------- Motor ---------- */
  const typeFactor = (town, type) => {
    /* La base zonal refleja sobre todo piso. Para casa/villa usamos la relación
       casa/piso real del municipio (RealAdvisor), acotada para no dispararse. */
    if (type === 'piso') return 1;
    const ratio = town.piso && town.casa ? Math.min(Math.max(town.casa / town.piso, 0.9), 1.3) : 1.08;
    return type === 'villa' ? ratio * 1.28 : ratio;
  };

  /* Horquilla honesta: más ancha cuanta menos evidencia. Un ±7% aparentaría una
     precisión que un dato de media de mercado no tiene. */
  const spreadFor = (data) => {
    if (data.type === 'villa') return 0.18;
    if (!data.zone) return 0.15;
    return 0.10;
  };

  const abstainReason = (data) => {
    if (!data.town) return 'municipio';
    if (data.type === 'otro') return 'tipo';
    return null;
  };

  const compute = (data) => {
    const reason = abstainReason(data);
    if (reason) return { ...data, abstain: true, reason };

    const town = data.town;
    const baseM2 = data.zone ? data.zone.eurM2 : town.eurM2;
    const featureBoost = data.features.reduce((sum, f) => sum + f.factor, 0);
    const appliedM2 = baseM2 * typeFactor(town, data.type) * CONDITION_FACTOR[data.condition] * (1 + featureBoost);

    const mid = appliedM2 * data.surface;
    const spread = spreadFor(data);
    const low = mid * (1 - spread);
    /* La salida realista nunca puede quedar por encima del suelo del rango de
       anuncio: con horquillas anchas (villa, sin zona) el -10/-15% sobre el
       centro se solapaba con el propio anuncio y contradecía la lectura. */
    const realisticHigh = Math.min(mid * REALISTIC_HIGH, low);
    const realisticLow = realisticHigh * (REALISTIC_LOW / REALISTIC_HIGH);
    /* Confianza honesta: nunca "alta". No hay backtest ni calibración; el badge
       solo refleja cuánto se ha podido afinar el dato de partida. */
    const confidence = data.type === 'villa'
      ? 'Requiere revisión'
      : (data.zone ? 'Afinada por zona' : 'Orientación amplia');

    /* Contraste de escritura: qué se firma de verdad en notaría frente a lo que
       se pide en el anuncio. Es la referencia que manda cuando hay que decidir. */
    const deedRatio = town.notaria && town.eurM2 ? town.notaria / town.eurM2 : null;

    return {
      ...data,
      baseM2,
      appliedM2,
      mid,
      low,
      high: mid * (1 + spread),
      realisticLow,
      realisticHigh,
      deedRatio,
      deedValue: deedRatio ? mid * deedRatio : null,
      confidence,
    };
  };

  /* ---------- Render del resultado ---------- */
  const referenceRows = (est) => {
    const town = est.town;
    const rows = [];
    if (est.zone) rows.push([`${est.zone.label} · zona`, perM2(est.zone.eurM2), 'idealista']);
    rows.push([`${town.name} · municipio`, perM2(town.eurM2), `idealista ${DATES.idealista || ''}`.trim()]);
    if (town.fc) rows.push([`${town.name} · pisos`, perM2(town.fc), `Fotocasa ${DATES.fotocasa || ''}`.trim()]);
    if (town.ra) rows.push([`${town.name} · mediana`, perM2(town.ra), `RealAdvisor ${DATES.realadvisor || ''}`.trim()]);
    if (town.notaria) rows.push([`${town.name} · escritura real`, perM2(town.notaria), 'Notariado']);
    if (town.catastro) rows.push([`${town.name} · referencia`, perM2(town.catastro), `Catastro ${DATES.catastro || ''}`.trim()]);
    if (town.var1a !== null && town.var1a !== undefined) rows.push(['Evolución 12 meses', delta(town.var1a), 'idealista']);
    return rows;
  };

  /* Barra de posición: dónde cae el €/m² aplicado dentro del rango de zonas del
     municipio. Sitúa la vivienda en su mercado, no en una media abstracta. */
  const zoneScale = (est) => {
    const zones = (est.town.zonas || []).slice().sort((a, b) => a.eurM2 - b.eurM2);
    if (zones.length < 2) return '';
    const min = zones[0].eurM2;
    const max = zones[zones.length - 1].eurM2;
    const clamp = Math.min(Math.max(est.appliedM2, min), max);
    const pos = ((clamp - min) / (max - min)) * 100;
    return `<div class="vw-scale">
      <div class="vw-scale-bar"><i style="left:${pos.toFixed(1)}%"></i></div>
      <div class="vw-scale-legend"><span>${zones[0].label} · ${perM2(min)}</span><span>${zones[zones.length - 1].label} · ${perM2(max)}</span></div>
    </div>`;
  };

  /* Contraste de escritura: bloque completo. Con diferencias extremas (San Miguel
     y Santiago del Teide superan el 50%) la cifra dejaría de significar lo que
     se paga por una vivienda como la tuya: lo que refleja es una mezcla de
     producto distinta y pocas operaciones. Ahí damos la señal, no el número. */
  const DEED_GAP_MAX = 0.35;

  const deedCard = (est) => {
    if (!est.deedRatio) {
      return '<strong>—</strong><p>Sin dato de escritura publicado para este municipio.</p>';
    }
    const gap = Math.round((1 - est.deedRatio) * 100);
    if (1 - est.deedRatio > DEED_GAP_MAX) {
      return `<strong>−${gap}%</strong><p>En ${est.town.name} la escritura media queda un ${gap}% por debajo de la oferta. Una diferencia así refleja mezcla de producto y pocas operaciones, no lo que se paga por una vivienda como la tuya: lo revisamos caso a caso.</p>`;
    }
    return `<strong>${euro(est.deedValue)}</strong><p>En ${est.town.name} lo que se firma en notaría está un <b>${gap}%</b> por debajo del precio medio de oferta. ${deedReading(est)}</p>`;
  };

  /* Lectura del contraste: dónde cae la escritura respecto a la banda de salida.
     Si queda por encima, el municipio aguanta precio y hay menos que ceder. */
  const deedReading = (est) => {
    if (est.deedValue > est.realisticHigh) return 'Aquí el mercado aguanta: la escritura queda por encima de tu banda de salida.';
    if (est.deedValue < est.realisticLow) return 'Aquí pesa la negociación: la escritura queda por debajo de tu banda de salida.';
    return 'Encaja dentro de tu banda de salida: es el terreno donde se cierra.';
  };

  const renderResult = (est) => {
    const out = $('#vResult');
    if (est.abstain) {
      const context = est.town && est.town.eurM2
        ? ` Como contexto, el residencial de ${est.town.name} ronda ${perM2(est.town.eurM2)}, pero un terreno o inmueble singular no se valora con un €/m² de vivienda.`
        : '';
      const body = est.reason === 'municipio'
        ? 'Trabajamos con datos reales de Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora y Santiago del Teide. Fuera de esa zona preferimos no inventar una cifra: un asesor local te prepara la valoración con criterio.'
        : `Un terreno o un inmueble singular necesita revisión local para darte una cifra fiable.${context}`;
      out.innerHTML = `<div class="vw-abstain">
        <div class="eye">Sin cifra automática</div>
        <h3>${est.reason === 'municipio' ? 'Tu municipio está fuera de nuestra zona de datos.' : 'No inventamos un precio para esta tipología.'}</h3>
        <p>${body}</p>
      </div>`;
      return;
    }

    out.innerHTML = `
      <div class="vw-result">
        <header class="vw-result-head">
          <div>
            <div class="eye">Rango de anuncio · ${est.confidence}</div>
            <div class="vw-range">${euro(est.low)} <span>–</span> ${euro(est.high)}</div>
            <p class="muted">${TYPE_LABEL[est.type]} · ${est.surface} m² · ${CONDITION_LABEL[est.condition]}${est.zone ? ` · ${est.zone.label}` : ` · ${est.town.name}`}</p>
          </div>
          <div class="vw-applied">
            <small>€/m² aplicado</small>
            <strong>${perM2(est.appliedM2)}</strong>
            <span>${est.zone ? `${est.zone.label} · dato zonal ajustado` : `${est.town.name} · media municipal ajustada`}</span>
          </div>
        </header>

        ${zoneScale(est)}

        <div class="vw-cards">
          <article class="vw-card">
            <div class="eye">Salida realista</div>
            <strong>${euro(est.realisticLow)} – ${euro(est.realisticHigh)}</strong>
            <p>El precio al que una vivienda como la tuya se mueve sin quemarse en el mercado. Entre un 10% y un 15% por debajo del anuncio.</p>
          </article>
          <article class="vw-card">
            <div class="eye">Contraste de escritura</div>
            ${deedCard(est)}
          </article>
          <article class="vw-card">
            <div class="eye">Qué falta para cerrar</div>
            <strong>Revisión local</strong>
            <p>Estado real, planta y orientación, licencias, comunidad, cargas y demanda efectiva de la microzona. Eso es lo que mueve el precio final.</p>
          </article>
        </div>

        <details class="vw-refs">
          <summary>Referencias de mercado usadas <span>+</span></summary>
          <div class="vw-refgrid">
            ${referenceRows(est).map(([label, value, source]) => `<div><span>${label}</span><b>${value}</b><small>${source}</small></div>`).join('')}
          </div>
          <p class="vw-note">Datos actualizados a ${market.meta.updated || 's/f'}. Estimación automática orientativa: no es una tasación homologada (ECO/805/2003) ni sustituye un ACM con visita.</p>
        </details>
      </div>`;
  };

  /* ---------- Validación y pasos ---------- */
  $('#vStep1Next').addEventListener('click', () => {
    clearErrors(['vMunicipality']);
    if (!townSelect.value) {
      setError('vMunicipality', 'Selecciona el municipio para continuar.');
      return;
    }
    goToStep(2);
  });

  $('#vStep2Back').addEventListener('click', () => goToStep(1));
  $('#vStep3Back').addEventListener('click', () => goToStep(2));

  $('#vCalculate').addEventListener('click', () => {
    const data = readInput();
    clearErrors(['vSurface']);
    if (!data.surface || data.surface < SURFACE_MIN || data.surface > SURFACE_MAX) {
      setError('vSurface', `Indica una superficie entre ${SURFACE_MIN} y ${SURFACE_MAX} m².`);
      return;
    }
    estimate = compute(data);
    renderResult(estimate);
    goToStep(3);
  });

  $('#vRestart')?.addEventListener('click', () => {
    form.reset();
    estimate = null;
    populateZones(townSelect.value);
    renderTownPreview('');
    clearErrors(['vMunicipality', 'vSurface', 'vName', 'vPhone', 'vPrivacy']);
    goToStep(1);
  });

  /* ---------- Lead ---------- */
  const isValidPhone = (value) => /^(\+?\d[\d\s.-]{7,14})$/.test(value.trim());

  const describe = (est) => {
    const lines = [
      `• Tipo: ${TYPE_LABEL[est.type]}`,
      `• Municipio: ${est.town ? est.town.name : 'Fuera de zona de datos'}${est.zone ? ` · ${est.zone.label}` : ''}${est.address ? ` (${est.address})` : ''}`,
      `• Superficie: ${est.surface} m² · ${est.bedrooms} hab. · ${CONDITION_LABEL[est.condition]}`,
      `• Extras: ${est.features.length ? est.features.map((f) => f.label).join(', ') : 'sin extras marcados'}`,
      '',
    ];
    if (est.abstain) {
      lines.push('Sin estimación automática: la tipología o la zona requieren revisión local.');
    } else {
      lines.push(
        `Rango de anuncio: ${euro(est.low)} – ${euro(est.high)}`,
        `Salida realista: ${euro(est.realisticLow)} – ${euro(est.realisticHigh)}`,
        `€/m² aplicado: ${perM2(est.appliedM2)}`,
      );
    }
    return lines.join('\n');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!estimate) {
      goToStep(1);
      return;
    }
    clearErrors(['vName', 'vPhone', 'vPrivacy']);
    const lead = {
      name: $('#vName').value.trim(),
      phone: $('#vPhone').value.trim(),
      email: $('#vEmail').value.trim(),
    };
    let ok = true;
    if (lead.name.length < 2) { setError('vName', 'Escribe tu nombre.'); ok = false; }
    if (!isValidPhone(lead.phone)) { setError('vPhone', 'Indica un teléfono válido.'); ok = false; }
    if (!$('#vPrivacy').checked) { setError('vPrivacy', 'Necesitamos tu consentimiento para enviarte la valoración.'); ok = false; }
    if (!ok) return;

    const message = [
      'Hola, quiero una valoración revisada de mi vivienda.',
      '',
      describe(estimate),
      '',
      `Mi nombre: ${lead.name}`,
      lead.email ? `Email: ${lead.email}` : null,
    ].filter((line) => line !== null).join('\n');

    /* window.open dentro del gesto del usuario: si no, el navegador lo bloquea. */
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    goToStep('done');
  });
})();
