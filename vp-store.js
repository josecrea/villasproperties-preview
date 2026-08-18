/* Villa's Properties — almacén local del Back Office.

   El sitio es estático (GitHub Pages, sin servidor), así que lo que se edita en
   el Back Office vive en el navegador:
     - los CAMPOS en localStorage, que es síncrono y por tanto ya está disponible
       en el primer render (precio, título, características…);
     - las FOTOS en IndexedDB como blobs, porque no caben en localStorage.

   Las fotos locales se referencian como `vpmedia:<id>`; quien las pinta deja el
   hueco y `hydrate()` sustituye por un objectURL cuando IndexedDB responde.

   `exportAll()` produce el properties-data.js y un ZIP con las imágenes listos
   para subir al repositorio: así el catálogo real lo mantiene el equipo. */
(() => {
  'use strict';

  const LS_KEY = 'vpCatalogueOverrides';
  const DB_NAME = 'vp-backoffice';
  const DB_STORE = 'media';

  /* ---------- Campos (localStorage, síncrono) ---------- */
  const readOverrides = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
  };
  const writeOverrides = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));

  const applyOverrides = (list) => {
    const overrides = readOverrides();
    return list.map((p) => (overrides[p.slug] ? { ...p, ...overrides[p.slug] } : p));
  };

  /* ---------- Medios (IndexedDB, asíncrono) ---------- */
  let dbPromise = null;
  const db = () => {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains(DB_STORE)) req.result.createObjectStore(DB_STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  };

  const tx = async (mode, fn) => {
    const database = await db();
    return new Promise((resolve, reject) => {
      const t = database.transaction(DB_STORE, mode);
      const store = t.objectStore(DB_STORE);
      const request = fn(store);
      t.oncomplete = () => resolve(request ? request.result : undefined);
      t.onerror = () => reject(t.error);
    });
  };

  const putMedia = (id, blob) => tx('readwrite', (s) => s.put(blob, id));
  const getMedia = (id) => tx('readonly', (s) => s.get(id));
  const deleteMedia = (id) => tx('readwrite', (s) => s.delete(id));
  const listMedia = () => tx('readonly', (s) => s.getAllKeys());

  /* Caché de objectURL: revocarlos cada vez rompería las imágenes ya pintadas. */
  const urls = new Map();
  const urlFor = async (id) => {
    if (urls.has(id)) return urls.get(id);
    const blob = await getMedia(id);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urls.set(id, url);
    return url;
  };

  /* Sustituye los huecos `vpmedia:` por la imagen real cuando llega de IndexedDB. */
  const hydrate = async (root = document) => {
    const nodes = [...root.querySelectorAll('[data-vp-media]')];
    await Promise.all(nodes.map(async (node) => {
      const id = node.dataset.vpMedia;
      const url = await urlFor(id);
      if (!url) return;
      if (node.tagName === 'IMG') node.src = url;
      else node.style.backgroundImage = `url(${url})`;
      delete node.dataset.vpMedia;
    }));
  };

  /* ---------- ZIP sin dependencias (método store: los webp ya van comprimidos) ---------- */
  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c >>> 0;
    }
    return table;
  })();
  const crc32 = (bytes) => {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  };

  const zip = (files) => {
    const enc = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;

    files.forEach(({ name, bytes }) => {
      const nameBytes = enc.encode(name);
      const sum = crc32(bytes);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(8, 0, true);           // método 0 = store
      local.setUint32(14, sum, true);
      local.setUint32(18, bytes.length, true);
      local.setUint32(22, bytes.length, true);
      local.setUint16(26, nameBytes.length, true);
      chunks.push(new Uint8Array(local.buffer), nameBytes, bytes);

      const dir = new DataView(new ArrayBuffer(46));
      dir.setUint32(0, 0x02014b50, true);
      dir.setUint16(4, 20, true);
      dir.setUint16(6, 20, true);
      dir.setUint16(10, 0, true);
      dir.setUint32(16, sum, true);
      dir.setUint32(20, bytes.length, true);
      dir.setUint32(24, bytes.length, true);
      dir.setUint16(28, nameBytes.length, true);
      dir.setUint32(42, offset, true);
      central.push(new Uint8Array(dir.buffer), nameBytes);

      offset += 30 + nameBytes.length + bytes.length;
    });

    const centralSize = central.reduce((n, c) => n + c.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
  };

  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  /* Helpers de pintado: una foto local (`vpmedia:<id>`) se pinta como hueco y
     la rellena hydrate(). */
  const isLocal = (src) => typeof src === 'string' && src.startsWith('vpmedia:');
  const mediaSrc = (src) => (isLocal(src) ? 'assets/brand/logo-placeholder.webp' : src);
  const mediaAttr = (src) => (isLocal(src) ? ` data-vp-media="${src.slice(8)}"` : '');

  window.VPStore = {
    isLocal,
    mediaSrc,
    mediaAttr,
    readOverrides,
    writeOverrides,
    applyOverrides,
    putMedia,
    getMedia,
    deleteMedia,
    listMedia,
    urlFor,
    hydrate,
    zip,
    download,
    reset: () => {
      localStorage.removeItem(LS_KEY);
      return tx('readwrite', (s) => s.clear());
    },
  };
})();
