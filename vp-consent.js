/* vp-consent.js — Consentimiento de cookies dentro del preloader.
 *
 * POR QUÉ ASÍ Y NO CON EL BANNER DE SIEMPRE
 * -----------------------------------------
 * El preloader ya obliga a esperar mientras la web se monta. Ese tiempo es el
 * único momento en que interrumpir no molesta: la alternativa habitual —soltar
 * una tira encima de la portada cuando el visitante ya está leyendo— tapa
 * justo lo que ha venido a ver. Así que el aviso sale AL 75% de la carga,
 * cuando aún falta algo por montar, y para cuando termina ya está decidido.
 *
 * QUÉ SE CONSIENTE DE VERDAD (medido, no supuesto)
 * ------------------------------------------------
 * Esta web pone UNA cookie: `__cf_bm`, de .vimeo.com — el bot management de
 * Cloudflare que viaja con el reproductor del vídeo de portada. No hay
 * analítica, ni publicidad, ni cookies propias, ni localStorage más allá de
 * esta misma decisión. Por eso el consentimiento tiene un efecto comprobable:
 *
 *   "Solo lo esencial"  →  el iframe de Vimeo NO se carga  →  CERO cookies
 *   "Aceptar"           →  se carga el vídeo               →  la de Vimeo
 *
 * Nada de pedir permiso para algo que se va a hacer igualmente. Si se rechaza,
 * queda el fondo de `.film-fallback`, que ya existía para cuando Vimeo falla.
 *
 * LA TRAMPA QUE SE EVITA
 * ----------------------
 * En villasproperties.es el modal de cookies acabó cubriendo la ventana con el
 * botón muerto: nadie podía ni aceptar ni cerrar. Aquí hay tres seguros:
 *   1. si el JS no llega a ejecutarse, el CSS retira el preloader igual;
 *   2. si no se decide en 20 s, el preloader sale y el aviso baja al pie como
 *      tira NO bloqueante — nunca se deja a nadie encerrado;
 *   3. Escape equivale a "solo lo esencial", la opción que menos hace.
 */
(function () {
  'use strict';

  var CLAVE = 'vp-consent';
  var VERSION = 1;               // subirla vuelve a preguntar si cambian los terceros
  var UMBRAL_AVISO = 75;         // % de carga al que aparece el aviso
  var ESPERA_MAX_MS = 20000;     // tras esto, el aviso deja de bloquear

  /* ---------- decisión guardada ---------- */

  var leer = function () {
    try {
      var v = JSON.parse(window.localStorage.getItem(CLAVE) || 'null');
      return (v && v.version === VERSION) ? v : null;
    } catch (e) { return null; }   // modo privado o almacenamiento capado
  };

  var guardar = function (acepta) {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify({
        version: VERSION, acepta: acepta, fecha: new Date().toISOString(),
      }));
    } catch (e) { /* sin almacenamiento se preguntará otra vez: es lo correcto */ }
  };

  var decidido = leer();

  /* ---------- API pública ---------- */

  var resolverVideo;
  var permisoVideo = new Promise(function (res) { resolverVideo = res; });

  var API = {
    /* ¿se puede cargar el vídeo de terceros? */
    aceptado: function () { return !!(leer() || {}).acepta; },
    /* promesa que resuelve cuando hay decisión (con true/false) */
    permisoVideo: permisoVideo,
    /* para volver a preguntar desde la política de privacidad */
    revocar: function () {
      try { window.localStorage.removeItem(CLAVE); } catch (e) {}
      window.location.reload();
    },
  };
  window.VPConsent = API;

  /* ---------- carga del vídeo, supeditada a la decisión ---------- */

  var cargarVideo = function () {
    var marco = document.querySelector('.hero-vimeo[data-src]');
    if (!marco) return;
    marco.setAttribute('src', marco.getAttribute('data-src'));
    marco.removeAttribute('data-src');
  };

  var aplicar = function (acepta) {
    document.documentElement.setAttribute('data-consent', acepta ? 'todo' : 'esencial');
    if (acepta) cargarVideo();
    resolverVideo(acepta);
  };

  /* El botón de la política de privacidad: un consentimiento que no se puede
     retirar no es un consentimiento. Se engancha siempre —haya decidido o
     no— y por eso va antes de las salidas de esta función. */
  var engancharRevocar = function () {
    var btn = document.getElementById('vpRevocar');
    if (!btn) return;
    var estado = document.getElementById('vpEstadoConsent');
    var d = leer();
    if (estado) {
      estado.textContent = d
        ? (d.acepta ? 'Ahora mismo: vídeo permitido.' : 'Ahora mismo: solo lo esencial.')
        : 'Todavía no has elegido.';
    }
    btn.addEventListener('click', function () { API.revocar(); });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', engancharRevocar);
  } else { engancharRevocar(); }

  /* Si ya se decidió en otra visita, se aplica y no se pregunta nada. */
  if (decidido) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { aplicar(decidido.acepta); });
    } else { aplicar(decidido.acepta); }
    return;
  }

  /* Y no se pregunta donde no hay nada que consentir.
     El único tercero de toda la web es el vídeo de la portada; en las otras 24
     páginas no se carga nada de fuera y no queda ni una cookie. Sacar el aviso
     allí sería pedir permiso para nada —justo el vicio que hace que la gente
     acepte sin leer—. Se comprueba por el marcador del propio iframe, así que
     el día que se añada otro tercero en otra página, el aviso aparece solo.
     `document.write` no interviene aquí: el script corre sin defer, antes de
     que exista el <body>, así que la comprobación se aplaza al DOM. */
  var hayTerceros = function () {
    return !!document.querySelector('.hero-vimeo[data-src], [data-tercero]');
  };
  var alMontar = function () {
    if (!hayTerceros()) {
      document.documentElement.classList.remove('vp-consent-espera');
      document.documentElement.setAttribute('data-consent', 'sin-terceros');
      resolverVideo(false);
      return false;
    }
    return true;
  };

  /* ---------- el aviso ---------- */

  var caja = null;
  var yaRespondido = false;
  var procede = false;          // lo pone arrancar() si la página tiene terceros

  /* La espera se marca YA, no al construir el aviso.
     El preloader tiene una red de seguridad en CSS que lo retira a los 9 s. Si
     se esperase a tener el aviso montado para pausarla, bastaría con que la
     carga fuese lenta para que la web se colase por debajo sin haber
     preguntado nada: en el servidor de pruebas DOMContentLoaded se midió a
     5,3 s, y con eso el margen era de tres segundos.
     Va sobre <html> porque existe desde el primer byte; <body> puede no estar
     todavía. Los topes de más abajo se encargan de que la pausa no sea eterna. */
  document.documentElement.classList.add('vp-consent-espera');

  var responder = function (acepta) {
    if (yaRespondido) return;
    yaRespondido = true;
    guardar(acepta);
    aplicar(acepta);
    if (caja) {
      caja.classList.add('vp-consent--fuera');
      window.setTimeout(function () { caja.remove(); }, 400);
    }
    document.documentElement.classList.remove('vp-consent-espera');
  };

  var construir = function () {
    if (caja || yaRespondido || !procede) return;

    caja = document.createElement('section');
    caja.className = 'vp-consent';
    caja.setAttribute('role', 'dialog');
    caja.setAttribute('aria-modal', 'false');   // no atrapa: el preloader ya cubre
    caja.setAttribute('aria-labelledby', 'vp-consent-t');

    var t = document.createElement('h2');
    t.id = 'vp-consent-t';
    t.className = 'vp-consent__titulo';
    t.textContent = 'Antes de entrar';

    var p = document.createElement('p');
    p.className = 'vp-consent__texto';
    /* El texto dice exactamente lo que se ha medido. Si algún día se añade
       analítica, hay que cambiarlo aquí y subir VERSION. */
    p.textContent = 'Esta web no usa cookies de análisis ni de publicidad. '
      + 'La única que existe la pone Vimeo, que sirve el vídeo de portada. '
      + 'Si prefieres no cargarlo, la web funciona igual y no queda ninguna.';

    var acciones = document.createElement('div');
    acciones.className = 'vp-consent__acciones';

    var btnSi = document.createElement('button');
    btnSi.type = 'button';
    btnSi.className = 'vp-consent__si';
    btnSi.textContent = 'Aceptar y ver el vídeo';
    btnSi.addEventListener('click', function () { responder(true); });

    var btnNo = document.createElement('button');
    btnNo.type = 'button';
    btnNo.className = 'vp-consent__no';
    btnNo.textContent = 'Solo lo esencial';
    btnNo.addEventListener('click', function () { responder(false); });

    var mas = document.createElement('a');
    mas.className = 'vp-consent__mas';
    mas.href = 'privacy.html';
    mas.textContent = 'Política de privacidad';

    acciones.appendChild(btnSi);
    acciones.appendChild(btnNo);
    caja.appendChild(t);
    caja.appendChild(p);
    caja.appendChild(acciones);
    caja.appendChild(mas);
    document.body.appendChild(caja);

    /* El foco va al aviso: quien navega con teclado no puede quedarse detrás. */
    window.setTimeout(function () { btnSi.focus(); }, 60);

    /* Escape = la opción que menos hace. Nunca la que más concede. */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !yaRespondido) responder(false);
    });

    /* Seguro nº2: pasado el tope, deja de retener el preloader y se queda como
       tira al pie. Más vale un aviso menos vistoso que un visitante encerrado. */
    window.setTimeout(function () {
      if (yaRespondido || !caja) return;
      caja.classList.add('vp-consent--pie');
      document.documentElement.classList.remove('vp-consent-espera');
      resolverVideo(false);          // sin decisión no se cargan terceros
    }, ESPERA_MAX_MS);
  };

  /* ---------- progreso real de la carga ---------- */

  /* 25 dom · 50 tipografías · 75 estilos aplicados. El vídeo NO puntúa antes
     del 75% a propósito: si puntuara, habría que cargarlo para poder preguntar
     si se puede cargar. */
  var pct = 0;

  var marcar = function (valor) {
    if (valor <= pct) return;
    pct = valor;
    document.documentElement.style.setProperty('--pl-progreso', pct + '%');
    if (pct >= UMBRAL_AVISO) construir();
  };

  /* La barra se monta desde aquí y no en los 25 HTML: es un detalle del
     preloader, no contenido de la página. Si este script no corre, no aparece
     y no pasa nada — el preloader sigue funcionando sin ella. */
  var montarBarra = function () {
    if (document.querySelector('.vp-progreso')) return;
    if (document.body.classList.contains('no-preloader')) return;
    var pista = document.createElement('div');
    pista.className = 'vp-progreso';
    pista.setAttribute('aria-hidden', 'true');   // el estado lo canta el aviso
    var barra = document.createElement('div');
    barra.className = 'vp-progreso__barra';
    pista.appendChild(barra);
    document.body.appendChild(pista);
  };

  var arrancar = function () {
    if (!alMontar()) return;     // en esta página no hay nada que consentir
    procede = true;
    montarBarra();
    marcar(25);
    var fuentes = (document.fonts && document.fonts.ready)
      ? document.fonts.ready : Promise.resolve();
    fuentes.then(function () {
      marcar(50);
      /* Un frame pintado basta como prueba de que el CSS ya está aplicado. */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { marcar(75); });
      });
    }).catch(function () { marcar(75); });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else { arrancar(); }

  /* Seguro nº3: si algo se atasca antes del 75%, el aviso sale igual. Sin esto
     un fallo de tipografías dejaría la decisión sin poder tomarse. */
  window.setTimeout(construir, 4000);
})();
