/* tour.js — Visita virtual 360° de una vivienda (tour.html?casa=<slug>).
 *
 * Lee tours/<slug>/tour.json y lo pinta con Pannellum (vendor/pannellum, MIT, servido
 * desde aquí: nada de CDN, la CSP solo permite 'self'). Cada escena es UNA foto
 * equirectangular 2:1 sacada de la Insta360 (sin retoques: es la casa real), y los
 * hotspots son las flechas para pasar de una estancia a otra.
 *
 * Mientras una vivienda no tenga escenas, la página lo dice y no inventa nada.
 */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var slug = (params.get('casa') || '').replace(/[^a-z0-9-]/g, '');
  var box = document.getElementById('tour');
  var aviso = function (texto) {
    box.innerHTML = '';
    var d = document.createElement('div');
    d.className = 'tmsg';
    var p = document.createElement('p');
    p.textContent = texto;
    d.appendChild(p);
    document.body.appendChild(d);
  };
  if (!slug) { aviso('Falta la vivienda.'); return; }
  document.getElementById('tvolver').href = 'vivienda-' + slug + '.html';

  fetch('tours/' + slug + '/tour.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (t) {
      if (t.titulo) {
        document.getElementById('ttitle').textContent = t.titulo;
        document.title = t.titulo + ' — Visita virtual — Villa’s Properties';
      }
      var escenas = t.escenas || [];
      if (!escenas.length) {
        aviso('La visita virtual de esta vivienda está en preparación. Mientras tanto, pídenos un vídeo por WhatsApp.');
        return;
      }
      var scenes = {};
      escenas.forEach(function (e) {
        scenes[e.id] = {
          title: e.nombre,
          type: 'equirectangular',
          panorama: 'tours/' + slug + '/' + e.foto,
          yaw: e.yaw || 0,
          hfov: 110,
          hotSpots: (e.salidas || []).map(function (s) {
            return { pitch: s.pitch || -10, yaw: s.yaw || 0, type: 'scene', text: s.texto, sceneId: s.a };
          }),
        };
      });
      window.pannellum.viewer('tour', {
        default: { firstScene: escenas[0].id, autoLoad: true, sceneFadeDuration: 600 },
        scenes: scenes,
      });
    })
    .catch(function () { aviso('No hay visita virtual para esta vivienda.'); });
})();
