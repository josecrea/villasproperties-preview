/* Villa's Properties — saneado de datos al pintar HTML.

   El catálogo es contenido editable desde el Back Office y se pinta
   con plantillas de cadena e innerHTML. Sin escapar, un título o una URL de
   imagen con comillas se sale de su atributo y ejecuta código en el navegador
   de cualquier visitante. Comprobado: era explotable en título, descripción,
   características y URL de foto.

   `esc` para texto y atributos; `url` además exige un esquema seguro, para que
   un `javascript:` pegado en el Back Office no acabe en un href. */
(() => {
  'use strict';

  const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => MAP[c]);

  const url = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    /* Relativas (assets/…, property.html?ref=…, #ancla) y los esquemas que
       usamos. Todo lo demás se descarta en vez de pintarse. */
    if (/^(https?:|mailto:|tel:)/i.test(raw) || /^[\w./?=&#%-]+$/.test(raw)) return esc(raw);
    return '';
  };

  window.VPSafe = { esc, url };
})();
