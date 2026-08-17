(() => {
  'use strict';

  // Static preview only: keep plaintext passwords out of the repository.
  // Replace this SHA-256 hash to rotate the preview password.
  const BACKOFFICE_HASH = '07b4386deeed32b69f2db935dc16aa7890e4270e30a7adfee6fd34ccb17bdd64';
  const SESSION_KEY = 'vpBackofficeUnlocked';
  const MAX_ATTEMPTS = 5;
  const LOCK_MS = 30000;

  let failedAttempts = 0;
  let lockedUntil = 0;

  const sha256 = async (value) => {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  const isUnlocked = () => sessionStorage.getItem(SESSION_KEY) === '1';
  const unlock = () => sessionStorage.setItem(SESSION_KEY, '1');
  const lock = () => sessionStorage.removeItem(SESSION_KEY);

  const markup = `
    <div class="vp-auth-gate" id="vpAuthGate" aria-hidden="true">
      <div class="vp-auth-card" role="dialog" aria-modal="true" aria-labelledby="vpAuthTitle">
        <div class="vp-auth-brand">
          <svg class="vp-auth-monogram" viewBox="0 0 100 70" aria-hidden="true">
            <path d="M8 8 L35 60 L60 8"/>
            <path d="M62 60 V8 H82 C94 8 98 16 98 27 C98 39 91 46 80 46 H62"/>
          </svg>
          <div>
            <div class="vp-auth-eye">PRIVATE BACK OFFICE</div>
            <h2 id="vpAuthTitle">Acceso restringido</h2>
          </div>
        </div>
        <p class="vp-auth-copy">Introduce la contraseña de administración. El acceso se mantiene solo durante esta sesión del navegador.</p>
        <form id="vpAuthForm">
          <label class="vp-auth-field" for="vpAuthPassword">
            <span>Contraseña</span>
            <input id="vpAuthPassword" type="password" autocomplete="current-password" required>
          </label>
          <div class="vp-auth-actions">
            <button class="vp-auth-primary" type="submit">Entrar</button>
            <button class="vp-auth-secondary" id="vpAuthCancel" type="button">Cancelar</button>
          </div>
          <div class="vp-auth-error" id="vpAuthError" aria-live="polite"></div>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', markup);

  const gate = document.getElementById('vpAuthGate');
  const form = document.getElementById('vpAuthForm');
  const input = document.getElementById('vpAuthPassword');
  const error = document.getElementById('vpAuthError');
  const cancel = document.getElementById('vpAuthCancel');
  const adminPanel = document.getElementById('adminPanel');
  const overlay = document.getElementById('overlay');

  const showGate = () => {
    error.textContent = '';
    input.value = '';
    gate.classList.add('open');
    gate.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 30);
  };

  const hideGate = () => {
    gate.classList.remove('open');
    gate.setAttribute('aria-hidden', 'true');
  };

  const openPanel = () => {
    overlay?.classList.add('open');
    adminPanel?.classList.add('open');
  };

  const closePanel = () => {
    overlay?.classList.remove('open');
    adminPanel?.classList.remove('open');
  };

  const requestAdmin = (event) => {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    if (isUnlocked()) openPanel();
    else showGate();
  };

  // Capture phase intentionally runs before the prototype's original click handlers.
  ['openAdmin', 'manageProps'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', requestAdmin, true);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const now = Date.now();
    if (now < lockedUntil) {
      error.textContent = 'Demasiados intentos. Espera unos segundos.';
      return;
    }

    try {
      const digest = await sha256(input.value);
      if (digest === BACKOFFICE_HASH) {
        failedAttempts = 0;
        unlock();
        hideGate();
        openPanel();
      } else {
        failedAttempts += 1;
        error.textContent = 'Contraseña incorrecta.';
        input.select();
        if (failedAttempts >= MAX_ATTEMPTS) {
          failedAttempts = 0;
          lockedUntil = Date.now() + LOCK_MS;
          error.textContent = 'Demasiados intentos. Acceso bloqueado durante 30 segundos.';
        }
      }
    } catch (err) {
      console.error('Back Office auth error', err);
      error.textContent = 'No se pudo validar el acceso en este navegador.';
    }
  });

  cancel.addEventListener('click', hideGate);
  gate.addEventListener('click', (event) => {
    if (event.target === gate) hideGate();
  });

  // Add a session logout action inside the existing Back Office header.
  const adminHead = adminPanel?.querySelector('.adminhead');
  if (adminHead && !document.getElementById('vpAuthLogout')) {
    const logout = document.createElement('button');
    logout.id = 'vpAuthLogout';
    logout.type = 'button';
    logout.className = 'vp-auth-logout';
    logout.textContent = 'Cerrar sesión';
    logout.addEventListener('click', () => {
      lock();
      closePanel();
    });
    const closeButton = adminHead.querySelector('.close');
    adminHead.insertBefore(logout, closeButton || null);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && gate.classList.contains('open')) hideGate();
  });
})();