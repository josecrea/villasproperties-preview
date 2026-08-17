(() => {
'use strict';
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
const BACKOFFICE_HASH='07b4386deeed32b69f2db935dc16aa7890e4270e30a7adfee6fd34ccb17bdd64';
const SESSION_KEY='vpBackofficeUnlocked';
let failedAttempts=0, lockedUntil=0;
const icons={
 m2:'<svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
 bed:'<svg viewBox="0 0 24 24"><path d="M3 18V8M21 18v-6a2 2 0 0 0-2-2H9a3 3 0 0 0-3 3v5M3 15h18"/></svg>',
 bath:'<svg viewBox="0 0 24 24"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/></svg>',
 parking:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>',
 storage:'<svg viewBox="0 0 24 24"><path d="M4 8h16v12H4zM6 4h12l2 4H4l2-4Z"/></svg>',
 pool:'<svg viewBox="0 0 24 24"><path d="M3 15c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2"/></svg>',
 terrace:'<svg viewBox="0 0 24 24"><path d="M3 11h18M6 11v9M18 11v9"/></svg>',
 garden:'<svg viewBox="0 0 24 24"><path d="M12 21V9M12 14c-5 0-7-3-7-7 5 0 7 3 7 7Z"/></svg>',
 lift:'<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18"/><path d="m9 8 3-3 3 3M9 16l3 3 3-3"/></svg>',
 views:'<svg viewBox="0 0 24 24"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
 ac:'<svg viewBox="0 0 24 24"><path d="M12 2v20M4.9 6l14.2 12M19.1 6 4.9 18M2 12h20"/></svg>',
 furnished:'<svg viewBox="0 0 24 24"><path d="M4 13h16v6H4zM6 13V9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4"/></svg>'
};
let features=[
 {key:'m2',name:'Superficie',active:true,value:'78',unit:'m²'},
 {key:'bed',name:'Habitaciones',active:true,value:'2',unit:'hab.'},
 {key:'bath',name:'Baños',active:true,value:'2',unit:'baños'},
 {key:'parking',name:'Parking',active:true,value:'1',unit:'plaza'},
 {key:'storage',name:'Trastero',active:false,value:'',unit:''},
 {key:'pool',name:'Piscina',active:true,value:'',unit:''},
 {key:'terrace',name:'Terraza',active:true,value:'18',unit:'m²'},
 {key:'garden',name:'Jardín',active:false,value:'',unit:''},
 {key:'lift',name:'Ascensor',active:true,value:'',unit:''},
 {key:'views',name:'Vistas',active:true,value:'',unit:''},
 {key:'ac',name:'A/C',active:true,value:'',unit:''},
 {key:'furnished',name:'Amueblado',active:false,value:'',unit:''}
];
let properties=[
 {name:'Ocean Residence',zone:'Costa Adeje',price:245000,status:'For sale',strategy:'Home',market:'-6.8%',yield:'6.9%',psm:'3,141',docs:'Reviewed'},
 {name:'Yield Opportunity',zone:'Tenerife Sur',price:198000,status:'Investment',strategy:'Value-add',market:'-7.4%',yield:'7.1%',psm:'1,768',docs:'Reviewed'}
];
const euro=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(v||0));
const specHTML=f=>`<span class="spec">${icons[f.key]||''}<span>${f.value?`${f.value} ${f.unit}`:f.name}</span></span>`;
function renderFeatures(){
 const box=q('#features'); box.innerHTML='';
 features.forEach((f,i)=>{
  const el=document.createElement('div'); el.className='feature'+(f.active?' active':'');
  el.innerHTML=`${icons[f.key]}<div class="fname">${f.name}</div>${f.value!==''?`<div class="fval">${f.value} ${f.unit}</div>`:''}`;
  el.addEventListener('click',()=>{features[i].active=!features[i].active;renderFeatures();renderProperties();});
  box.appendChild(el);
 });
}
function renderProperties(){
 const grid=q('#propertyGrid'); grid.innerHTML='';
 properties.forEach((p,idx)=>{
  const article=document.createElement('article'); article.className='property';
  const fs=idx===0?features.filter(f=>f.active).slice(0,6):[
   {key:'m2',name:'Superficie',value:'112',unit:'m²'},
   {key:'bed',name:'Habitaciones',value:'3',unit:'hab.'},
   {key:'bath',name:'Baños',value:'2',unit:'baños'},
   {key:'parking',name:'Parking',value:'1',unit:'plaza'}
  ];
  article.innerHTML=`<div class="media"><span class="tag">${p.status} · ${p.strategy}</span></div><div class="pinfo"><div><h3>${p.name}</h3><div class="meta">${p.zone}</div></div><div class="price">${euro(p.price)}</div></div><div class="specrow">${fs.map(specHTML).join('')}</div><div class="intelrow"><div><small>Market</small><strong>${p.market}</strong></div><div><small>Yield</small><strong>${p.yield}</strong></div><div><small>€/m²</small><strong>${p.psm}</strong></div><div><small>Docs</small><strong>${p.docs}</strong></div></div>`;
  grid.appendChild(article);
 });
}
renderFeatures(); renderProperties();

const overlay=q('#overlay'), panel=q('#adminPanel'), gate=q('#authGate'), authForm=q('#authForm'), authPassword=q('#authPassword'), authError=q('#authError');
const openPanel=()=>{overlay.classList.add('open');panel.classList.add('open');};
const closePanel=()=>{overlay.classList.remove('open');panel.classList.remove('open');};
const showGate=()=>{authError.textContent='';authPassword.value='';gate.classList.add('open');gate.setAttribute('aria-hidden','false');setTimeout(()=>authPassword.focus(),30);};
const hideGate=()=>{gate.classList.remove('open');gate.setAttribute('aria-hidden','true');};
const unlocked=()=>sessionStorage.getItem(SESSION_KEY)==='1';
const requestAdmin=e=>{e?.preventDefault();e?.stopImmediatePropagation();unlocked()?openPanel():showGate();};
q('#openAdmin').addEventListener('click',requestAdmin,true); q('#manageProps').addEventListener('click',requestAdmin,true);
q('#closeAdmin').addEventListener('click',closePanel); overlay.addEventListener('click',closePanel); q('#authCancel').addEventListener('click',hideGate);
q('#logoutAdmin').addEventListener('click',()=>{sessionStorage.removeItem(SESSION_KEY);closePanel();});
async function sha256(value){const data=new TextEncoder().encode(value);const digest=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');}
authForm.addEventListener('submit',async e=>{
 e.preventDefault(); const now=Date.now();
 if(now<lockedUntil){authError.textContent='Demasiados intentos. Espera unos segundos.';return;}
 const digest=await sha256(authPassword.value);
 if(digest===BACKOFFICE_HASH){failedAttempts=0;sessionStorage.setItem(SESSION_KEY,'1');hideGate();openPanel();}
 else{failedAttempts++;authError.textContent='Contraseña incorrecta.';authPassword.select();if(failedAttempts>=5){failedAttempts=0;lockedUntil=Date.now()+30000;authError.textContent='Demasiados intentos. Acceso bloqueado durante 30 segundos.';}}
});

q('#saveAdmin').addEventListener('click',()=>{
 properties[0].name=q('#aName').value; properties[0].price=Number(q('#aPrice').value); properties[0].zone=q('#aZone').value; properties[0].status=q('#aStatus').value; properties[0].strategy=q('#aStrategy').value; properties[0].market=q('#aMarket').value; properties[0].yield=q('#aYield').value; properties[0].psm=q('#aPsm').value; properties[0].docs=q('#aDocs').value;
 renderProperties(); q('#statusMsg').textContent='✓ Cambios aplicados a esta sesión de preview.';
});
q('#newProp').addEventListener('click',()=>q('#statusMsg').textContent='Nueva propiedad: en producción abrirá el formulario completo conectado a Odoo/API.');

const film=q('#film'), filmCtl=q('#filmCtl'), filmState=q('#filmState'); let playing=true;
filmCtl.addEventListener('click',()=>{playing=!playing;film.classList.toggle('paused',!playing);filmCtl.textContent=playing?'Ⅱ':'▶';filmState.textContent=playing?'Brand film · preview':'Brand film · paused';});
const hero=q('.hero'), heroVideo=q('#heroVideo'); hero.insertBefore(heroVideo,hero.firstChild);
q('#videoFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;heroVideo.src=URL.createObjectURL(f);heroVideo.classList.add('active');heroVideo.play();filmState.textContent='Local hero video · preview';});

const reviews=qa('.review');let ri=0;const showReview=i=>{ri=(i+reviews.length)%reviews.length;reviews.forEach((r,j)=>r.classList.toggle('active',j===ri));};
q('#prevReview').addEventListener('click',()=>showReview(ri-1));q('#nextReview').addEventListener('click',()=>showReview(ri+1));setInterval(()=>showReview(ri+1),7000);
qa('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id==='#')return;const target=q(id);if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'});}}));
})();