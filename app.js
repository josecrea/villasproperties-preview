(() => {
  const $=(s,c=document)=>c.querySelector(s); const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const E=v=>(window.VPSafe?VPSafe.esc(v):String(v??''));
  const U=v=>(window.VPSafe?VPSafe.url(v):String(v??''));
  const fmt=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(v||0));

  // Brand integrity: keep the geometric A visually, but preserve the real letter in the DOM/accessibility tree.
  $$('.wordmark .a').forEach(a=>{
    [...a.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.remove());
    if(!a.querySelector('.sr-letter')){
      const s=document.createElement('span'); s.className='sr-letter'; s.textContent='A';
      s.style.cssText='position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
      a.appendChild(s);
    }
  });
  $$('.brand').forEach(b=>b.setAttribute('aria-label','Villa’s Properties'));

  const duplicateHeroLockup=$('.hero .hero-content > .lockup');
  if(duplicateHeroLockup) duplicateHeroLockup.remove();

  const localRoutes=[
    ['https://villasproperties.es/valoracion-gratis-tenerife','valuation.html'],
    ['https://villasproperties.es/market-impact','market-impact.html'],
    ['https://villasproperties.es/contactus','contact.html']
  ];
  $$('a[href]').forEach(a=>{
    const href=a.getAttribute('href')||'';
    const match=localRoutes.find(([from])=>href.startsWith(from));
    if(match) a.setAttribute('href',match[1]);
  });

  if(!$('#propertySpecStyles')){
    const style=document.createElement('style'); style.id='propertySpecStyles';
    style.textContent=`
      .specrow{align-items:center;gap:16px!important}
      .spec{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-size:11px}
      .spec svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round;opacity:.82}
      .propertygrid.catalogue-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      @media(max-width:820px){.propertygrid.catalogue-grid{grid-template-columns:1fr}}
      .propcta{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
      .propcta .btn{flex:1 1 130px;justify-content:center;font-size:9px}
      .property .media.hasimg{background-size:cover!important;background-position:center!important}
      .feature.qty{display:flex;flex-direction:column}
      .qtyrow{display:flex;align-items:center;gap:6px;margin-top:8px}
      .qtyrow input{width:66px;border:1px solid var(--line);border-radius:8px;padding:6px 8px;font-size:13px;background:#fff;color:var(--ink)}
      .qtyrow span{font-size:10px;color:var(--muted)}
      .property.sold .media{filter:grayscale(1) contrast(.96) brightness(.98)}
      .property.sold{opacity:.92}
      .property.sold .tag{background:rgba(16,20,22,.92);color:#fff}
      .property.sold .price{color:var(--muted)}
      .property{position:relative;transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s ease}
      .property .media{overflow:hidden;position:relative}
      .property .media-img{position:absolute;inset:0;background-size:cover;background-position:center;background-image:linear-gradient(145deg,#c7b39d,#675a50);transition:transform .85s cubic-bezier(.16,1,.3,1);will-change:transform;z-index:0}
      .property:nth-child(2) .media-img{background-image:linear-gradient(145deg,#aebbb5,#496159)}
      .property:nth-child(3) .media-img{background-image:linear-gradient(145deg,#b8b0a4,#5a534b)}
      .property:hover{transform:translateY(-8px)}
      .property:hover .media{transform:none;box-shadow:0 34px 66px -34px rgba(16,20,22,.55)}
      .property:hover .media-img{transform:scale(1.12)}
      .property.sold:hover .media-img{transform:scale(1.05)}
    `;
    document.head.appendChild(style);
  }

  const icons={
    area:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5z"/><path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4"/></svg>',
    bed:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-7h18v7M3 15h18M6 11V8.5A1.5 1.5 0 0 1 7.5 7h3A1.5 1.5 0 0 1 12 8.5V11M12 11V8.5A1.5 1.5 0 0 1 13.5 7h3A1.5 1.5 0 0 1 18 8.5V11M5 18v2M19 18v2"/></svg>',
    bath:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2zM7 13V6a2 2 0 0 1 4 0M9 20v1M17 20v1"/></svg>',
    parking:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 17V7h3.3a3.2 3.2 0 1 1 0 6.4H10M10 13.4h3.3"/></svg>',
    pool:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16c2 0 2 1.5 4 1.5S9 16 11 16s2 1.5 4 1.5S17 16 19 16s2 1.5 2 1.5M3 20c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 2 1M8 15V7a2 2 0 0 1 4 0M8 11h7"/></svg>',
    terrace:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h16M6 11v8M18 11v8M8 15h8M12 5v6M8 7l4-3 4 3"/></svg>'
  };
  const spec=(icon,value,label)=>`<span class="spec" title="${label}">${icons[icon]}<span>${value?`<strong>${value}</strong>`:''}${label?` ${label}`:''}</span></span>`;

  const WA_PHONE='34667384965'; // Villa's Properties WhatsApp
  /* Catálogo real: properties-data.js es la fuente única (la comparte la ficha
     individual). Se mantiene un fallback mínimo por si el script no carga. */
  const demoProps=(window.VP_PROPERTIES||[]).map(p=>({
    name:p.title,zone:`${p.zone} · ${p.town}`,price:p.price,status:p.status,strategy:p.strategy,
    market:'—',yield:'—',psm:String(p.pricePerM2).replace(/\B(?=(\d{3})+(?!\d))/g,'.'),docs:'Ficha',
    area:p.built,beds:p.beds,baths:p.baths,parking:/garaje/i.test(p.features.join(' ')),
    pool:/piscina/i.test(p.equipment.join(' ')),terrace:(p.features.join(' ').match(/(?:Terraza|Balcón) de (\d+) m²/)||[])[1]||0,
    images:p.images,url:`property.html?ref=${p.ref}`,ref:p.ref,town:p.town,psmRaw:p.pricePerM2
  }));
  const waMoreInfo=p=>`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(`Hola, me interesa "${p.name}" en ${p.zone} (${fmt(p.price)}). ¿Me podéis dar más información?`)}`;
  const waShare=p=>`https://wa.me/?text=${encodeURIComponent(`${p.name} · ${p.zone} · ${fmt(p.price)} — Villa's Properties\n${location.href}`)}`;
  const propertySpecs=p=>[
    spec('area',`${p.area} m²`,'superficie'),
    spec('bed',p.beds,'hab.'),
    spec('bath',p.baths,p.baths===1?'baño':'baños'),
    p.parking?spec('parking','1','parking'):'',
    p.pool?spec('pool','','piscina'):'',
    p.terrace?spec('terrace',`${p.terrace} m²`,'terraza'):''
  ].filter(Boolean).join('');
  const renderProps=()=>{
    $$('#propertyGrid, #catalogueGrid').forEach(grid=>{
      grid.innerHTML=demoProps.map(p=>`<article class="property${p.status==='Sold'?' sold':''}" data-stagger data-town="${p.town||''}" data-price="${p.price}" data-psm="${p.psmRaw||0}" data-beds="${p.beds}"><a class="media" href="${U(p.url)}" aria-label="Ver ficha de ${E(p.name)}"><div class="media-img"${p.images&&p.images[0]?` style="background-image:url(${U(window.VPStore?VPStore.mediaSrc(p.images[0]):p.images[0])})"${window.VPStore?VPStore.mediaAttr(p.images[0]):''}`:''}></div><span class="tag">${E(p.status)} · ${E(p.strategy)}</span></a><div class="pinfo"><div><h3><a href="${U(p.url)}">${E(p.name)}</a></h3><div class="meta">${E(p.zone)} · Tenerife</div></div><div class="price">${fmt(p.price)}</div></div><div class="specrow" aria-label="Características de ${E(p.name)}">${propertySpecs(p)}</div><div class="intelrow"><div><small>Ref.</small><strong>${E(p.ref||'—')}</strong></div><div><small>€/m²</small><strong>${p.psm}</strong></div><div><small>Fotos</small><strong>${(p.images||[]).length}</strong></div><div><small>Ficha</small><strong>Completa</strong></div></div><div class="propcta"><a class="btn green" href="${U(p.url)}">Ver ficha ↗</a><a class="btn" target="_blank" rel="noopener" href="${waMoreInfo(p)}">WhatsApp</a></div></article>`).join('');
    });
  };
  renderProps();
  window.VPStore?.hydrate();

  const reviews=$$('.review'); let r=0; const show=n=>{if(!reviews.length)return;r=(n+reviews.length)%reviews.length;reviews.forEach((x,i)=>x.classList.toggle('active',i===r))};
  $('#prevReview')?.addEventListener('click',()=>show(r-1)); $('#nextReview')?.addEventListener('click',()=>show(r+1)); if(reviews.length)setInterval(()=>show(r+1),7000);

  const clock=$('#tenerifeClock'); const tick=()=>{if(!clock)return; clock.textContent=new Intl.DateTimeFormat('es-ES',{timeZone:'Atlantic/Canary',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())}; tick(); setInterval(tick,1000);
  const year=$('#year'); if(year)year.textContent=new Date().getFullYear();

  const headerIn=$('.headerin');
  if(headerIn && !$('#menuToggle')){
    const menu=document.createElement('button'); menu.id='menuToggle'; menu.type='button'; menu.className='menu-toggle'; menu.textContent='Menu';
    const config=$('#mobileAdmin'); headerIn.insertBefore(menu,config||null);
    const drawer=document.createElement('div'); drawer.id='mobileDrawer'; drawer.innerHTML='<nav><a href="properties.html">Properties</a><a href="sell.html">Sell</a><a href="buy.html">Buy</a><a href="finance.html">Finance</a><a href="invest.html">Invest</a><a href="intelligence.html">Intelligence</a><a href="insights.html">Insights</a><a href="valuation.html">Valoración gratis</a><a href="contact.html">Talk to an advisor</a></nav>';
    drawer.style.cssText='position:fixed;z-index:70;inset:76px 0 auto 0;background:#fbfaf7;color:#20242a;border-bottom:1px solid rgba(32,36,42,.16);padding:20px;transform:translateY(-140%);transition:transform .3s ease';
    const nav=drawer.querySelector('nav'); nav.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:0';
    [...nav.children].forEach(a=>a.style.cssText='padding:15px 8px;border-bottom:1px solid rgba(32,36,42,.12);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase');
    document.body.appendChild(drawer);
    let opened=false; menu.addEventListener('click',()=>{opened=!opened;drawer.style.transform=opened?'translateY(0)':'translateY(-140%)';menu.textContent=opened?'Close':'Menu'});
    nav.addEventListener('click',()=>{opened=false;drawer.style.transform='translateY(-140%)';menu.textContent='Menu'});
  }

  const panel=$('#adminPanel'),overlay=$('#overlay'); const close=()=>{overlay?.classList.remove('open');panel?.classList.remove('open')}; $('#closeAdmin')?.addEventListener('click',close); overlay?.addEventListener('click',close);
  /* El editor del catálogo vive en backoffice.js: aquí solo queda el cierre
     del panel, que es puro comportamiento de interfaz. */
})();
/* Preloader de marca: la web tiene que estar ENTERA antes de descubrirla,
   vídeo de fondo incluido. Al salir el preloader no debe quedar nada cargando:
   ni el hero en negro esperando al vídeo, ni tipografías saltando.

   Se espera, en este orden:
     1. DOM montado
     2. tipografías cargadas
     3. el vídeo del hero listo — es un iframe de Vimeo, así que se escucha su
        evento `load` (el reproductor ya está montado) y se le da un respiro
        para que tenga imagen; con un iframe de otro dominio no hay forma de
        saber su buffer sin cargar el SDK de Vimeo
     4. un frame pintado

   Solo entonces sale el preloader, y solo entonces arranca la ola de color del
   titular (el CSS la cuelga de body.is-loaded).

   Red de seguridad a 12 s por si Vimeo no responde: mejor entrar con el fondo a
   medias que quedarse fuera. Y si este script ni se ejecutara, el CSS retira el
   preloader igual. */
(function () {
  var salida = false;
  var quitar = function () {
    if (salida) return;
    salida = true;
    document.body.classList.add('is-loaded');
  };

  // 8 s: si Vimeo no ha respondido para entonces, es que no va a responder
  // (p. ej. el dominio no está autorizado y devuelve 401). Mejor entrar con el
  // fondo a medias que dejar al visitante mirando el logo.
  window.setTimeout(quitar, 8000);

  var RESPIRO_VIDEO_MS = 700;   // margen tras montar el reproductor

  var esperarVideo = function () {
    return new Promise(function (res) {
      var con = navigator.connection || {};
      if (con.saveData === true || /(^|-)2g/.test(con.effectiveType || '')) return res();

      var v = document.querySelector('video');
      if (v) {
        if (v.readyState >= 3) return res();
        v.addEventListener('canplay', res, { once: true });
        v.addEventListener('error', res, { once: true });
        return;
      }

      var marco = document.querySelector('.hero-vimeo, .hero iframe');
      if (!marco) return res();

      // Si ya venía cargado, `load` no volverá a dispararse: se comprueba antes.
      var yaEsta = false;
      try { yaEsta = !!(marco.contentWindow && marco.contentDocument
        && marco.contentDocument.readyState === 'complete'); } catch (e) { /* otro dominio */ }
      if (yaEsta) return window.setTimeout(res, RESPIRO_VIDEO_MS);

      marco.addEventListener('load', function () {
        window.setTimeout(res, RESPIRO_VIDEO_MS);
      }, { once: true });
      marco.addEventListener('error', res, { once: true });
    });
  };

  var listo = function () {
    var fuentes = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fuentes
      .then(esperarVideo)
      .then(function () {
        requestAnimationFrame(function () { requestAnimationFrame(quitar); });
      })
      .catch(quitar);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', listo, { once: true });
  } else {
    listo();
  }
})();
