/* Villa's Properties — publicación directa a GitHub desde el Back Office.

   Sube en UN solo commit el catálogo y las fotos usando la Git Data API:
   blobs → árbol → commit → mueve la rama. Compara el SHA de Git de cada foto
   con el que ya está en el repositorio, así solo viaja lo que ha cambiado, y
   borra las que sobran cuando se quitan fotos de un inmueble.

   El token NO se guarda en el repositorio ni en localStorage: vive en memoria y,
   si se marca la casilla, en sessionStorage (se borra al cerrar la pestaña).
   Debe ser un token de acceso personal de grano fino con acceso ÚNICAMENTE a
   este repositorio y permiso «Contents: Read and write». */
(() => {
  'use strict';

  const API = 'https://api.github.com';
  const SESSION_KEY = 'vpGhToken';

  const b64 = (bytes) => {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  };

  /* SHA de Git de un blob: sha1("blob <bytes>\0" + contenido). Sirve para no
     volver a subir lo que ya está igual en el repositorio. */
  const gitSha = async (bytes) => {
    const header = new TextEncoder().encode(`blob ${bytes.length}\0`);
    const full = new Uint8Array(header.length + bytes.length);
    full.set(header, 0);
    full.set(bytes, header.length);
    const digest = await crypto.subtle.digest('SHA-1', full);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const api = async (token, path, options = {}) => {
    const res = await fetch(API + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`${res.status} ${path.split('?')[0]} — ${detail.slice(0, 160)}`);
    }
    return res.json();
  };

  window.VPPublish = {
    getToken: () => sessionStorage.getItem(SESSION_KEY) || '',
    setToken: (token, remember) => {
      if (remember) sessionStorage.setItem(SESSION_KEY, token);
      else sessionStorage.removeItem(SESSION_KEY);
    },

    /* Comprueba el token y devuelve a quién pertenece y si puede escribir. */
    check: async (token, owner, repo) => {
      const me = await api(token, '/user').catch(() => null);
      const info = await api(token, `/repos/${owner}/${repo}`);
      return {
        user: me ? me.login : '(token de grano fino)',
        repo: info.full_name,
        canWrite: Boolean(info.permissions && info.permissions.push),
        branch: info.default_branch,
      };
    },

    /* files: [{ path, bytes }]  ·  prune: prefijos donde borrar lo que sobre */
    commit: async ({ token, owner, repo, branch, message, files, prune = [] }, log = () => {}, confirmDelete = async () => false) => {
      log('Leyendo la rama…');
      const ref = await api(token, `/repos/${owner}/${repo}/git/ref/heads/${branch}`);
      const headSha = ref.object.sha;
      const headCommit = await api(token, `/repos/${owner}/${repo}/git/commits/${headSha}`);
      const baseTree = headCommit.tree.sha;

      log('Comparando con lo que ya hay…');
      const tree = await api(token, `/repos/${owner}/${repo}/git/trees/${baseTree}?recursive=1`);
      const existing = new Map(tree.tree.filter((n) => n.type === 'blob').map((n) => [n.path, n.sha]));

      const entries = [];
      let uploaded = 0;
      let skipped = 0;

      for (const file of files) {
        const sha = await gitSha(file.bytes);
        if (existing.get(file.path) === sha) { skipped += 1; continue; }
        log(`Subiendo ${file.path}…`);
        const blob = await api(token, `/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({ content: b64(file.bytes), encoding: 'base64' }),
        });
        entries.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
        uploaded += 1;
      }

      /* Lo que había bajo los prefijos gestionados y ya no está, se borra. Nunca
         a ciegas: se pregunta antes con la lista concreta, porque un catálogo
         desactualizado en un navegador podría borrar el trabajo de otro. */
      const wanted = new Set(files.map((f) => f.path));
      const toDelete = [];
      prune.forEach((prefix) => {
        [...existing.keys()].forEach((path) => {
          if (path.startsWith(prefix) && !wanted.has(path)) toDelete.push(path);
        });
      });
      let removed = 0;
      if (toDelete.length) {
        if (await confirmDelete(toDelete)) {
          toDelete.forEach((path) => entries.push({ path, mode: '100644', type: 'blob', sha: null }));
          removed = toDelete.length;
        } else {
          log(`Conservadas ${toDelete.length} imágenes que ya no están en el catálogo.`);
        }
      }

      if (!entries.length) return { changed: false, uploaded: 0, skipped, removed: 0 };

      log('Creando el commit…');
      const newTree = await api(token, `/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({ base_tree: baseTree, tree: entries }),
      });
      const commit = await api(token, `/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
      });
      await api(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha }),
      });

      return { changed: true, uploaded, skipped, removed, sha: commit.sha.slice(0, 7) };
    },
  };
})();
