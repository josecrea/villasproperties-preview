(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));
  const form = $('#briefForm');
  if (!form) return;

  /* atelier:villas-idiomas ronda 6 — el mensaje de WhatsApp y el resumen de
     #briefStatus llevaban las cadenas en español a fuego, compartidas por las
     6 islas. Mismo patrón que shell.js: por defecto (es o sin lang) el
     comportamiento es BYTE a BYTE el de antes. Los `name`/`value` de los
     campos y las claves de localStorage NO cambian: solo se traduce lo que
     el visitante lee. El importe tambien se formatea con el locale del
     idioma: 250000 se escribe «250.000» en es/nl/de, «250 000» en fr y
     «250,000» en en. Con lang="es" el locale sigue siendo es-ES, asi que el
     camino del espanol no cambia. */
  const LANG = (document.documentElement.getAttribute('lang') || 'es').toLowerCase();
  const I18N_BRIEF = {
    es: {
      objetivos: { buy: 'Comprar para vivir', invest: 'Invertir', offmarket: 'Off-market' },
      locale: 'es-ES',
      saludo: (nombre) => `Hola, os dejo mi brief de búsqueda${nombre ? ` — soy ${nombre}` : ''}.`,
      objetivo: 'Objetivo', presupuesto: 'Presupuesto máximo', zona: 'Zona',
      minimo: (beds, baths) => `Mínimo: ${beds} dorm. · ${baths} baños`,
      tipo: 'Tipo', vistas: 'Vistas', imprescindible: 'Imprescindible',
      rentabilidad: 'Rentabilidad objetivo', plazo: 'Plazo',
      otrosImprescindibles: 'Otros imprescindibles', descartar: 'A descartar', contacto: 'Contacto',
      faltan: 'Completa presupuesto, zona y un dato de contacto para cerrar el brief.',
      hasta: (importe) => `hasta ${importe} €`,
      dormBanos: (beds, baths) => `${beds} dorm. · ${baths} baños`,
      vistasResumen: (lista) => `vistas ${lista}`,
      enviado: (resumen) => `✓ Brief enviado: <strong>${resumen}</strong>. Se ha abierto WhatsApp con el mensaje: revísalo antes de darle a enviar.`,
      limpio: 'Brief limpio. Ningún dato ha salido de este navegador.',
    },
    nl: {
      objetivos: { buy: 'Kopen om te wonen', invest: 'Investeren', offmarket: 'Off-market' },
      locale: 'nl-NL',
      saludo: (nombre) => `Hallo, hier is mijn zoekprofiel${nombre ? ` — ik ben ${nombre}` : ''}.`,
      objetivo: 'Doel', presupuesto: 'Maximaal budget', zona: 'Zone',
      minimo: (beds, baths) => `Minimum: ${beds} slaapk. · ${baths} badk.`,
      tipo: 'Type', vistas: 'Uitzicht', imprescindible: 'Moet absoluut hebben',
      rentabilidad: 'Doelrendement', plazo: 'Termijn',
      otrosImprescindibles: 'Andere vereisten', descartar: 'Uitsluiten', contacto: 'Contact',
      faltan: 'Vul budget, zone en een contactgegeven in om het brief af te sluiten.',
      hasta: (importe) => `tot ${importe} €`,
      dormBanos: (beds, baths) => `${beds} slaapk. · ${baths} badk.`,
      vistasResumen: (lista) => `uitzicht ${lista}`,
      enviado: (resumen) => `✓ Brief verzonden: <strong>${resumen}</strong>. WhatsApp is geopend met het bericht: controleer het voordat u op verzenden klikt.`,
      limpio: 'Brief gewist. Er is geen gegeven uit deze browser verstuurd.',
    },
    fr: {
      objetivos: { buy: 'Acheter pour y vivre', invest: 'Investir', offmarket: 'Off-market' },
      locale: 'fr-FR',
      saludo: (nombre) => `Bonjour, voici mon brief de recherche${nombre ? ` — je suis ${nombre}` : ''}.`,
      objetivo: 'Objectif', presupuesto: 'Budget maximum', zona: 'Zone',
      minimo: (beds, baths) => `Minimum : ${beds} ch. · ${baths} sdb.`,
      tipo: 'Type', vistas: 'Vue', imprescindible: 'Indispensable',
      rentabilidad: 'Rendement cible', plazo: 'Délai',
      otrosImprescindibles: 'Autres indispensables', descartar: 'À exclure', contacto: 'Contact',
      faltan: 'Complétez le budget, la zone et un contact pour finaliser le brief.',
      hasta: (importe) => `jusqu'à ${importe} €`,
      dormBanos: (beds, baths) => `${beds} ch. · ${baths} sdb.`,
      vistasResumen: (lista) => `vue ${lista}`,
      enviado: (resumen) => `✓ Brief envoyé : <strong>${resumen}</strong>. WhatsApp s'est ouvert avec le message : vérifiez-le avant de l'envoyer.`,
      limpio: 'Brief effacé. Aucune donnée n\'a quitté ce navigateur.',
    },
    it: {
      objetivos: { buy: 'Comprare per viverci', invest: 'Investire', offmarket: 'Off-market' },
      locale: 'it-IT',
      saludo: (nombre) => `Ciao, ecco il mio brief di ricerca${nombre ? ` — sono ${nombre}` : ''}.`,
      objetivo: 'Obiettivo', presupuesto: 'Budget massimo', zona: 'Zona',
      minimo: (beds, baths) => `Minimo: ${beds} camere · ${baths} bagni`,
      tipo: 'Tipo', vistas: 'Vista', imprescindible: 'Indispensabile',
      rentabilidad: 'Rendimento obiettivo', plazo: 'Tempistica',
      otrosImprescindibles: 'Altri requisiti', descartar: 'Da escludere', contacto: 'Contatto',
      faltan: 'Completa budget, zona e un contatto per chiudere il brief.',
      hasta: (importe) => `fino a ${importe} €`,
      dormBanos: (beds, baths) => `${beds} camere · ${baths} bagni`,
      vistasResumen: (lista) => `vista ${lista}`,
      enviado: (resumen) => `✓ Brief inviato: <strong>${resumen}</strong>. Si è aperto WhatsApp con il messaggio: controllalo prima di inviarlo.`,
      limpio: 'Brief svuotato. Nessun dato ha lasciato questo browser.',
    },
    en: {
      objetivos: { buy: 'Buy to live in', invest: 'Invest', offmarket: 'Off-market' },
      locale: 'en-GB',
      saludo: (nombre) => `Hi, here's my search brief${nombre ? ` — I'm ${nombre}` : ''}.`,
      objetivo: 'Goal', presupuesto: 'Maximum budget', zona: 'Zone',
      minimo: (beds, baths) => `Minimum: ${beds} bed · ${baths} bath`,
      tipo: 'Type', vistas: 'Views', imprescindible: 'Must-have',
      rentabilidad: 'Target return', plazo: 'Timeline',
      otrosImprescindibles: 'Other must-haves', descartar: 'To rule out', contacto: 'Contact',
      faltan: 'Complete budget, zone and a contact detail to close the brief.',
      hasta: (importe) => `up to ${importe} €`,
      dormBanos: (beds, baths) => `${beds} bed · ${baths} bath`,
      vistasResumen: (lista) => `views ${lista}`,
      enviado: (resumen) => `✓ Brief sent: <strong>${resumen}</strong>. WhatsApp has opened with the message: review it before hitting send.`,
      limpio: 'Brief cleared. No data has left this browser.',
    },
    de: {
      objetivos: { buy: 'Kaufen zum Wohnen', invest: 'Investieren', offmarket: 'Off-market' },
      locale: 'de-DE',
      saludo: (nombre) => `Hallo, hier ist mein Suchprofil${nombre ? ` — ich bin ${nombre}` : ''}.`,
      objetivo: 'Ziel', presupuesto: 'Maximales Budget', zona: 'Zone',
      minimo: (beds, baths) => `Minimum: ${beds} Schlafz. · ${baths} Bäder`,
      tipo: 'Typ', vistas: 'Aussicht', imprescindible: 'Unverzichtbar',
      rentabilidad: 'Zielrendite', plazo: 'Zeitrahmen',
      otrosImprescindibles: 'Weitere Anforderungen', descartar: 'Auszuschließen', contacto: 'Kontakt',
      faltan: 'Vervollständigen Sie Budget, Zone und einen Kontakt, um das Suchprofil abzuschließen.',
      hasta: (importe) => `bis zu ${importe} €`,
      dormBanos: (beds, baths) => `${beds} Schlafz. · ${baths} Bäder`,
      vistasResumen: (lista) => `Aussicht ${lista}`,
      enviado: (resumen) => `✓ Suchprofil gesendet: <strong>${resumen}</strong>. WhatsApp wurde mit der Nachricht geöffnet: bitte vor dem Senden prüfen.`,
      limpio: 'Suchprofil gelöscht. Keine Daten haben diesen Browser verlassen.',
    },
  };
  const T = I18N_BRIEF[LANG] || I18N_BRIEF.es;

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

  /* OBJETIVOS en español: el "asunto" del lead que va a VPLead/Odoo es un
     campo interno que lee el equipo (habla español), no el visitante. Se deja
     siempre en español a propósito para no tocar el formato que consume Odoo;
     lo que el visitante lee (mensaje de WhatsApp y resumen) usa T.objetivos. */
  const OBJETIVOS = { buy: 'Comprar para vivir', invest: 'Invertir', offmarket: 'Off-market' };

  /* El brief se compone como lo escribiría una persona, no como un volcado de
     formulario: quien lo recibe tiene que poder leerlo de un vistazo y contestar. */
  const componerMensaje = (d) => {
    const l = [];
    l.push(T.saludo(d.briefName));
    l.push('');
    l.push(`${T.objetivo}: ${T.objetivos[d.briefType] || d.briefType}`);
    l.push(`${T.presupuesto}: ${Number(d.briefBudget).toLocaleString(T.locale)} €`);
    l.push(`${T.zona}: ${d.briefZone}`);
    l.push(T.minimo(d.briefBeds || 0, d.briefBaths || 0));
    if (d.briefTipo.length) l.push(`${T.tipo}: ${d.briefTipo.join(', ')}`);
    if (d.briefVistas.length) l.push(`${T.vistas}: ${d.briefVistas.join(', ')}`);
    if (d.briefExtras.length) l.push(`${T.imprescindible}: ${d.briefExtras.join(', ')}`);
    if (d.briefReturn) l.push(`${T.rentabilidad}: ${d.briefReturn} %`);
    if (d.briefTimeline) l.push(`${T.plazo}: ${d.briefTimeline}`);
    if (d.briefMust) l.push(`${T.otrosImprescindibles}: ${d.briefMust}`);
    if (d.briefAvoid) l.push(`${T.descartar}: ${d.briefAvoid}`);
    if (d.briefContact) l.push(`${T.contacto}: ${d.briefContact}`);
    return l.join('\n');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const d = read();
    if (!d.briefBudget || !d.briefZone || !d.briefContact) {
      status.textContent = T.faltan;
      return;
    }
    persist();

    /* Se abre en el WhatsApp del visitante y no se envía por detrás: así ve
       exactamente qué manda y a quién, y esta web —que es estática— no tiene
       que guardar datos de nadie ni pedir un servidor que no existe. */
    const mensaje = componerMensaje(d);

    /* El lead entra en Odoo aunque el visitante no llegue a pulsar enviar en
       WhatsApp: es justo el caso en el que hoy se perdía. */
    if (window.VPLead) {
      const c = VPLead.repartirContacto(d.briefContact);
      VPLead.enviar({
        asunto: `Brief de búsqueda · ${OBJETIVOS[d.briefType] || d.briefType} · ${d.briefZone}`,
        nombre: d.briefName,
        email: c.email,
        telefono: c.telefono,
        descripcion: mensaje,
        honeypot: document.querySelector('#vp_hp')?.value,
      });
    }

    const url = `https://api.whatsapp.com/send/?phone=${WA}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener');

    const resumen = [
      T.objetivos[d.briefType] || d.briefType,
      T.hasta(Number(d.briefBudget).toLocaleString(T.locale)),
      d.briefZone,
      T.dormBanos(d.briefBeds || 0, d.briefBaths || 0),
    ];
    if (d.briefTipo.length) resumen.push(d.briefTipo.join(' / '));
    if (d.briefVistas.length) resumen.push(T.vistasResumen(d.briefVistas.join(' / ').toLowerCase()));
    /* El resumen incluye texto que ha escrito el visitante —la zona, su nombre—,
       así que va escapado antes de tocar innerHTML. Sin esto, escribir una
       etiqueta en el campo "zona" la ejecutaba: XSS comprobado con
       <img src=x onerror=...>. Y el brief se guarda en localStorage y se
       restaura al volver, así que el payload persistía entre visitas. */
    const E = (t) => (window.VPSafe ? VPSafe.esc(t) : String(t ?? '')
      .replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
    status.innerHTML = T.enviado(resumen.map(E).join('</strong> · <strong>'));
  });

  $('#briefReset')?.addEventListener('click', () => {
    try { localStorage.removeItem(storageKey); } catch (_) {}
    form.reset();
    $$('input[type="checkbox"]', form).forEach((el) => { el.checked = false; });
    const beds = $('#briefBeds'); if (beds) beds.value = '2';
    const baths = $('#briefBaths'); if (baths) baths.value = '1';
    status.textContent = T.limpio;
  });
})();
