/* Tenerife cinematic storytelling. IIFE, rAF-throttled, reduced-motion aware. */
(function () {
  'use strict';
  var section = document.getElementById('tf-zonas');
  if (!section) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var layers = Array.prototype.slice.call(section.querySelectorAll('.tf-layer'));
  var captions = Array.prototype.slice.call(section.querySelectorAll('.tf-caption'));
  var dots = Array.prototype.slice.call(section.querySelectorAll('.tf-dot'));
  var count = layers.length;
  if (!count) return;
  /* Las cinco fotos de zona suman 309 KB y esta sección está muy por debajo del
     pliegue, pero se asignaban todas nada más cargar: competían con el póster
     del hero, que es el elemento que decide el LCP de la portada.

     Ahora se asignan cuando la sección se acerca, con margen de sobra para que
     lleguen antes de que se vea nada. Como son fondos CSS y no <img>, no valía
     `loading="lazy"`. */
  var pintarCapas = function () {
    layers.forEach(function (layer) {
      var src = layer.getAttribute('data-img');
      if (!src) return;
      layer.style.backgroundImage = "url('" + src + "')";
      layer.classList.add('has-photo');
    });
  };

  if ('IntersectionObserver' in window) {
    var obsFotos = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        pintarCapas();
        obsFotos.disconnect();
      });
    }, { rootMargin: '800px' });
    obsFotos.observe(section);
  } else {
    pintarCapas();
  }
  var current = -1, ticking = false;
  function setActive(index) {
    if (index === current) return;
    current = index;
    for (var i = 0; i < count; i++) {
      var on = i === index;
      layers[i].classList.toggle('is-active', on);
      if (captions[i]) captions[i].classList.toggle('is-active', on);
      if (dots[i]) dots[i].classList.toggle('is-active', on);
    }
  }
  function computeIndex() {
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var travel = rect.height - vh;
    if (travel <= 0) { setActive(0); return; }
    var progress = -rect.top / travel;
    if (progress < 0) progress = 0; if (progress > 1) progress = 1;
    var index = Math.floor(progress * count);
    if (index >= count) index = count - 1;
    setActive(index);
  }
  function onScroll() { if (ticking) return; ticking = true; window.requestAnimationFrame(function () { computeIndex(); ticking = false; }); }
  function enable() { setActive(0); computeIndex(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll, { passive: true }); }
  /* Con "reducir movimiento" no hay recorrido que seguir, así que la sección
     pasa de escena a rejilla. El CSS oculta .tf-stage —las cinco fotos van
     superpuestas y ahí no tienen sentido—, pero dejar solo texto sobre negro
     convertía el bloque en un pasillo oscuro larguísimo. Aquí cada zona
     recupera SU foto, pegada a su propio texto. */
  function disable() {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    layers.forEach(function (l) { l.classList.add('is-active'); });
    captions.forEach(function (c, i) {
      c.classList.add('is-active');
      var src = layers[i] && layers[i].getAttribute('data-img');
      if (src) {
        c.style.backgroundImage = "url('" + src + "')";
        c.classList.add('tf-caption--foto');
      }
    });
  }
  function apply() { if (reduce.matches) disable(); else enable(); }
  apply();
  if (reduce.addEventListener) reduce.addEventListener('change', function () { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); current = -1; apply(); });
})();
