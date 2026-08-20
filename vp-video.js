/* vp-video.js — Arranque automático responsable.
 *
 * El vídeo de inversores va arriba y arranca solo. Eso obliga a resolver tres
 * cosas que un `autoplay` a secas deja rotas:
 *
 * 1. EL PESO. Con autoplay en el HTML, el vídeo se descarga SIEMPRE, lo pida
 *    alguien o no. Por eso el fichero cuelga de `data-src` y solo se asigna
 *    cuando el bloque entra en pantalla. Quien no llega hasta ahí no paga nada.
 *
 * 2. QUIEN NO QUIERE MOVIMIENTO. `prefers-reduced-motion` no es un capricho:
 *    hay gente a la que el movimiento automático le provoca mareo o migraña.
 *    En ese caso no arranca nada — queda el póster y su botón de play.
 *
 * 3. QUIEN PAGA LOS DATOS. Con ahorro de datos activado o en 2G, tampoco
 *    arranca. Son 3,7 MB: en una tarifa corta eso se nota.
 *
 * Y el vídeo conserva SIEMPRE sus controles. No es decoración: la pauta
 * WCAG 2.2.2 exige poder parar cualquier cosa que se mueva sola más de cinco
 * segundos, y esta dura cuarenta y cinco.
 *
 * El vídeo es mudo de origen —no tiene ni pista de audio—, así que el navegador
 * no bloquea el autoplay. Aun así se marca `muted` explícitamente: sin ese
 * atributo, Safari e iOS se niegan igual.
 */
(function () {
  'use strict';

  var noQuiereMovimiento = function () {
    return window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  var vaJustoDeDatos = function () {
    var c = navigator.connection || {};
    return c.saveData === true || /(^|-)2g/.test(c.effectiveType || '');
  };

  var cargar = function (video) {
    /* Varios <source>: el hero lleva uno para móvil y otro para escritorio, y
       es el navegador quien elige según el `media`. Hay que soltarlos todos, no
       solo el primero, o en escritorio se serviría el recorte vertical. */
    var fuentes = video.querySelectorAll('source[data-src]');
    if (!fuentes.length) return false;
    Array.prototype.forEach.call(fuentes, function (f) {
      f.src = f.getAttribute('data-src');
      f.removeAttribute('data-src');
    });
    video.load();
    return true;
  };

  var arrancar = function (video) {
    if (!cargar(video)) return;
    /* play() devuelve una promesa que el navegador puede rechazar. Si lo hace,
       no se insiste: el póster y los controles siguen ahí. */
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* que lo pulse quien quiera */ });
  };

  var preparar = function (video) {
    /* Sin autoplay se carga igual, pero solo cuando el visitante le da al play:
       los controles nativos no funcionan con un <source> sin src, así que hay
       que resolverlo en el primer intento de reproducción. */
    var alPulsar = function () {
      if (cargar(video)) video.play().catch(function () {});
      video.removeEventListener('play', alPulsar);
    };
    video.addEventListener('play', alPulsar);
  };

  var init = function () {
    /* Pósters diferidos. Va aparte de la lógica de reproducción a propósito:
       esto aplica también a los vídeos con controles, que no se reproducen
       solos y por tanto no entran en la lista de abajo. Su póster se
       descargaba al entrar en la página y competía con el del hero, que es el
       elemento que decide el LCP de la portada. */
    Array.prototype.forEach.call(document.querySelectorAll('video[data-poster]'), function (v) {
      var poner = function () {
        var p = v.getAttribute('data-poster');
        if (!p) return;
        v.setAttribute('poster', p);
        v.removeAttribute('data-poster');
      };
      if (!('IntersectionObserver' in window)) { poner(); return; }
      var ob = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { poner(); ob.disconnect(); } });
      }, { rootMargin: '400px' });   // margen amplio: mejor llegar con imagen
      ob.observe(v);
    });

    var videos = document.querySelectorAll('video[data-autoplay]');
    if (!videos.length) return;

    Array.prototype.forEach.call(videos, function (v) {
      v.muted = true;               // sin esto, iOS y Safari no arrancan
      if (noQuiereMovimiento() || vaJustoDeDatos()) { preparar(v); return; }

      if (!('IntersectionObserver' in window)) { arrancar(v); return; }

      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          arrancar(v);
          obs.disconnect();          // una vez cargado, ya no hace falta vigilar
        });
      }, { rootMargin: '200px' });   // un respiro para que llegue con imagen
      obs.observe(v);
    });
  };

  /* Cuándo arrancar, que resultó ser lo que decidía el rendimiento en móvil.
     El <video> lleva preload="none" precisamente para no descargarse solo,
     pero `arrancar()` le asigna el src y llama a load(), y eso ANULA el
     preload. Haciéndolo en DOMContentLoaded, el vídeo de 1,7 MB salía a la red
     a la vez que su propio póster de 87 KB y le robaba el ancho de banda: en
     4G el póster —que es el elemento LCP— tardaba 5,9 segundos en pintar.

     Ahora se espera al evento `load`, es decir a que el resto de la página
     haya terminado, y encima a un hueco de inactividad. El usuario no nota la
     diferencia porque el póster ya está puesto; lo único que cambia es que el
     movimiento entra uno o dos segundos más tarde. */
  var arrancarTodo = function () {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(init, { timeout: 2500 });
    } else {
      setTimeout(init, 250);
    }
  };

  if (document.readyState === 'complete') { arrancarTodo(); }
  else { window.addEventListener('load', arrancarTodo); }
})();
