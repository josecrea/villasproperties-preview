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
    if (datos.descripcion) cuerpo.set('description', datos.descripcion);

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

  return { enviar: enviar, repartirContacto: repartirContacto, EQUIPO: EQUIPO_VILLAS };
})();
