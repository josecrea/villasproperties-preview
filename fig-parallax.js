/* fig-parallax.js — Las tarjetas de Insights siguen al cursor.
 *
 * Escribe --mx y --my (de -1 a 1) en cada tarjeta según dónde esté el ratón
 * dentro de ella. El CSS hace el resto: el fondo se desplaza hacia el cursor y
 * los círculos decorativos en sentido contrario, que es lo que da la sensación
 * de capas a distinta profundidad.
 *
 * Un solo listener delegado en el documento en vez de uno por tarjeta, y la
 * escritura se agrupa en requestAnimationFrame: pointermove dispara decenas de
 * veces por segundo y tocar el estilo en cada evento provoca un reflow por
 * evento.
 *
 * No hace nada si el usuario pidió menos movimiento, ni en dispositivos sin
 * puntero fino (en táctil no hay hover y el efecto no se llega a ver).
 */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fino = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (reduce.matches || !fino.matches) return;

  var pendiente = null;
  var ultima = null;

  function aplicar() {
    pendiente = null;
    if (!ultima) return;
    var t = ultima.tarjeta, r = ultima.rect, x = ultima.x, y = ultima.y;
    t.style.setProperty('--mx', (((x - r.left) / r.width) * 2 - 1).toFixed(3));
    t.style.setProperty('--my', (((y - r.top) / r.height) * 2 - 1).toFixed(3));
  }

  document.addEventListener('pointermove', function (e) {
    var t = e.target.closest && e.target.closest('.pcard, .pfeat');
    if (!t || !t.querySelector('.pcard-fig[data-bg]')) return;
    ultima = { tarjeta: t, rect: t.getBoundingClientRect(), x: e.clientX, y: e.clientY };
    if (!pendiente) pendiente = requestAnimationFrame(aplicar);
  }, { passive: true });

  /* Al salir se vuelve al centro: si no, la tarjeta se queda torcida en la
     última posición del ratón. */
  document.addEventListener('pointerout', function (e) {
    var t = e.target.closest && e.target.closest('.pcard, .pfeat');
    if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
    t.style.setProperty('--mx', 0);
    t.style.setProperty('--my', 0);
  }, { passive: true });
})();
