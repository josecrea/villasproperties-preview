(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const form = $('#financeLab');
  const out = $('#financeResult');
  if (!form || !out) return;
  const money = (n) => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
  const pct = (n) => `${Number.isFinite(n)?n.toFixed(1):'0.0'}%`;
  function payment(principal, annualRate, years){ const months=Math.max(1,Math.round(years*12)); const r=Math.max(0,annualRate)/100/12; if(!r)return principal/months; return principal*r/(1-Math.pow(1+r,-months)); }
  /* Se puede llegar aquí desde la ficha de un inmueble con su precio ya en la
     URL: la calculadora arranca con ese número puesto y no hay que teclearlo.
     Se valida antes de usarlo — es un parámetro público y entra cualquiera. */
  (function () {
    try {
      var p = Number(new URLSearchParams(location.search).get('precio'));
      if (p > 0 && p < 100000000) {
        var campo = document.querySelector('#fPrice');
        if (campo) campo.value = String(Math.round(p));
      }
    } catch (e) { /* sin parámetro, la calculadora arranca con su valor por defecto */ }
  })();

  function render(){ const price=Number($('#fPrice').value||0); const equity=Number($('#fEquity').value||0); const rate=Number($('#fRate').value||0); const years=Number($('#fYears').value||0); const income=Number($('#fIncome').value||0); const debt=Number($('#fDebt').value||0); const loan=Math.max(0,price-equity); const monthly=payment(loan,rate,years); const effort=income>0?(monthly+debt)/income*100:0; const ltv=price>0?loan/price*100:0; const signal=effort<=30?'Comfortable':effort<=35?'Watch':'High'; out.innerHTML=`<div class="eye">FINANCE LAB · ORIENTATIVE</div><div class="dashtitle">Buying<br>power.</div><div class="metrics"><div class="metric"><small>Loan</small><strong>${money(loan)}</strong></div><div class="metric"><small>Monthly payment</small><strong>${money(monthly)}</strong></div><div class="metric"><small>Loan / price</small><strong>${pct(ltv)}</strong></div><div class="metric"><small>Effort ratio</small><strong>${pct(effort)}</strong></div></div><div class="eye" style="margin-top:18px">Signal · ${signal} · prototype only</div>`; }
  form.addEventListener('input',render); form.addEventListener('change',render); render();
})();