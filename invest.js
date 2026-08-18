/* Villa's Properties — página de inversión.
   La pieza central es la matriz precio × liquidez: cada municipio del sur
   situado por lo que cuesta entrar (€/m² de oferta) y por cuántas compraventas
   se firman al año. Es el gráfico que explica por qué "caro" y "vendible" no
   son lo mismo. Se dibuja en SVG con los datos de market-data.js. */
(() => {
  'use strict';

  const market = window.VP_MARKET || { meta: {}, municipios: {} };
  const TOWNS = market.municipios;
  const plot = document.getElementById('invPlot');
  if (!plot || !Object.keys(TOWNS).length) return;

  const $ = (id) => document.getElementById(id);
  const group = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const perM2 = (v) => `${group(v)} €/m²`;

  const towns = Object.entries(TOWNS).map(([key, t]) => ({ key, ...t }));
  const ops = towns.reduce((s, t) => s + (t.catastroCV || 0), 0);
  const busiest = [...towns].sort((a, b) => b.catastroCV - a.catastroCV)[0];

  $('invOps').textContent = group(ops);

  $('invTicker').innerHTML = [
    ['Compraventas al año', group(ops), `Catastro ${market.meta.dates?.catastro || ''}`],
    ['Municipio más líquido', busiest.name, `${Math.round((busiest.catastroCV / ops) * 100)}% del total`],
    ['Más caro', [...towns].sort((a, b) => b.eurM2 - a.eurM2)[0].name, perM2([...towns].sort((a, b) => b.eurM2 - a.eurM2)[0].eurM2)],
    ['Más asequible', [...towns].sort((a, b) => a.eurM2 - b.eurM2)[0].name, perM2([...towns].sort((a, b) => a.eurM2 - b.eurM2)[0].eurM2)],
  ].map(([k, v, s]) => `<div><dt>${k}</dt><dd>${v}<small>${s}</small></dd></div>`).join('');

  /* ---------- Matriz ---------- */
  const W = 720;
  const H = 470;
  const PAD = { l: 58, r: 26, t: 26, b: 52 };
  const xs = towns.map((t) => t.eurM2);
  const ys = towns.map((t) => t.catastroCV);
  const xMin = Math.min(...xs) * 0.9;
  const xMax = Math.max(...xs) * 1.06;
  const yMax = Math.max(...ys) * 1.28;   /* aire arriba: la etiqueta del punto más alto chocaba con el rótulo del cuadrante */

  const px = (v) => PAD.l + ((v - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);
  const py = (v) => H - PAD.b - (v / yMax) * (H - PAD.t - PAD.b);
  /* El radio comunica la variación a 12 meses: crecer no es lo mismo que caer. */
  const r = (t) => 9 + Math.min(Math.abs(t.var1a || 0), 11) * 1.1;

  const midX = px((xMin + xMax) / 2);
  const midY = py(yMax / 2);

  plot.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="inv-svg" preserveAspectRatio="xMidYMid meet">
      <!-- cuadrantes -->
      <rect x="${PAD.l}" y="${PAD.t}" width="${midX - PAD.l}" height="${midY - PAD.t}" class="inv-q inv-q1"/>
      <rect x="${midX}" y="${PAD.t}" width="${W - PAD.r - midX}" height="${midY - PAD.t}" class="inv-q inv-q2"/>
      <text x="${PAD.l + 12}" y="${PAD.t + 20}" class="inv-qlabel">Asequible y líquido</text>
      <text x="${W - PAD.r - 12}" y="${PAD.t + 20}" class="inv-qlabel" text-anchor="end">Caro y líquido</text>
      <text x="${PAD.l + 12}" y="${H - PAD.b - 12}" class="inv-qlabel">Asequible y seco</text>
      <text x="${W - PAD.r - 12}" y="${H - PAD.b - 12}" class="inv-qlabel" text-anchor="end">Caro y seco</text>

      <!-- ejes -->
      <line x1="${PAD.l}" y1="${H - PAD.b}" x2="${W - PAD.r}" y2="${H - PAD.b}" class="inv-axis"/>
      <line x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${H - PAD.b}" class="inv-axis"/>
      <text x="${W - PAD.r}" y="${H - PAD.b + 34}" class="inv-axis-label" text-anchor="end">€/m² de oferta →</text>
      <text x="${PAD.l - 40}" y="${PAD.t + 4}" class="inv-axis-label">operaciones</text>

      ${towns.map((t) => `
        <g class="inv-dot" data-town="${t.key}" tabindex="0" role="button"
           aria-label="${t.name}: ${perM2(t.eurM2)} y ${group(t.catastroCV)} operaciones al año">
          <circle cx="${px(t.eurM2).toFixed(1)}" cy="${py(t.catastroCV).toFixed(1)}" r="42" class="inv-hit"/>
          <circle cx="${px(t.eurM2).toFixed(1)}" cy="${py(t.catastroCV).toFixed(1)}" r="${r(t).toFixed(1)}"
                  class="inv-mark ${t.var1a >= 0 ? 'is-up' : 'is-down'}"/>
          <text x="${px(t.eurM2).toFixed(1)}" y="${(py(t.catastroCV) - r(t) - 9 < PAD.t + 30
            ? py(t.catastroCV) + r(t) + 16
            : py(t.catastroCV) - r(t) - 9).toFixed(1)}" text-anchor="middle">${t.name}</text>
        </g>`).join('')}
    </svg>`;

  /* ---------- Lectura del municipio ---------- */
  const readings = {
    'arona': 'El mercado profundo del sur: cuatro de cada diez operaciones. Precio intermedio, dirección a favor y muchas microzonas distintas dentro del mismo municipio. Es donde más fácil resulta salir.',
    'adeje': 'Caro y con volumen: el segundo mercado del sur y el que menos margen deja al negociar (la escritura solo pierde un 6,6% frente al anuncio). Aquí se compra por demanda sostenida, no por descuento.',
    'granadilla': 'El ticket de entrada más bajo del sur con un volumen respetable. El precio está plano en doce meses: liquidez sin revalorización, por ahora.',
    'san-miguel': 'El que más sube (+10,2%) con precio todavía intermedio. Volumen modesto: entra bien, pero la salida hay que planificarla.',
    'guia-isora': 'El caso que hay que mirar con lupa: segundo más caro, último en volumen y el único que cae en doce meses. No es mala compra por definición, pero el plazo de salida es largo y el margen debe cubrirlo.',
    'santiago-teide': 'Mercado pequeño y homogéneo: entre Los Gigantes y Puerto de Santiago solo hay 1,19 veces de diferencia. Sube, pero con 630 operaciones al año la salida depende de encontrar a tu comprador.',
  };

  const show = (key) => {
    const t = TOWNS[key];
    if (!t) return;
    const share = ((t.catastroCV / ops) * 100).toFixed(1).replace('.', ',');
    $('invRead').innerHTML = `
      <div class="eye">${t.name}</div>
      <div class="inv-read-grid">
        <div><small>Entrada</small><b>${perM2(t.eurM2)}</b></div>
        <div><small>Operaciones</small><b>${group(t.catastroCV)}</b></div>
        <div><small>Cuota del sur</small><b>${share}%</b></div>
        <div><small>12 meses</small><b class="${t.var1a >= 0 ? 'is-up' : 'is-down'}">${t.var1a >= 0 ? '+' : ''}${String(t.var1a).replace('.', ',')}%</b></div>
      </div>
      <p>${readings[key] || ''}</p>
      <a class="eye plink" href="post-donde-se-vende-de-verdad.html">Ver el análisis de liquidez ↗</a>`;
    plot.querySelectorAll('.inv-dot').forEach((g) => g.classList.toggle('is-on', g.dataset.town === key));
  };

  plot.addEventListener('click', (e) => {
    const g = e.target.closest('.inv-dot');
    if (g) show(g.dataset.town);
  });
  plot.addEventListener('keydown', (e) => {
    const g = e.target.closest('.inv-dot');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(g.dataset.town); }
  });

  show('arona');
})();
