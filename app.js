(() => {
  const $=(s,c=document)=>c.querySelector(s); const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const fmt=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(v||0));
  const demoProps=[
    {name:'Ocean Residence',zone:'Costa Adeje',price:245000,status:'For sale',strategy:'Home',market:'-6.8%',yield:'6.9%',psm:'3,141',docs:'Reviewed',specs:['78 m²','2 hab.','2 baños','Parking','Piscina','18 m² terraza']},
    {name:'Yield Opportunity',zone:'Tenerife Sur',price:198000,status:'Investment',strategy:'Value-add',market:'-7.4%',yield:'7.1%',psm:'1,768',docs:'Reviewed',specs:['112 m²','3 hab.','2 baños','Parking']}
  ];
  const renderProps=()=>{const grid=$('#propertyGrid'); if(!grid)return; grid.innerHTML=demoProps.map(p=>`<article class="property"><div class="media"><span class="tag">${p.status} · ${p.strategy}</span></div><div class="pinfo"><div><h3>${p.name}</h3><div class="meta">${p.zone} · demo de prototipo</div></div><div class="price">${fmt(p.price)}</div></div><div class="specrow">${p.specs.map(x=>`<span class="spec">${x}</span>`).join('')}</div><div class="intelrow"><div><small>Market</small><strong>${p.market}</strong></div><div><small>Yield</small><strong>${p.yield}</strong></div><div><small>€/m²</small><strong>${p.psm}</strong></div><div><small>Docs</small><strong>${p.docs}</strong></div></div></article>`).join('')};
  renderProps();
  const reviews=$$('.review'); let r=0; const show=n=>{if(!reviews.length)return;r=(n+reviews.length)%reviews.length;reviews.forEach((x,i)=>x.classList.toggle('active',i===r))};
  $('#prevReview')?.addEventListener('click',()=>show(r-1)); $('#nextReview')?.addEventListener('click',()=>show(r+1)); if(reviews.length)setInterval(()=>show(r+1),7000);
  const clock=$('#tenerifeClock'); const tick=()=>{if(!clock)return; clock.textContent=new Intl.DateTimeFormat('es-ES',{timeZone:'Atlantic/Canary',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())}; tick(); setInterval(tick,1000);
  const year=$('#year'); if(year)year.textContent=new Date().getFullYear();
  const headerIn=$('.headerin');
  if(headerIn && !$('#menuToggle')){
    const menu=document.createElement('button'); menu.id='menuToggle'; menu.type='button'; menu.className='menu-toggle'; menu.textContent='Menu';
    const config=$('#mobileAdmin'); headerIn.insertBefore(menu,config||null);
    const drawer=document.createElement('div'); drawer.id='mobileDrawer'; drawer.innerHTML='<nav><a href="properties.html">Properties</a><a href="sell.html">Sell</a><a href="buy.html">Buy</a><a href="finance.html">Finance</a><a href="invest.html">Invest</a><a href="intelligence.html">Intelligence</a><a href="insights.html">Insights</a><a href="index.html#contact">Talk to an advisor</a></nav>';
    drawer.style.cssText='position:fixed;z-index:70;inset:76px 0 auto 0;background:#fbfaf7;color:#20242a;border-bottom:1px solid rgba(32,36,42,.16);padding:20px;transform:translateY(-140%);transition:transform .3s ease';
    const nav=drawer.querySelector('nav'); nav.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:0';
    [...nav.children].forEach(a=>a.style.cssText='padding:15px 8px;border-bottom:1px solid rgba(32,36,42,.12);font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase');
    document.body.appendChild(drawer);
    let opened=false; menu.addEventListener('click',()=>{opened=!opened;drawer.style.transform=opened?'translateY(0)':'translateY(-140%)';menu.textContent=opened?'Close':'Menu'});
    nav.addEventListener('click',()=>{opened=false;drawer.style.transform='translateY(-140%)';menu.textContent='Menu'});
  }
  const panel=$('#adminPanel'),overlay=$('#overlay'); const close=()=>{overlay?.classList.remove('open');panel?.classList.remove('open')}; $('#closeAdmin')?.addEventListener('click',close); overlay?.addEventListener('click',close);
  const features=['Superficie','Habitaciones','Baños','Parking','Trastero','Piscina','Terraza','Jardín','Ascensor','Vistas','A/C','Amueblado']; const fb=$('#features'); if(fb){fb.innerHTML=features.map((x,i)=>`<button class="feature ${[0,1,2,3,5,6,8,9,10].includes(i)?'active':''}" type="button"><span class="eye">${String(i+1).padStart(2,'0')}</span><div style="margin-top:9px">${x}</div></button>`).join(''); fb.addEventListener('click',e=>{const b=e.target.closest('.feature');if(b)b.classList.toggle('active')})}
  $('#saveAdmin')?.addEventListener('click',()=>{const n=$('#aName'),p=$('#aPrice'),z=$('#aZone'),st=$('#aStatus'),sg=$('#aStrategy'); if(n)demoProps[0].name=n.value;if(p)demoProps[0].price=p.value;if(z)demoProps[0].zone=z.value;if(st)demoProps[0].status=st.value;if(sg)demoProps[0].strategy=sg.value; renderProps(); const m=$('#statusMsg');if(m)m.textContent='✓ Cambios aplicados a la sesión del prototipo.'});
  $('#videoFile')?.addEventListener('change',e=>{const f=e.target.files?.[0],v=$('#heroVideo');if(!f||!v)return;v.src=URL.createObjectURL(f);v.classList.add('active');v.play().catch(()=>{})});
})();
