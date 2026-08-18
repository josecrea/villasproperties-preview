/* Villa's Properties — Back Office del catálogo.

   Sustituye el editor de prototipo (que solo tocaba la primera propiedad en
   memoria) por la gestión real del catálogo: elegir inmueble, editar sus datos,
   subir y ordenar fotos, y exportar el resultado para subirlo al repositorio.

   Las fotos subidas se reescalan y se convierten a webp en el navegador antes de
   guardarse: así lo que se exporta pesa lo que tiene que pesar. */
(() => {
  'use strict';

  const panel = document.getElementById('adminPanel');
  const body = panel && panel.querySelector('.adminbody');
  if (!body || !window.VPStore || !window.VP_PROPERTIES) return;

  const store = window.VPStore;
  const props = window.VP_PROPERTIES;
  const MAX_EDGE = 1600;
  const QUALITY = 0.82;

  const $ = (sel, ctx = body) => ctx.querySelector(sel);
  const euro = (v) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v || 0);

  let current = props[0];
  let dirty = false;

  /* ---------- Conversión de imagen en el navegador ---------- */
  const toWebp = (file) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo convertir'))), 'image/webp', QUALITY);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Imagen no válida'));
    img.src = URL.createObjectURL(file);
  });

  /* ---------- Persistencia ---------- */
  const patch = (changes) => {
    const all = store.readOverrides();
    all[current.slug] = { ...(all[current.slug] || {}), ...changes };
    store.writeOverrides(all);
    Object.assign(current, changes);
    dirty = true;
    status(`✓ Guardado · ${new Date().toLocaleTimeString('es-ES')}`);
  };

  const status = (msg) => {
    const el = document.getElementById('statusMsg');
    if (el) el.textContent = msg;
  };

  /* ---------- Interfaz ---------- */
  const FIELDS = [
    { key: 'title', label: 'Título', type: 'text' },
    { key: 'titleShort', label: 'Título corto (SEO)', type: 'text' },
    { key: 'price', label: 'Precio €', type: 'number' },
    { key: 'built', label: 'Superficie construida m²', type: 'number' },
    { key: 'useful', label: 'Superficie útil m²', type: 'number' },
    { key: 'beds', label: 'Dormitorios', type: 'number' },
    { key: 'baths', label: 'Baños', type: 'number' },
    { key: 'town', label: 'Municipio', type: 'text' },
    { key: 'zone', label: 'Zona', type: 'text' },
    { key: 'address', label: 'Dirección', type: 'text' },
    { key: 'status', label: 'Estado comercial', type: 'select', options: ['En venta', 'Reservado', 'Vendido', 'Off-market'] },
    { key: 'strategy', label: 'Estrategia', type: 'text' },
    { key: 'year', label: 'Año', type: 'number' },
    { key: 'floor', label: 'Planta', type: 'text' },
    { key: 'orientation', label: 'Orientación', type: 'text' },
    { key: 'community', label: 'Comunidad €/mes', type: 'number' },
    { key: 'energy', label: 'Certificado energético', type: 'text' },
  ];

  const render = () => {
    body.innerHTML = `
      <div class="bo-pick">
        <label for="boProperty">Inmueble</label>
        <select id="boProperty">
          ${props.map((p) => `<option value="${p.slug}"${p.slug === current.slug ? ' selected' : ''}>${p.titleShort || p.title} · ${euro(p.price)}</option>`).join('')}
        </select>
      </div>

      <div class="bo-tabs" role="tablist">
        <button class="bo-tab is-on" data-tab="fotos" type="button">Fotos</button>
        <button class="bo-tab" data-tab="datos" type="button">Datos</button>
        <button class="bo-tab" data-tab="texto" type="button">Textos</button>
        <button class="bo-tab" data-tab="publicar" type="button">Publicar</button>
      </div>

      <section class="bo-panel" data-panel="fotos">
        <div class="bo-drop" id="boDrop">
          <strong>Arrastra aquí las fotos</strong>
          <span>o</span>
          <label class="btn green" for="boFiles">Elegir archivos</label>
          <input id="boFiles" type="file" accept="image/*" multiple hidden>
          <p class="bo-hint">Se reescalan a ${MAX_EDGE} px y se convierten a webp automáticamente. La primera es la portada.</p>
        </div>
        <div class="bo-grid" id="boPhotos"></div>
      </section>

      <section class="bo-panel" data-panel="datos" hidden>
        <div class="fields">
          ${FIELDS.map((f) => `
            <div class="field${['title', 'titleShort', 'address'].includes(f.key) ? ' full' : ''}">
              <label for="bo_${f.key}">${f.label}</label>
              ${f.type === 'select'
                ? `<select id="bo_${f.key}" data-field="${f.key}">${f.options.map((o) => `<option${current[f.key] === o ? ' selected' : ''}>${o}</option>`).join('')}</select>`
                : `<input id="bo_${f.key}" data-field="${f.key}" type="${f.type}" value="${current[f.key] ?? ''}">`}
            </div>`).join('')}
        </div>
      </section>

      <section class="bo-panel" data-panel="texto" hidden>
        <div class="fields">
          <div class="field full">
            <label for="bo_highlight">Titular de la ficha</label>
            <input id="bo_highlight" data-field="highlight" type="text" value="${(current.highlight || '').replace(/"/g, '&quot;')}">
          </div>
          <div class="field full">
            <label for="bo_description">Descripción (un párrafo por línea en blanco)</label>
            <textarea id="bo_description" rows="12">${(current.description || []).join('\n\n')}</textarea>
          </div>
          <div class="field full">
            <label for="bo_features">Características (una por línea)</label>
            <textarea id="bo_features" rows="5">${(current.features || []).join('\n')}</textarea>
          </div>
          <div class="field full">
            <label for="bo_equipment">Equipamiento (una por línea)</label>
            <textarea id="bo_equipment" rows="4">${(current.equipment || []).join('\n')}</textarea>
          </div>
        </div>
        <div class="adminactions"><button class="btn green" id="boSaveText" type="button">Guardar textos</button></div>
      </section>

      <section class="bo-panel" data-panel="publicar" hidden>
        <p class="bo-hint">Los cambios viven en este navegador. Para que los vea todo el mundo hay que subir al repositorio los dos archivos que se descargan aquí.</p>
        <div class="bo-steps">
          <div><strong>1.</strong> Descarga el catálogo y las fotos.</div>
          <div><strong>2.</strong> Descomprime el ZIP dentro de <code>assets/img/</code>, respetando las carpetas.</div>
          <div><strong>3.</strong> Sustituye <code>properties-data.js</code> por el descargado y haz commit.</div>
        </div>
        <div class="adminactions" style="flex-wrap:wrap">
          <button class="btn green" id="boExportData" type="button">Descargar properties-data.js</button>
          <button class="btn" id="boExportZip" type="button">Descargar fotos (ZIP)</button>
          <button class="btn" id="boReset" type="button">Descartar cambios locales</button>
        </div>
      </section>

      <div class="statusmsg" id="statusMsg">Catálogo real. Lo que edites se guarda en este navegador hasta que lo exportes.</div>`;

    renderPhotos();
    wire();
  };

  const renderPhotos = () => {
    const grid = $('#boPhotos');
    const images = current.images || [];
    grid.innerHTML = images.map((src, i) => `
      <figure class="bo-photo${i === 0 ? ' is-cover' : ''}">
        <img src="${store.mediaSrc(src)}"${store.mediaAttr(src)} alt="Foto ${i + 1}" loading="lazy">
        ${i === 0 ? '<figcaption>Portada</figcaption>' : ''}
        <div class="bo-photo-actions">
          <button type="button" data-move="${i}" data-dir="-1" title="Mover antes" aria-label="Mover antes">←</button>
          <button type="button" data-move="${i}" data-dir="1" title="Mover después" aria-label="Mover después">→</button>
          <button type="button" data-del="${i}" title="Eliminar" aria-label="Eliminar">×</button>
        </div>
      </figure>`).join('') || '<p class="bo-hint">Este inmueble no tiene fotos todavía.</p>';
    store.hydrate(grid);
  };

  const addFiles = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    status(`Procesando ${list.length} foto(s)…`);
    const added = [];
    for (const file of list) {
      try {
        const blob = await toWebp(file);
        const id = `${current.slug}-${Date.now()}-${Math.round(performance.now())}-${added.length}`;
        await store.putMedia(id, blob);
        added.push(`vpmedia:${id}`);
      } catch (error) {
        console.warn('[backoffice] imagen descartada:', file.name, error);
      }
    }
    patch({ images: [...(current.images || []), ...added] });
    renderPhotos();
    status(`✓ ${added.length} foto(s) añadidas · ${(current.images || []).length} en total`);
  };

  const wire = () => {
    $('#boProperty').addEventListener('change', (e) => {
      current = props.find((p) => p.slug === e.target.value) || props[0];
      render();
    });

    body.querySelectorAll('.bo-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        body.querySelectorAll('.bo-tab').forEach((t) => t.classList.toggle('is-on', t === tab));
        body.querySelectorAll('.bo-panel').forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
      });
    });

    /* Fotos */
    $('#boFiles').addEventListener('change', (e) => addFiles(e.target.files));
    const drop = $('#boDrop');
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
    drop.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

    $('#boPhotos').addEventListener('click', async (e) => {
      const move = e.target.closest('[data-move]');
      const del = e.target.closest('[data-del]');
      const images = [...(current.images || [])];
      if (move) {
        const i = Number(move.dataset.move);
        const j = i + Number(move.dataset.dir);
        if (j < 0 || j >= images.length) return;
        [images[i], images[j]] = [images[j], images[i]];
        patch({ images });
        renderPhotos();
      }
      if (del) {
        const i = Number(del.dataset.del);
        const [removed] = images.splice(i, 1);
        if (store.isLocal(removed)) await store.deleteMedia(removed.slice(8));
        patch({ images });
        renderPhotos();
      }
    });

    /* Datos: se guardan al salir del campo */
    body.querySelectorAll('[data-field]').forEach((input) => {
      input.addEventListener('change', () => {
        const key = input.dataset.field;
        const value = input.type === 'number' ? (input.value === '' ? null : Number(input.value)) : input.value;
        const changes = { [key]: value };
        /* El €/m² deja de cuadrar si cambian precio o superficie. */
        if (key === 'price' || key === 'built') {
          const price = key === 'price' ? value : current.price;
          const built = key === 'built' ? value : current.built;
          if (price && built) changes.pricePerM2 = Math.round(price / built);
        }
        patch(changes);
      });
    });

    /* Textos */
    $('#boSaveText').addEventListener('click', () => {
      patch({
        highlight: $('#bo_highlight').value.trim(),
        description: $('#bo_description').value.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean),
        features: $('#bo_features').value.split('\n').map((t) => t.trim()).filter(Boolean),
        equipment: $('#bo_equipment').value.split('\n').map((t) => t.trim()).filter(Boolean),
      });
    });

    /* Exportar */
    $('#boExportData').addEventListener('click', exportData);
    $('#boExportZip').addEventListener('click', exportZip);
    $('#boReset').addEventListener('click', async () => {
      if (!window.confirm('Se descartan todos los cambios locales (datos y fotos subidas). ¿Seguir?')) return;
      await store.reset();
      location.reload();
    });
  };

  /* ---------- Exportación ---------- */
  const finalPath = (slug, index) => `assets/img/${slug}/${String(index + 1).padStart(2, '0')}.webp`;

  const exportData = () => {
    /* Las rutas locales se traducen a la ruta definitiva del repositorio. */
    const clean = props.map((p) => {
      const { photos, ...rest } = p;
      return { ...rest, images: (p.images || []).map((src, i) => (store.isLocal(src) ? finalPath(p.slug, i) : src)) };
    });

    const file = `/* Villa's Properties — catálogo de inmuebles (fuente única).
   EXPORTADO DESDE EL BACK OFFICE el ${new Date().toISOString().slice(0, 10)}.
   Las rutas de imagen apuntan a assets/img/<slug>/NN.webp: descomprime ahí el
   ZIP que descarga el Back Office en el mismo paso. */
window.VP_PROPERTIES = ${JSON.stringify(clean, null, 2)};

/* Lo editado en el Back Office (vp-store.js) manda sobre el catálogo base. */
if (window.VPStore) {
  window.VP_PROPERTIES = window.VPStore.applyOverrides(window.VP_PROPERTIES);
  window.VP_PROPERTIES.forEach((p) => {
    p.photos = (p.images || []).length;
    p.video = p.video || null;
    p.floorplans = p.floorplans || [];
    p.documents = p.documents || [];
  });
}
`;
    store.download(new Blob([file], { type: 'text/javascript' }), 'properties-data.js');
    status('✓ properties-data.js descargado. Falta el ZIP de fotos.');
  };

  const exportZip = async () => {
    status('Preparando el ZIP…');
    const files = [];
    for (const p of props) {
      const images = p.images || [];
      for (let i = 0; i < images.length; i++) {
        const src = images[i];
        let bytes;
        if (store.isLocal(src)) {
          const blob = await store.getMedia(src.slice(8));
          if (!blob) continue;
          bytes = new Uint8Array(await blob.arrayBuffer());
        } else {
          /* Las que ya están en el repo se incluyen igual: así el ZIP es la
             carpeta completa y no hay que casar a mano cuáles son nuevas. */
          const res = await fetch(src);
          if (!res.ok) continue;
          bytes = new Uint8Array(await res.arrayBuffer());
        }
        files.push({ name: finalPath(p.slug, i), bytes });
      }
    }
    if (!files.length) { status('No hay fotos que exportar.'); return; }
    store.download(store.zip(files), 'villas-fotos.zip');
    status(`✓ ZIP con ${files.length} fotos descargado.`);
  };

  render();

  /* Al cerrar el panel, refrescamos la página si algo cambió: el catálogo se
     lee al arrancar y así se ve el resultado real, no una vista a medias. */
  document.getElementById('closeAdmin')?.addEventListener('click', () => {
    if (dirty) location.reload();
  });
})();
