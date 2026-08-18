/* Villa's Properties — capacidad de compra.
   Todo se calcula en el navegador; no se envía ni se guarda nada.

   Los criterios de partida (35% de esfuerzo, 80% de financiación) son los que
   la banca suele aplicar, y son EDITABLES: aquí no se afirma ninguna norma. El
   porcentaje de impuestos y gastos también, porque depende del tipo de vivienda
   y de la situación de cada comprador: la página remite a la gestoría en vez de
   publicar un tipo impositivo sin fuente.

   El techo de precio sale del menor de dos límites:
     · lo que el banco presta según la cuota que puedes pagar;
     · lo que tu ahorro cubre entre entrada y gastos. */
(() => {
  'use strict';

  const form = document.getElementById('finForm');
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const num = (id) => Number($(id).value) || 0;
  const euro = (v) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  const euroRound = (v) => euro(Math.floor(v / 1000) * 1000);

  /* Cuota de un préstamo francés → principal máximo para una cuota dada. */
  const principalFor = (payment, monthlyRate, months) =>
    (monthlyRate === 0 ? payment * months : payment * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);

  const market = window.VP_MARKET || { municipios: {} };
  const towns = Object.values(market.municipios || {});

  const render = () => {
    const income = num('finIncome');
    const debt = num('finDebt');
    const savings = num('finSavings');
    const years = Math.max(5, num('finYears'));
    const rate = num('finRate') / 100;
    const effort = num('finEffort') / 100;
    const ltv = num('finLtv') / 100;
    const costs = num('finCosts') / 100;

    const out = $('finResult');
    if (!income) {
      out.innerHTML = '<p class="muted">Introduce tus ingresos para calcular la capacidad.</p>';
      return;
    }

    const payment = Math.max(0, income * effort - debt);
    const months = years * 12;
    const loan = principalFor(payment, rate / 12, months);

    const byBank = ltv > 0 ? loan / ltv : 0;            // techo por financiación
    const bySavings = savings / ((1 - ltv) + costs);     // techo por ahorro disponible
    const price = Math.max(0, Math.min(byBank, bySavings));
    const limited = byBank <= bySavings ? 'financiación' : 'ahorro';

    const entry = price * (1 - ltv);
    const fees = price * costs;
    const spare = savings - entry - fees;
    const totalPaid = payment * months;

    /* Qué compra ese techo: municipios donde entra una vivienda de 90 m². */
    const fits = towns
      .filter((t) => t.eurM2 && price >= t.eurM2 * 90)
      .map((t) => t.name);

    out.innerHTML = `
      <div class="buy-verdict ${price > 0 ? 'is-fair' : 'is-bad'}">
        <div class="eye">Precio máximo de compra</div>
        <div class="buy-diff">${euroRound(price)}</div>
        <p>Tu techo lo marca ${limited === 'financiación'
          ? 'la <b>cuota que puedes pagar</b>: con más ahorro no subirías, necesitarías más ingreso o más plazo.'
          : 'tu <b>ahorro disponible</b>: el banco te acompañaría más arriba, pero la entrada y los gastos no llegan.'}</p>
      </div>

      <div class="buy-numbers">
        <div><span>Cuota máxima</span><b>${euro(payment)}/mes</b></div>
        <div><span>Préstamo</span><b>${euroRound(loan)}</b></div>
        <div><span>Entrada (${Math.round((1 - ltv) * 100)}%)</span><b>${euroRound(entry)}</b></div>
        <div><span>Impuestos y gastos (${(costs * 100).toLocaleString('es-ES')}%)</span><b>${euroRound(fees)}</b></div>
      </div>

      <div class="fin-bar" aria-hidden="true">
        <i class="fin-bar-loan" style="--w:${(loan / (price || 1) * 100).toFixed(1)}%"></i>
        <i class="fin-bar-entry" style="--w:${(entry / (price || 1) * 100).toFixed(1)}%"></i>
      </div>
      <p class="fin-legend"><span class="is-loan"></span> Préstamo &nbsp;·&nbsp; <span class="is-entry"></span> Tu entrada</p>

      <p class="buy-deed">
        ${spare >= 0
          ? `Después de la entrada y los gastos te quedarían <strong>${euroRound(spare)}</strong> de colchón. Conviene no dejarlo a cero: la mudanza, los suministros y los primeros arreglos se pagan igual.`
          : `Con este precio te faltarían <strong>${euroRound(Math.abs(spare))}</strong> para cubrir entrada y gastos. Baja el precio objetivo o suma ahorro antes de firmar arras.`}
      </p>
      ${fits.length ? `<p class="buy-deed">Con ese techo, una vivienda de 90 m² a precio medio entra en: <strong>${fits.join(', ')}</strong>.</p>` : ''}

      <p class="sell-note">Pagarías ${euroRound(totalPaid)} en ${years} años a un ${(rate * 100).toLocaleString('es-ES')}% de interés (${euroRound(totalPaid - loan)} de intereses si el tipo se mantiene). Cálculo orientativo con criterios editables: no es una oferta bancaria, ni una FEIN, ni una aprobación de riesgo. El porcentaje de impuestos y gastos debe confirmarlo tu gestoría.</p>`;

    $('finTicker').innerHTML = [
      ['Precio máximo', euroRound(price), `lo limita tu ${limited}`],
      ['Cuota', `${euro(payment)}`, 'al mes'],
      ['Entrada + gastos', euroRound(entry + fees), 'de tu ahorro'],
      ['Plazo', `${years} años`, `${(rate * 100).toLocaleString('es-ES')}% de interés`],
    ].map(([k, v, s]) => `<div><dt>${k}</dt><dd>${v}<small>${s}</small></dd></div>`).join('');
  };

  form.addEventListener('input', render);
  render();
})();
