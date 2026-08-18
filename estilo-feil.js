/* estilo-feil.js — solo el menú móvil y el respeto a reduce-motion.
 *
 * Aislado del resto del sitio: no toca app.js ni motion.js. Sin dependencias. */
(function () {
  'use strict';

  var toggle = document.querySelector('.feil-nav__toggle');
  var lista = document.getElementById('feil-nav-list');

  if (toggle && lista) {
    var setAbierto = function (abierto) {
      lista.dataset.open = String(abierto);
      toggle.setAttribute('aria-expanded', String(abierto));
    };

    toggle.addEventListener('click', function () {
      setAbierto(lista.dataset.open !== 'true');
    });

    lista.addEventListener('click', function (e) {
      if (e.target.closest('a')) setAbierto(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lista.dataset.open === 'true') {
        setAbierto(false);
        toggle.focus();
      }
    });

    // El menú solo es fijo en móvil: al volver a escritorio hay que soltar el
    // estado o la lista se queda oculta bajo el CSS de escritorio.
    var mq = window.matchMedia('(min-width: 721px)');
    var alCambiar = function (ev) { if (ev.matches) setAbierto(false); };
    if (mq.addEventListener) mq.addEventListener('change', alCambiar);
    else if (mq.addListener) mq.addListener(alCambiar);
  }

  // Quien pide menos movimiento no quiere un vídeo en bucle de fondo.
  var video = document.querySelector('.feil-hero__video');
  if (video && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.removeAttribute('autoplay');
    video.pause();
    video.remove();   // queda el degradado de respaldo, que es estático
  }
})();
