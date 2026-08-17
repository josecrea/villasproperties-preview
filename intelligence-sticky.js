/* Villa's Intelligence · Sticky Story Engine. IIFE, rAF-throttled, reduced-motion aware. */
(function () {
  'use strict';
  var scene = document.getElementById('intelligence');
  if (!scene || !scene.classList.contains('is-scene')) return;

  var SUB_COUNT = 5;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobileMQ = window.matchMedia('(max-width: 860px)');

  var subs   = Array.prototype.slice.call(scene.querySelectorAll('[data-sub]'));
  var steps  = Array.prototype.slice.call(scene.querySelectorAll('[data-step]'));
  var sticky = scene.querySelector('.is-sticky');
  var orbit  = scene.querySelector('[data-orbit]');
  var ring   = scene.querySelector('[data-ring]');
  var sat    = scene.querySelector('[data-orbit-sat]');
  var oIndex = scene.querySelector('[data-orbit-index]');

  var RING_LEN = 540;
  var HALO_X   = [28, 38, 22, 44, 30];
  var RING_HUE = ['#dfe8e3', '#c9ad95', '#5f8075', '#dfe8e3', '#c9ad95'];

  var current = -1;
  var ticking = false;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fmt(val, decimals) {
    var s = decimals ? val.toFixed(decimals) : Math.round(val).toString();
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.length > 1 ? parts.join(',') : parts[0];
  }
  function animateCounters(sub) {
    var nodes = sub.querySelectorAll('[data-count]');
    for (var i = 0; i < nodes.length; i++) {
      (function (node) {
        var target = parseFloat(node.getAttribute('data-count'));
        var suffix = node.getAttribute('data-suffix') || '';
        var dec = parseInt(node.getAttribute('data-decimals') || '0', 10);
        var neg = target < 0, abs = Math.abs(target), t0 = null, dur = 900;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = clamp((ts - t0) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          node.textContent = (neg ? '−' : '') + fmt(abs * eased, dec) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else node.textContent = (neg ? '−' : '') + fmt(abs, dec) + suffix;
        }
        requestAnimationFrame(step);
      })(nodes[i]);
    }
  }
  function setScene(i, dir) {
    if (i === current) return;
    var prev = current; current = i;
    for (var s = 0; s < subs.length; s++) {
      var el = subs[s]; el.classList.remove('is-leave-up');
      if (s === i) { el.classList.add('active'); animateCounters(el); }
      else { if (s === prev && dir < 0) el.classList.add('is-leave-up'); el.classList.remove('active'); }
    }
    for (var k = 0; k < steps.length; k++) {
      steps[k].classList.toggle('is-on', k === i);
      steps[k].classList.toggle('is-done', k < i);
    }
    if (oIndex) oIndex.textContent = ('0' + (i + 1)).slice(-2);
    if (sticky) sticky.style.setProperty('--halo-x', HALO_X[i] + '%');
    if (ring) ring.style.stroke = RING_HUE[i];
  }
  function setProgress(p) {
    if (ring) ring.style.setProperty('--ring-offset', (RING_LEN * (1 - p)).toFixed(1));
    if (orbit) {
      orbit.style.setProperty('--orbit-rot', (p * 360).toFixed(1) + 'deg');
      orbit.style.setProperty('--orbit-scale', (1 + Math.sin(p * Math.PI) * 0.06).toFixed(3));
    }
    if (sat) sat.style.setProperty('--sat-rot', (p * 360).toFixed(1) + 'deg');
  }
  function compute() {
    ticking = false;
    var rect = scene.getBoundingClientRect(), vh = window.innerHeight, total = rect.height - vh;
    if (total <= 0) { setScene(0, 1); setProgress(0); return; }
    var scrolled = clamp(-rect.top, 0, total), p = scrolled / total;
    setProgress(p);
    var idx = clamp(Math.floor(p * SUB_COUNT), 0, SUB_COUNT - 1);
    setScene(idx, idx >= current ? 1 : -1);
  }
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(compute); }
  function staticMode() {
    for (var s = 0; s < subs.length; s++) subs[s].classList.add('active');
    for (var k = 0; k < steps.length; k++) { steps[k].classList.add('is-on'); steps[k].classList.remove('is-done'); }
    if (ring) ring.style.setProperty('--ring-offset', '0');
    if (orbit) { orbit.style.setProperty('--orbit-rot', '0deg'); orbit.style.setProperty('--orbit-scale', '1'); }
  }
  var bound = false;
  function bind() { if (bound) return; bound = true; window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll, { passive: true }); compute(); }
  function unbind() { if (!bound) return; bound = false; window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
  function evaluate() {
    if (reduceMQ.matches || mobileMQ.matches) { unbind(); staticMode(); }
    else { current = -1; setScene(0, 1); bind(); }
  }
  function onMQ(mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); }
  onMQ(reduceMQ, evaluate); onMQ(mobileMQ, evaluate);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', evaluate, { once: true });
  else evaluate();
})();
