(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));
  const form = $('#briefForm');
  if (!form) return;

  const fields = ['briefType', 'briefBudget', 'briefZone', 'briefBeds', 'briefBaths',
    'briefReturn', 'briefTimeline', 'briefMust', 'briefAvoid', 'briefName', 'briefContact'];
  /* Los grupos de casillas van aparte: no tienen un value único sino una lista. */
  const grupos = {
    briefTipo: 'Tipo de propiedad',
    briefVistas: 'Vistas',
    briefExtras: 'Imprescindible',
  };
  const storageKey = 'vpPropertyBriefV3';   // V3: el brief cambió de campos
  const status = $('#briefStatus');
  const WA = '34667384965';

  const marcadas = (nombre) => $$(`input[name="${nombre}"]:checked`)
    .map((el) => el.parentElement.textContent.trim());

  const read = () => {
    const d = Object.fromEntries(fields.map((id) => [id, $(`#${id}`)?.value || '']));
    Object.keys(grupos).forEach((g) => { d[g] = marcadas(g); });
    return d;
  };

  const write = (data = {}) => {
    fields.forEach((id) => { const el = $(`#${id}`); if (el && data[id] !== undefined) el.value = data[id]; });
    Object.keys(grupos).forEach((g) => {
      const guardadas = data[g] || [];
      $$(`input[name="${g}"]`).forEach((el) => {
        el.checked = guardadas.indexOf(el.parentElement.textContent.trim()) !== -1;
      });
    });
  };

  const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(read())); } catch (_) {} };
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (saved) write(saved); } catch (_) {}
  form.addEventListener('input', persist);
  form.addEventListener('change', persist);

  const OBJETIVOS = { buy: 'Comprar para vivir', invest: 'Invertir', offmarket: 'Off-market' };

  /* El brief se compone como lo escribiría una persona, no como un volcado de
     formulario: quien lo recibe tiene que poder leerlo de un vistazo y contestar. */
  const componerMensaje = (d) => {
    const l = [];
    l.push(`Hola, os dejo mi brief de búsqueda${d.briefName ? ` — soy ${d.briefName}` : ''}.`);
    l.push('');
    l.push(`Objetivo: ${OBJETIVOS[d.briefType] || d.briefType}`);
    l.push(`Presupuesto máximo: ${Number(d.briefBudget).toLocaleString('es-ES')} €`);
    l.push(`Zona: ${d.briefZone}`);
    l.push(`Mínimo: ${d.briefBeds || 0} dorm. · ${d.briefBaths || 0} baños`);
    if (d.briefTipo.length) l.push(`Tipo: ${d.briefTipo.join(', ')}`);
    if (d.briefVistas.length) l.push(`Vistas: ${d.briefVistas.join(', ')}`);
    if (d.briefExtras.length) l.push(`Imprescindible: ${d.briefExtras.join(', ')}`);
    if (d.briefReturn) l.push(`Rentabilidad objetivo: ${d.briefReturn} %`);
    if (d.briefTimeline) l.push(`Plazo: ${d.briefTimeline}`);
    if (d.briefMust) l.push(`Otros imprescindibles: ${d.briefMust}`);
    if (d.briefAvoid) l.push(`A descartar: ${d.briefAvoid}`);
    if (d.briefContact) l.push(`Contacto: ${d.briefContact}`);
    return l.join('\n');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const d = read();
    if (!d.briefBudget || !d.briefZone || !d.briefContact) {
      status.textContent = 'Completa presupuesto, zona y un dato de contacto para cerrar el brief.';
      return;
    }
    persist();

    /* Se abre en el WhatsApp del visitante y no se envía por detrás: así ve
       exactamente qué manda y a quién, y esta web —que es estática— no tiene
       que guardar datos de nadie ni pedir un servidor que no existe. */
    const url = `https://api.whatsapp.com/send/?phone=${WA}&text=${encodeURIComponent(componerMensaje(d))}`;
    window.open(url, '_blank', 'noopener');

    const resumen = [
      OBJETIVOS[d.briefType] || d.briefType,
      `hasta ${Number(d.briefBudget).toLocaleString('es-ES')} €`,
      d.briefZone,
      `${d.briefBeds || 0} dorm. · ${d.briefBaths || 0} baños`,
    ];
    if (d.briefTipo.length) resumen.push(d.briefTipo.join(' / '));
    if (d.briefVistas.length) resumen.push(`vistas ${d.briefVistas.join(' / ').toLowerCase()}`);
    status.innerHTML = `✓ Brief enviado: <strong>${resumen.join('</strong> · <strong>')}</strong>.`
      + ' Se ha abierto WhatsApp con el mensaje: revísalo antes de darle a enviar.';
  });

  $('#briefReset')?.addEventListener('click', () => {
    try { localStorage.removeItem(storageKey); } catch (_) {}
    form.reset();
    $$('input[type="checkbox"]', form).forEach((el) => { el.checked = false; });
    const beds = $('#briefBeds'); if (beds) beds.value = '2';
    const baths = $('#briefBaths'); if (baths) baths.value = '1';
    status.textContent = 'Brief limpio. Ningún dato ha salido de este navegador.';
  });
})();
