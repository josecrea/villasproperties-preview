/* Villa's Properties — página de compra.
   La herramienta contrasta el precio de CUALQUIER anuncio del sur contra el
   €/m² real de su microzona y contra la escritura del municipio. Todo se
   calcula en el navegador: no se envía ni se guarda nada.

   Igual que en el valorador, con distancias oferta/escritura superiores al 35%
   (San Miguel, Santiago del Teide) no se traduce a euros: ese hueco refleja
   mezcla de producto y pocas operaciones. */
(() => {
  'use strict';

  const market = window.VP_MARKET || { meta: {}, municipios: {} };
  const TOWNS = market.municipios;
  const townSel = document.getElementById('buyTown');
  if (!townSel || !Object.keys(TOWNS).length) return;

  const GAP_MAX = 0.35;
  const $ = (id) => document.getElementById(id);
  const perM2 = (v) => `${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €/m²`;
  const group = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const euro = (v) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(v / 500) * 500);

  const entries = Object.entries(TOWNS);
  const allZones = entries.flatMap(([, t]) => (t.zonas || []).map((z) => ({ ...z, town: t.name })));

  /* ---------- Cabecera: el sur en cuatro cifras ---------- */
  const ops = entries.reduce((sum, [, t]) => sum + (t.catastroCV || 0), 0);
  const sorted = [...allZones].sort((a, b) => b.eurM2 - a.eurM2);
  const weighted = entries.reduce((sum, [, t]) => sum + (t.notaria && t.eurM2 ? (1 - t.notaria / t.eurM2) * (t.catastroCV || 0) : 0), 0) / (ops || 1);

  $('buyOps').innerHTML = `${group(ops)}<small>Catastro ${market.meta.dates?.catastro || ''}</small>`;
  $('buyZones').innerHTML = `${allZones.length}<small>microzonas</small>`;
  $('buySpread').innerHTML = `${(sorted[0].eurM2 / sorted[sorted.length - 1].eurM2).toFixed(2).replace('.', ',')}×<small>${sorted[0].label} / ${sorted[sorted.length - 1].label}</small>`;
  $('buyGap').innerHTML = `−${(weighted * 100).toFixed(1).replace('.', ',')}%<small>ponderado</small>`;

  /* ---------- Selectores ---------- */
  townSel.innerHTML = entries.map(([key, t]) => `<option value="${key}"${key === 'arona' ? ' selected' : ''}>${t.name}</option>`).join('');
  const zoneSel = $('buyZone');

  const fillZones = (key) => {
    const zones = TOWNS[key]?.zonas || [];
    zoneSel.innerHTML = `<option value="">Media del municipio</option>`
      + zones.map((z) => `<option value="${z.id}">${z.label}</option>`).join('');
    zoneSel.disabled = !zones.length;
  };

  /* ---------- Contraste ---------- */
  const verdict = (diff) => {
    if (diff <= -10) return ['is-good', 'Por debajo de su zona', 'El precio publicado ya parte por debajo de la referencia. Merece una comprobación del estado y de la documentación: a veces el descuento tiene motivo.'];
    if (diff < 5) return ['is-fair', 'En línea con su zona', 'El precio encaja con lo que se publica en esa microzona. El margen saldrá del estado real, de la documentación y de la prisa del vendedor.'];
    if (diff < 15) return ['is-warn', 'Por encima de su zona', 'Se pide por encima de la referencia. Para pagarlo hace falta algo que lo justifique: reforma, planta, vistas o una calidad que no se repita en el edificio.'];
    return ['is-bad', 'Muy por encima de su zona', 'La diferencia es grande. O el inmueble tiene algo excepcional y comprobable, o el precio está pensado para negociarse.'];
  };

  const render = () => {
    const key = townSel.value;
    const town = TOWNS[key];
    const zone = (town.zonas || []).find((z) => z.id === zoneSel.value) || null;
    const price = Number($('buyPrice').value);
    const sqm = Number($('buySqm').value);
    const out = $('buyResult');

    if (!price || !sqm || sqm < 15) {
      out.innerHTML = '<p class="muted">Introduce precio y superficie para contrastar.</p>';
      return;
    }

    const askM2 = price / sqm;
    const ref = zone ? zone.eurM2 : town.eurM2;
    const diff = ((askM2 / ref) - 1) * 100;
    const [cls, title, text] = verdict(diff);

    const deedRatio = town.notaria && town.eurM2 ? town.notaria / town.eurM2 : null;
    const extreme = deedRatio && (1 - deedRatio) > GAP_MAX;
    const deedPrice = deedRatio && !extreme ? price * deedRatio : null;

    out.innerHTML = `
      <div class="buy-verdict ${cls}">
        <div class="eye">${zone ? zone.label : town.name}</div>
        <h3>${title}</h3>
        <div class="buy-diff">${diff >= 0 ? '+' : ''}${diff.toFixed(1).replace('.', ',')}%</div>
        <p>${text}</p>
      </div>
      <div class="buy-numbers">
        <div><span>Este anuncio</span><b>${perM2(askM2)}</b></div>
        <div><span>${zone ? 'Su microzona' : 'Media del municipio'}</span><b>${perM2(ref)}</b></div>
        <div><span>${town.name} · escritura</span><b>${town.notaria ? perM2(town.notaria) : '—'}</b></div>
        <div><span>${town.name} · 12 meses</span><b>${town.var1a >= 0 ? '+' : ''}${String(town.var1a).replace('.', ',')}%</b></div>
      </div>
      <p class="buy-deed">${extreme
        ? `En ${town.name} la distancia entre lo publicado y lo escriturado supera el ${Math.round((1 - deedRatio) * 100)}%. Un hueco así refleja mezcla de producto y pocas operaciones, no un descuento disponible: aquí el número se revisa caso a caso.`
        : deedPrice
          ? `Aplicando la distancia media entre anuncio y escritura de ${town.name}, una operación como esta se movería en torno a <strong>${euro(deedPrice)}</strong>. Es una referencia de negociación, no una tasación.`
          : 'Sin dato de escritura publicado para este municipio.'}</p>
      <p class="sell-note">Precios de oferta de idealista (${market.meta.dates?.idealista || ''}) y valor de escritura del Portal Estadístico del Notariado. Datos de ${market.meta.updated || 's/f'}. Orientativo: no sustituye una tasación ni una visita.</p>`;
  };

  /* ---------- Margen por municipio ---------- */
  const margins = entries
    .map(([, t]) => ({ name: t.name, gap: t.notaria && t.eurM2 ? (1 - t.notaria / t.eurM2) * 100 : null, ops: t.catastroCV || 0 }))
    .filter((m) => m.gap !== null)
    .sort((a, b) => a.gap - b.gap);
  const maxGap = Math.max(...margins.map((m) => m.gap));

  $('buyMargins').innerHTML = margins.map((m, i) => `
    <div class="sell-zone" style="--i:${i}">
      <span class="sell-zone-name">${m.name}</span>
      <span class="sell-zone-bar"><i style="--w:${Math.round((m.gap / maxGap) * 100)}%"></i></span>
      <b>−${m.gap.toFixed(1).replace('.', ',')}%</b>
    </div>`).join('');

  $('buyMarginNote').textContent = 'San Miguel de Abona y Santiago del Teide superan el 50%: ahí la diferencia no es margen de negociación, es que lo que se anuncia y lo que se escritura no son el mismo producto. Se revisa caso a caso.';

  /* ---------- Eventos ---------- */
  townSel.addEventListener('change', () => { fillZones(townSel.value); render(); });
  ['buyZone', 'buyPrice', 'buySqm'].forEach((id) => $(id).addEventListener('input', render));
  zoneSel.addEventListener('change', render);

  fillZones(townSel.value);
  render();
})();
