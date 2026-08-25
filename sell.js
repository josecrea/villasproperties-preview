/* Villa's Properties — página de venta.
   La página se reescribe según el municipio del propietario: el argumento de
   venta no es un eslogan, son sus propios números. Todo sale de market-data.js.

   Con diferencias extremas entre oferta y escritura (San Miguel, Santiago del
   Teide, por encima del 35%) no se muestra el importe: ese hueco refleja mezcla
   de producto y pocas operaciones, no lo que se paga por una vivienda. */
(() => {
  'use strict';

  const market = window.VP_MARKET || { meta: {}, municipios: {} };
  const TOWNS = market.municipios;
  const select = document.getElementById('sellTown');
  if (!select || !Object.keys(TOWNS).length) return;

  const GAP_MAX = 0.35;
  const REALISTIC = [0.85, 0.9];

  const $ = (id) => document.getElementById(id);
  const perM2 = (v) => `${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €/m²`;
  const group = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  /* Arona por defecto: es el municipio con más operaciones del sur. */
  const DEFAULT = 'arona';
  select.innerHTML = Object.entries(TOWNS)
    .map(([key, t]) => `<option value="${key}"${key === DEFAULT ? ' selected' : ''}>${t.name}</option>`)
    .join('');

  const label = $('sellTownLabel');

  const render = (key) => {
    const town = TOWNS[key];
    if (!town) return;
    /* El <select> nativo toma el ancho de su opción más larga y descuadraba la
       frase: se pinta el nombre como texto y el control va encima, invisible. */
    if (label) label.textContent = town.name;
    const ratio = town.notaria && town.eurM2 ? town.notaria / town.eurM2 : null;
    const gap = ratio ? (1 - ratio) * 100 : null;
    const extreme = gap !== null && gap / 100 > GAP_MAX;

    /* Titular */
    $('sellGap').textContent = gap === null ? 'por debajo' : `un ${gap.toFixed(1).replace('.', ',')}%`;

    /* Panel de contexto */
    const rows = [
      ['Oferta publicada', perM2(town.eurM2), `idealista ${market.meta.dates?.idealista || ''}`],
      ['Escritura real', town.notaria ? perM2(town.notaria) : '—', 'precio escriturado'],
      ['Operaciones al año', town.catastroCV ? group(town.catastroCV) : '—', `Catastro ${market.meta.dates?.catastro || ''}`],
      ['Doce meses', `${town.var1a >= 0 ? '+' : ''}${String(town.var1a).replace('.', ',')}%`, town.var1a >= 0 ? 'sube' : 'baja'],
    ];
    $('sellTicker').innerHTML = `
      <div class="eye">${town.name} · hoy</div>
      <dl class="sell-ticker-list">
        ${rows.map(([k, v, src]) => `<div><dt>${k}</dt><dd>${v}<small>${src}</small></dd></div>`).join('')}
      </dl>`;

    /* Las tres cifras, en €/m² para que se puedan comparar entre sí */
    const zones = [...(town.zonas || [])].sort((a, b) => b.eurM2 - a.eurM2);
    const top = zones.length ? zones[0].eurM2 : town.eurM2;
    const low = zones.length ? zones[zones.length - 1].eurM2 : town.eurM2;

    $('figAnuncio').textContent = zones.length
      ? `${perM2(low)} – ${perM2(top)}`
      : perM2(town.eurM2);
    $('figSalida').textContent = `${perM2(town.eurM2 * REALISTIC[0])} – ${perM2(town.eurM2 * REALISTIC[1])}`;
    $('figEscritura').textContent = town.notaria ? perM2(town.notaria) : '—';

    $('sellFigNote').innerHTML = extreme
      ? `En ${town.name} la distancia entre oferta y escritura supera el ${Math.round(gap)}%: una diferencia así refleja mezcla de producto y pocas operaciones, no lo que se paga por una vivienda como la tuya. Aquí el número se revisa caso a caso. Datos de ${market.meta.updated || 's/f'}.`
      : `Precios por metro cuadrado en ${town.name}. El rango de anuncio recorre sus microzonas, de ${zones.length ? zones[zones.length - 1].label : 'la media'} a ${zones.length ? zones[0].label : 'la media'}. Datos de ${market.meta.updated || 's/f'}.`;

    /* Microzonas del municipio */
    $('sellZones').innerHTML = zones.length
      ? zones.map((z, i) => `
          <div class="sell-zone" style="--i:${i}">
            <span class="sell-zone-name">${z.label}</span>
            <span class="sell-zone-bar"><i style="--w:${Math.round((z.eurM2 / top) * 100)}%"></i></span>
            <b>${perM2(z.eurM2)}</b>
          </div>`).join('')
      : `<p class="muted">Sin desglose por zona publicado para ${town.name}.</p>`;
  };

  select.addEventListener('change', () => render(select.value));
  render(DEFAULT);
})();
