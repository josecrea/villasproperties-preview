/* contact-form.js — El formulario de contacto, sin backend.
 *
 * Esta web es estática: no hay servidor que reciba un POST. En vez de fingir
 * un envío que no existe —o de mandar los datos a un tercero—, el mensaje se
 * compone y se abre en el WhatsApp del visitante. Así ve exactamente qué
 * envía y a quién, y aquí no queda guardado nada de nadie.
 *
 * La validación es mínima a propósito: pedir más campos obligatorios en un
 * formulario de contacto solo consigue que la gente se vaya.
 */
(function () {
  'use strict';

  var TEL = '34667384965';

  var val = function (id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  var init = function () {
    var boton = document.getElementById('cEnviar');
    if (!boton) return;
    var error = document.getElementById('cError');

    var enviar = function () {
      var nombre = val('cNombre');
      var tel = val('cTel');
      var intencion = val('cIntencion');
      var mensaje = val('cMsg');

      if (!nombre) {
        if (error) error.textContent = 'Escribe tu nombre para saber con quién hablamos.';
        var n = document.getElementById('cNombre');
        if (n) n.focus();
        return;
      }
      if (error) error.textContent = '';

      /* Se arma en líneas sueltas: al llegar a WhatsApp se lee como un mensaje
         escrito por una persona, no como el volcado de un formulario. */
      var lineas = ['Hola, soy ' + nombre + '.'];
      if (intencion) lineas.push('Me interesa: ' + intencion.toLowerCase() + '.');
      if (mensaje) lineas.push(mensaje);
      if (tel) lineas.push('Mi teléfono: ' + tel);

      var url = 'https://api.whatsapp.com/send/?phone=' + TEL
        + '&text=' + encodeURIComponent(lineas.join('\n'));
      window.open(url, '_blank', 'noopener');
    };

    boton.addEventListener('click', enviar);

    /* Enter en cualquier campo de una línea envía, como se espera de un
       formulario. En el textarea no, que ahí Enter es un salto de párrafo. */
    var form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        if (e.target && e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        enviar();
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
