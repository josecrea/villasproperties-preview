/* Villa's Properties — filtros y orden del catálogo.
   Trabaja sobre las tarjetas ya renderizadas por app.js (data-town, data-price,
   data-psm, data-beds): así la plantilla de la tarjeta vive en un solo sitio. */
(() => {
  'use strict';

  const grid = document.getElementById('catalogueGrid');
  if (!grid || !window.VP_PROPERTIES) return;

  const towns = [...new Set(window.VP_PROPERTIES.map((p) => p.town))].sort();

  const bar = document.createElement('div');
  bar.className = 'catfilters';
  bar.innerHTML = `
    <div class="catfilter">
      <label for="catTown">Municipio</label>
      <select id="catTown"><option value="">Todos</option>${towns.map((t) => `<option>${t}</option>`).join('')}</select>
    </div>
    <div class="catfilter">
      <label for="catBeds">Dormitorios</label>
      <select id="catBeds"><option value="">Cualquiera</option><option value="1">1 o más</option><option value="2">2 o más</option><option value="3">3 o más</option></select>
    </div>
    <div class="catfilter">
      <label for="catSort">Ordenar por</label>
      <select id="catSort">
        <option value="price-asc">Precio · de menor a mayor</option>
        <option value="price-desc">Precio · de mayor a menor</option>
        <option value="psm-asc">€/m² · de menor a mayor</option>
        <option value="psm-desc">€/m² · de mayor a menor</option>
      </select>
    </div>
    <div class="catcount" id="catCount"></div>`;
  grid.parentNode.insertBefore(bar, grid);

  const cards = () => [...grid.querySelectorAll('.property')];
  const count = document.getElementById('catCount');

  const apply = () => {
    const town = document.getElementById('catTown').value;
    const beds = Number(document.getElementById('catBeds').value || 0);
    const [key, dir] = document.getElementById('catSort').value.split('-');

    let visible = 0;
    cards().forEach((card) => {
      const okTown = !town || card.dataset.town === town;
      const okBeds = !beds || Number(card.dataset.beds) >= beds;
      const show = okTown && okBeds;
      card.hidden = !show;
      if (show) visible += 1;
    });

    const sorted = cards().sort((a, b) => {
      const va = Number(a.dataset[key === 'price' ? 'price' : 'psm']);
      const vb = Number(b.dataset[key === 'price' ? 'price' : 'psm']);
      return dir === 'asc' ? va - vb : vb - va;
    });
    sorted.forEach((card) => grid.appendChild(card));

    count.textContent = `${visible} ${visible === 1 ? 'inmueble' : 'inmuebles'}`;
  };

  bar.addEventListener('change', apply);
  apply();
})();
