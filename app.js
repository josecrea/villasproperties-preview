(() => {
  const $=(s,c=document)=>c.querySelector(s); const $$=(s,c=document)=>[...c.querySelectorAll(s)];
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
    images:p.images,url:`property.html?ref=${p.ref}`,ref:p.ref
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
      grid.innerHTML=demoProps.map(p=>`<article class="property${p.status==='Sold'?' sold':''}" data-stagger><a class="media" href="${p.url}" aria-label="Ver ficha de ${p.name}"><div class="media-img"${p.images&&p.images[0]?` style="background-image:url(${p.images[0]})"`:''}></div><span class="tag">${p.status} · ${p.strategy}</span></a><div class="pinfo"><div><h3><a href="${p.url}">${p.name}</a></h3><div class="meta">${p.zone} · Tenerife</div></div><div class="price">${fmt(p.price)}</div></div><div class="specrow" aria-label="Características de ${p.name}">${propertySpecs(p)}</div><div class="intelrow"><div><small>Ref.</small><strong>${p.ref||'—'}</strong></div><div><small>€/m²</small><strong>${p.psm}</strong></div><div><small>Fotos</small><strong>${(p.images||[]).length}</strong></div><div><small>Ficha</small><strong>Completa</strong></div></div><div class="propcta"><a class="btn green" href="${p.url}">Ver ficha ↗</a><a class="btn" target="_blank" rel="noopener" href="${waMoreInfo(p)}">WhatsApp</a></div></article>`).join('');
    });
  };
  renderProps();

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
  const featureDefs=[
    {n:'Superficie',u:'m²',qty:78},{n:'Habitaciones',qty:2},{n:'Baños',qty:2},
    {n:'Parking',u:'plazas',qty:1},{n:'Trastero',bool:1,on:0},{n:'Piscina',bool:1,on:1},
    {n:'Terraza',u:'m²',qty:18},{n:'Jardín',bool:1,on:0},{n:'Ascensor',bool:1,on:1},
    {n:'Vistas',bool:1,on:1},{n:'A/C',bool:1,on:1},{n:'Amueblado',bool:1,on:0}
  ];
  const fb=$('#features');
  if(fb){
    fb.innerHTML=featureDefs.map((f,i)=>{const num=String(i+1).padStart(2,'0');
      return f.bool
        ? `<button class="feature ${f.on?'active':''}" data-i="${i}" type="button"><span class="eye">${num}</span><div style="margin-top:9px">${f.n}</div></button>`
        : `<div class="feature qty"><span class="eye">${num}</span><div style="margin-top:9px">${f.n}</div><div class="qtyrow"><input type="number" min="0" value="${f.qty}" data-qi="${i}" aria-label="${f.n}"><span>${f.u||''}</span></div></div>`;
    }).join('');
    fb.addEventListener('click',e=>{const b=e.target.closest('button.feature[data-i]');if(b){const i=+b.dataset.i;featureDefs[i].on=featureDefs[i].on?0:1;b.classList.toggle('active')}});
    fb.addEventListener('input',e=>{const inp=e.target.closest('input[data-qi]');if(inp)featureDefs[+inp.dataset.qi].qty=+inp.value||0});
  }
  $('#saveAdmin')?.addEventListener('click',()=>{const n=$('#aName'),p=$('#aPrice'),z=$('#aZone'),st=$('#aStatus'),sg=$('#aStrategy'); if(n)demoProps[0].name=n.value;if(p)demoProps[0].price=p.value;if(z)demoProps[0].zone=z.value;if(st)demoProps[0].status=st.value;if(sg)demoProps[0].strategy=sg.value;
    const q=nm=>featureDefs.find(f=>f.n===nm)?.qty, on=nm=>!!featureDefs.find(f=>f.n===nm)?.on;
    if(q('Superficie')!=null)demoProps[0].area=q('Superficie'); if(q('Habitaciones')!=null)demoProps[0].beds=q('Habitaciones'); if(q('Baños')!=null)demoProps[0].baths=q('Baños'); if(q('Parking')!=null)demoProps[0].parking=q('Parking')>0; if(q('Terraza')!=null)demoProps[0].terrace=q('Terraza'); demoProps[0].pool=on('Piscina');
    renderProps(); const m=$('#statusMsg');if(m)m.textContent='✓ Cambios aplicados a la sesión del prototipo.'});
  $('#videoFile')?.addEventListener('change',e=>{const f=e.target.files?.[0],v=$('#heroVideo');if(!f||!v)return;v.src=URL.createObjectURL(f);v.dataset.variant='local';v.classList.add('active');v.play().catch(()=>{})});
  // Property images uploader injected next to the hero video field
  const vfField=$('#videoFile')?.closest('.field');
  if(vfField && !$('#propImages')){
    const w=document.createElement('div'); w.className='field full';
    w.innerHTML='<label>Imágenes de la propiedad (demo local)</label><input id="propImages" type="file" accept="image/*" multiple>';
    vfField.after(w);
    $('#propImages').addEventListener('change',e=>{const files=[...(e.target.files||[])]; if(!files.length)return; demoProps[0].images=files.map(f=>URL.createObjectURL(f)); renderProps(); const m=$('#statusMsg'); if(m)m.textContent=`✓ ${files.length} imagen(es) cargadas en la sesión.`;});
  }
})();