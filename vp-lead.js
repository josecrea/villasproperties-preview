/* vp-lead.js — Crea el lead en Odoo desde una web estática.
 *
 * CÓMO FUNCIONA Y POR QUÉ ASÍ
 * ---------------------------
 * Odoo expone `/website/form/crm.lead` (módulo website_crm, ya instalado en
 * VILLVERG18). Acepta un POST de formulario sin autenticación y sin token
 * CSRF, y devuelve el id del lead creado. Verificado contra producción: creó
 * el lead 772 y luego el 773 con equipo asignado, ambos borrados después.
 *
 * Eso permite algo que parecía imposible desde una web estática: **no hacen
 * falta credenciales en el navegador ni tocar el servidor**. Meter usuario y
 * contraseña de Odoo en un JS público habría sido una fuga grave, y montar un
 * relay obligaba a desplegar en el VPS.
 *
 * EL DETALLE DE CORS
 * ------------------
 * Odoo NO devuelve cabeceras CORS, así que un `fetch` normal se bloquea. Se
 * usa `mode: 'no-cors'` con `Content-Type: application/x-www-form-urlencoded`:
 * eso lo convierte en una petición "simple", sin preflight, que el navegador
 * SÍ envía. El precio es que la respuesta llega opaca —no se puede leer el id
 * del lead—, y por eso nunca se dice "recibido" basándose en ella: el aviso al
 * visitante depende de que la petición saliera, no de una confirmación que no
 * podemos ver.
 *
 * DÓNDE ATERRIZA
 * --------------
 * `team_id: 11` = "Villa's · Compraventas". Es lo que separa estos leads de los
 * de okservice: la compañía la asigna Odoo sola y aquí sólo hay una sociedad
 * real (VILLVERG SL), así que la marca se distingue por equipo, no por company.
 *
 * OJO: el endpoint es público y sin CSRF, o sea que admite spam. Va con
 * honeypot (`vp_hp`): si ese campo llega relleno, es un bot y no se envía nada.
 */
window.VPLead = (function () {
  'use strict';

  var ENDPOINT = 'https://odoo.okservice.es/website/form/crm.lead';
  var EQUIPO_VILLAS = 11;

  /* ---------- de dónde viene la visita ----------
   * Cada enlace que se reparte fuera (grupos, LinkedIn, anuncios) lleva su
   * marca `utm_source` / `utm_campaign`. Aquí se lee y se añade al lead, junto
   * con el idioma de la página y la web de la que llega. Así se sabe qué canal
   * y qué país traen contactos sin que nadie tenga que preguntarlo ni apuntarlo.
   *
   * No se guarda nada en el navegador (la política de privacidad lo promete):
   * la marca viaja solo en la dirección, y se arrastra a los enlaces internos. */
  var CLAVES_ORIGEN = ['utm_source', 'utm_medium', 'utm_campaign'];
  var MAX_MARCA = 60;

  var limpiarMarca = function (v) {
    return String(v || '').slice(0, MAX_MARCA).replace(/[^\w .\-]/g, '').trim();
  };

  var leerOrigen = function (busqueda, idioma, referente, anfitrion) {
    var p = new URLSearchParams(busqueda || '');
    var marcas = {};
    CLAVES_ORIGEN.forEach(function (k) {
      var v = limpiarMarca(p.get(k));
      if (v) marcas[k] = v;
    });
    var viene = '';
    try {
      var h = referente ? new URL(referente).host : '';
      if (h && h !== anfitrion) viene = limpiarMarca(h);
    } catch (e) { viene = ''; }
    return { marcas: marcas, idioma: limpiarMarca(idioma).slice(0, 5), viene: viene };
  };

  var origenActual = function () {
    return leerOrigen(location.search, document.documentElement.lang,
      document.referrer, location.host);
  };

  var lineasOrigen = function (o) {
    var m = o.marcas, lineas = [];
    if (m.utm_source) lineas.push('Canal: ' + m.utm_source);
    if (m.utm_campaign) lineas.push('Campaña: ' + m.utm_campaign);
    if (m.utm_medium) lineas.push('Medio: ' + m.utm_medium);
    if (o.idioma) lineas.push('Idioma de la página: ' + o.idioma);
    if (o.viene) lineas.push('Llega desde: ' + o.viene);
    return lineas.length ? ['', 'ORIGEN'].concat(lineas) : [];
  };

  var conOrigen = function (descripcion, o) {
    var extra = lineasOrigen(o);
    return extra.length ? [descripcion || ''].concat(extra).join('\n') : descripcion;
  };

  /* La marca en una frase corta, para el mensaje de WhatsApp. */
  var refCorta = function (o) {
    var m = o.marcas;
    if (!m.utm_source) return '';
    return 'Ref. ' + m.utm_source + (m.utm_campaign ? ' / ' + m.utm_campaign : '');
  };

  /* Arrastra la marca a un enlace interno; devuelve la dirección nueva o null. */
  var enlaceConMarca = function (href, o, base) {
    var m = o.marcas;
    if (!m.utm_source) return null;
    var u;
    try { u = new URL(href, base); } catch (e) { return null; }
    if (u.origin !== new URL(base).origin) return null;
    if (/\.pdf$/i.test(u.pathname) || u.searchParams.get('utm_source')) return null;
    CLAVES_ORIGEN.forEach(function (k) { if (m[k]) u.searchParams.set(k, m[k]); });
    return u.toString();
  };

  /* WhatsApp de verdad: se mira el dominio, no si «wa.me» aparece en la dirección. */
  var DOMINIOS_WHATSAPP = ['wa.me', 'api.whatsapp.com'];
  var esWhatsApp = function (href) {
    try { return DOMINIOS_WHATSAPP.indexOf(new URL(href).hostname) !== -1; }
    catch (e) { return false; }
  };

  /* Añade la referencia al texto del WhatsApp; devuelve la dirección o null. */
  var whatsappConRef = function (href, o) {
    var ref = refCorta(o);
    if (!ref || !esWhatsApp(href)) return null;
    var u;
    try { u = new URL(href); } catch (e) { return null; }
    var texto = u.searchParams.get('text') || '';
    if (texto.indexOf(ref) !== -1) return null;
    u.searchParams.set('text', (texto ? texto + '\n' : '') + '(' + ref + ')');
    return u.toString();
  };

  /* Los campos que Odoo acepta en crm.lead por esta vía. El resto de lo que
     recojamos va al cuerpo de la descripción, que es texto libre. */
  var enviar = function (datos) {
    if (datos.honeypot) return Promise.resolve({ omitido: 'bot' });

    var cuerpo = new URLSearchParams();
    cuerpo.set('name', datos.asunto || 'Consulta desde la web');
    cuerpo.set('team_id', String(EQUIPO_VILLAS));
    if (datos.nombre) cuerpo.set('contact_name', datos.nombre);
    if (datos.email) cuerpo.set('email_from', datos.email);
    if (datos.telefono) cuerpo.set('phone', datos.telefono);
    var descripcion = conOrigen(datos.descripcion, origenActual());
    if (descripcion) cuerpo.set('description', descripcion);

    return fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',                 // sin esto, Odoo no devuelve CORS y se bloquea
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cuerpo.toString(),
    }).then(function () {
      return { enviado: true };
    }).catch(function (e) {
      /* Si falla —Odoo caído, sin red, un bloqueador—, no se pierde el lead:
         quien llama sigue teniendo su salida por WhatsApp. */
      return { enviado: false, error: String(e && e.message || e) };
    });
  };

  /* Un teléfono o un email suelto: se reparte al campo que toque sin obligar
     al visitante a rellenar dos casillas para decir lo mismo. */
  var repartirContacto = function (texto) {
    var t = (texto || '').trim();
    if (!t) return {};
    if (t.indexOf('@') !== -1) return { email: t };
    return { telefono: t };
  };

  /* ---------- clics a WhatsApp ----------
   * Quien pulsa WhatsApp sobre un inmueble concreto es el lead más caliente que
   * hay: ya sabe cuál quiere. El mensaje llega por WhatsApp, pero el aviso
   * entra en el CRM en el mismo instante y con la ficha delante, así que quien
   * atienda no empieza de cero.
   *
   * Se registra SOLO cuando hay contexto —un inmueble, una zona, un precio—.
   * Un clic suelto en el botón flotante no crea nada: llenar el CRM de leads
   * vacíos es la forma más rápida de que nadie vuelva a mirarlo. */
  var yaAvisado = {};

  /* Antes de que el clic navegue: la marca de origen pasa al enlace interno,
     o al texto del WhatsApp, que es por donde llega casi todo el contacto. */
  var marcarEnlace = function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var o = origenActual();
    var nuevo = esWhatsApp(a.href) ? whatsappConRef(a.href, o) : enlaceConMarca(a.href, o, location.href);
    if (nuevo) a.href = nuevo;
  };

  var vigilarWhatsApp = function () {
    document.addEventListener('click', marcarEnlace, true);
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
      if (!a) return;

      var ficha = a.closest('.property, .pmain, .phero, [data-ref]');
      if (!ficha) return;                       // sin contexto no se registra

      var ref = (ficha.getAttribute('data-ref')
        || (ficha.querySelector('[data-ref]') || {}).dataset?.ref || '').trim();
      var titulo = (ficha.querySelector('h1, h3') || {}).textContent || '';
      var precio = (ficha.querySelector('.price, .pprice') || {}).textContent || '';
      titulo = titulo.trim().replace(/\s+/g, ' ').slice(0, 90);
      if (!titulo) return;

      var clave = ref + titulo;
      if (yaAvisado[clave]) return;             // un clic, un aviso
      yaAvisado[clave] = true;

      enviar({
        asunto: 'Interés por WhatsApp · ' + titulo,
        descripcion: [
          'Alguien ha pulsado WhatsApp desde la ficha de este inmueble.',
          '',
          'Inmueble: ' + titulo,
          ref ? 'Referencia: ' + ref : '',
          precio ? 'Precio: ' + precio.trim() : '',
          'Página: ' + location.href,
          '',
          'El contacto llega por WhatsApp: este aviso solo sirve para que lo',
          'tengas con la ficha delante antes de que escriba.',
        ].filter(Boolean).join('\n'),
      });
    }, true);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', vigilarWhatsApp);
  } else { vigilarWhatsApp(); }

  return {
    enviar: enviar, repartirContacto: repartirContacto, EQUIPO: EQUIPO_VILLAS,
    origen: { leer: leerOrigen, lineas: lineasOrigen, conOrigen: conOrigen,
      enlaceConMarca: enlaceConMarca, whatsappConRef: whatsappConRef },
  };
})();

/* ---------- el informe PDF, a cambio de un contacto ----------
 *
 * Cualquier enlace a `assets/informes/*.pdf` deja de descargar directamente:
 * abre una ficha que pide un email o un WhatsApp y el permiso para mandar la
 * newsletter. Con eso entra un lead en Odoo (mismo equipo, asunto «Informe
 * PDF · …») y el botón de descarga aparece AL MOMENTO, en la misma ficha.
 *
 * Se entrega en el acto y no «te lo enviamos» porque desde una web estática
 * no hay quién lo envíe: prometer un correo que depende de que alguien lo
 * mande a mano es la forma de quedar mal con el primer contacto.
 *
 * Es una puerta blanda, a sabiendas: el PDF sigue en una URL pública y quien
 * la tenga puede abrirla. Lo que se gana es que quien llega por la web —la
 * inmensa mayoría— deja su contacto. Nada se guarda en el navegador: la
 * política de privacidad promete que solo se guarda la decisión de cookies.
 *
 * El consentimiento NO va premarcado y se registra en el lead con el texto
 * literal y la hora: es la prueba que pide el RGPD si alguien lo reclama.
 */
(function () {
  'use strict';

  var PATRON_INFORME = /\/assets\/informes\/[^?#]+\.pdf(?:[?#]|$)/i;
  var MIN_DIGITOS_TEL = 9;
  var TEXTO_PERMISO = 'Acepto que Villa\'s Properties (VILLVERG SL) me envíe '
    + 'este informe y la newsletter quincenal del mercado del sur de Tenerife '
    + 'por email o WhatsApp. Puedo darme de baja cuando quiera.';

  var yaDejoContacto = false;   // solo en memoria: ver arriba

  var esEmail = function (t) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t); };
  var esTelefono = function (t) {
    return /^[+\d][\d\s().-]*$/.test(t) && t.replace(/\D/g, '').length >= MIN_DIGITOS_TEL;
  };

  var nombreInforme = function (href) {
    var m = href.match(/informe-([^/]+?)\.pdf/i);
    return m ? m[1].replace(/-/g, ' ') : 'informe';
  };

  var crearFicha = function (href) {
    var capa = document.createElement('div');
    capa.className = 'vp-informe';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.setAttribute('aria-labelledby', 'vpInfTitulo');
    capa.innerHTML = ''
      + '<form class="vp-informe__caja" novalidate>'
      + '  <button type="button" class="vp-informe__cerrar" aria-label="Cerrar">×</button>'
      + '  <p class="vp-informe__eye">Informe del mercado · PDF</p>'
      + '  <h2 id="vpInfTitulo" class="vp-informe__titulo">Descárgalo gratis</h2>'
      + '  <p class="vp-informe__texto">Déjanos tu email o tu WhatsApp y descárgalo ahora. '
      + 'Cada quince días te llega el siguiente, con los datos nuevos de tu zona.</p>'
      + '  <label class="vp-informe__campo">Email o WhatsApp'
      + '    <input name="contacto" type="text" autocomplete="email" inputmode="email" required></label>'
      + '  <label class="vp-informe__campo">Nombre <span>(opcional)</span>'
      + '    <input name="nombre" type="text" autocomplete="name"></label>'
      + '  <input name="vp_hp" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="vp-informe__hp">'
      + '  <label class="vp-informe__permiso"><input name="permiso" type="checkbox"> '
      + '    <span></span></label>'
      + '  <p class="vp-informe__error" role="alert"></p>'
      + '  <button type="submit" class="vp-informe__si">Quiero el informe</button>'
      + '  <a class="vp-informe__si vp-informe__descarga" target="_blank" rel="noopener" hidden>Descargar el PDF</a>'
      + '</form>';

    /* El texto del permiso y el enlace van por DOM, no por innerHTML: el
       primero se reutiliza tal cual como prueba en el lead. */
    var span = capa.querySelector('.vp-informe__permiso span');
    span.appendChild(document.createTextNode(TEXTO_PERMISO + ' '));
    var priv = document.createElement('a');
    priv.href = 'privacy.html';
    priv.target = '_blank';
    priv.textContent = 'Privacidad';
    span.appendChild(priv);
    capa.querySelector('.vp-informe__descarga').href = href;
    return capa;
  };

  var abrir = function (href) {
    var anterior = document.activeElement;
    var capa = crearFicha(href);
    var form = capa.querySelector('form');
    var error = capa.querySelector('.vp-informe__error');
    var contacto = form.elements.contacto;

    var cerrar = function () {
      capa.remove();
      document.removeEventListener('keydown', alTeclear);
      if (anterior && anterior.focus) anterior.focus();
    };
    var alTeclear = function (e) { if (e.key === 'Escape') cerrar(); };

    capa.querySelector('.vp-informe__cerrar').addEventListener('click', cerrar);
    capa.addEventListener('click', function (e) { if (e.target === capa) cerrar(); });
    document.addEventListener('keydown', alTeclear);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valor = contacto.value.trim();
      if (!esEmail(valor) && !esTelefono(valor)) {
        error.textContent = 'Escribe un email o un teléfono con prefijo, para poder mandarte el siguiente.';
        contacto.focus();
        return;
      }
      if (!form.elements.permiso.checked) {
        error.textContent = 'Marca la casilla para que podamos enviártelo.';
        form.elements.permiso.focus();
        return;
      }
      error.textContent = '';

      var c = window.VPLead.repartirContacto(valor);
      var nombre = form.elements.nombre.value.trim();
      window.VPLead.enviar({
        asunto: 'Informe PDF · ' + nombreInforme(href),
        nombre: nombre,
        email: c.email,
        telefono: c.telefono,
        honeypot: form.elements.vp_hp.value,
        descripcion: [
          'Ha descargado el informe del mercado desde la web.',
          '',
          'Contacto: ' + valor + (c.email ? ' (email)' : ' (WhatsApp/teléfono)'),
          nombre ? 'Nombre: ' + nombre : null,
          'Informe: ' + href,
          'Página: ' + location.href,
          '',
          'CONSENTIMIENTO (casilla marcada, no venía premarcada):',
          '«' + TEXTO_PERMISO + '»',
          'Fecha: ' + new Date().toISOString(),
          '',
          'Alta para la lista de la newsletter quincenal.',
        ].filter(function (l) { return l !== null; }).join('\n'),
      });

      /* La descarga no espera a Odoo: la respuesta es opaca (no-cors) y,
         si Odoo está caído, no vamos a castigar al visitante por ello. */
      yaDejoContacto = true;
      form.querySelector('button[type="submit"]').hidden = true;
      Array.prototype.forEach.call(
        form.querySelectorAll('.vp-informe__campo, .vp-informe__permiso, .vp-informe__error'),
        function (el) { el.hidden = true; });
      capa.querySelector('.vp-informe__titulo').textContent = 'Gracias, ya es tuyo';
      capa.querySelector('.vp-informe__texto').textContent =
        'El próximo te llega en quince días. Si quieres hablar de tu caso, contesta a ese mensaje.';
      var descarga = capa.querySelector('.vp-informe__descarga');
      descarga.hidden = false;
      descarga.focus();
    });

    document.body.appendChild(capa);
    contacto.focus();
  };

  document.addEventListener('click', function (e) {
    if (yaDejoContacto || !window.VPLead) return;
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || a.classList.contains('vp-informe__descarga')) return;
    if (!PATRON_INFORME.test(a.href)) return;
    e.preventDefault();
    abrir(a.href);
  }, true);
})();
