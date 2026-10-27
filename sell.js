/* Villa's Properties — página de venta.
   La página se reescribe según el municipio del propietario: el argumento de
   venta no es un eslogan, son sus propios números. Todo sale de market-data.js.

   Es una página de captación: se enseña lo que juega a favor del que vende
   (revalorización y demanda), nunca la distancia anuncio/escritura
   (regla de Jose, 27-oct-2026). */
(() => {
  'use strict';

  const market = window.VP_MARKET || { meta: {}, municipios: {} };
  const TOWNS = market.municipios;
  const select = document.getElementById('sellTown');
  if (!select || !Object.keys(TOWNS).length) return;


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
      const pct = (v) => `${v > 0 ? '+' : ''}${String(v).replace('.', ',')}%`;

    /* Titular: lo que juega a favor del que vende. Nada de distancia anuncio/escritura
       (regla de Jose, 27-oct-2026: los datos enganchan, no asustan). */
    const sube = typeof town.var1a === 'number' && town.var1a > 0;
    const ventas = town.catastroCV ? `se vendieron <strong>${group(town.catastroCV)}</strong> viviendas en ${market.meta.dates?.catastro || 'el último año'}` : '';
    $('sellLedeDatos').innerHTML = sube
      ? `el metro cuadrado ha subido <strong>un ${pct(town.var1a).replace('+', '')}</strong> en el último año${ventas ? ` y ${ventas}` : ''}`
      : (ventas || `el precio medio publicado es de <strong>${perM2(town.eurM2)}</strong>`);

    /* Panel de contexto */
    const rows = [
      ['Oferta publicada', perM2(town.eurM2), `idealista ${market.meta.dates?.idealista || ''}`],
      ['Operaciones al año', town.catastroCV ? group(town.catastroCV) : '—', `Catastro ${market.meta.dates?.catastro || ''}`],
      ...(sube ? [['Doce meses', pct(town.var1a), 'sube']] : []),
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
    /* Si el precio no sube este mes, la tarjeta enseña el precio medio: nunca una bajada. */
    $('figSubeTag').textContent = sube ? 'Revalorización' : 'Precio medio';
    $('figSube').textContent = sube ? pct(town.var1a) : perM2(town.eurM2);
    $('figSubeTxt').textContent = sube
      ? 'Lo que ha subido el metro cuadrado en tu municipio en los últimos doce meses, según idealista.'
      : 'El precio medio que se publica hoy en tu municipio, según idealista.';
    $('figDemanda').textContent = town.catastroCV ? `${group(town.catastroCV)} ventas` : '—';

    $('sellFigNote').innerHTML = `En ${town.name}: precio de anuncio por microzona, de ${zones.length ? zones[zones.length - 1].label : 'la media'} a ${zones.length ? zones[0].label : 'la media'}; revalorización de idealista y compraventas del Catastro (${market.meta.dates?.catastro || ''}). Datos de ${market.meta.updated || 's/f'}.`;

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
