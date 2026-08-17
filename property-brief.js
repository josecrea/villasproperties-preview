(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const form = $('#briefForm');
  if (!form) return;
  const fields = ['briefType','briefBudget','briefZone','briefBeds','briefReturn','briefTimeline','briefMust','briefAvoid','briefName','briefContact'];
  const storageKey = 'vpPropertyBriefV2';
  const status = $('#briefStatus');
  const read = () => Object.fromEntries(fields.map(id => [id, $(`#${id}`)?.value || '']));
  const write = (data = {}) => fields.forEach(id => { const el = $(`#${id}`); if (el && data[id] !== undefined) el.value = data[id]; });
  const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(read())); } catch (_) {} };
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (saved) write(saved); } catch (_) {}
  form.addEventListener('input', persist); form.addEventListener('change', persist);
  form.addEventListener('submit', (event) => {
    event.preventDefault(); const data = read();
    if (!data.briefBudget || !data.briefZone || !data.briefContact) { status.textContent = 'Completa presupuesto, zona y un dato de contacto para cerrar el brief.'; return; }
    persist(); const objective = ({buy:'Compra', invest:'Inversión', offmarket:'Off-market'})[data.briefType] || data.briefType;
    status.innerHTML = `✓ Brief preparado: <strong>${objective}</strong> · hasta <strong>${Number(data.briefBudget).toLocaleString('es-ES')} €</strong> · <strong>${data.briefZone}</strong>. Guardado localmente; el siguiente paso será conectarlo al CRM/Back Office.`;
  });
  $('#briefReset')?.addEventListener('click', () => { try { localStorage.removeItem(storageKey); } catch (_) {} form.reset(); $('#briefBeds').value = '2'; status.textContent = 'Brief limpio. Ningún dato ha salido de este navegador.'; });
})();