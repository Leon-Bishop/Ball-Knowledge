/* Ball Knowledge selectable football crests. No club is assigned by default. */
(()=>{
'use strict';
const DEFAULT='';
const FENER='https://raw.githubusercontent.com/JoseArroyave/football-logos/main/logos/turkey/Fenerbah%C3%A7e.svg';
let catalog=null,clubs=new Map(),viewer='',profileChoice='',pendingChoice='',saveHandler=null,dialog=null,active='turkey-super-lig';
const pendingListeners=new Set();
const norm=s=>String(s||'').trim().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();
function local(name){try{return localStorage.getItem('bk-selected-club:'+norm(name))||''}catch{return ''}}
function store(name,id){try{localStorage.setItem('bk-selected-club:'+norm(name),id)}catch{}}
function chosen(name,server){
 const own=viewer&&norm(viewer)===norm(name);
 const candidate=(own?local(name):'')||server||(own?profileChoice:'')||'';
 return clubs.has(candidate)?candidate:'';
}
function badge(el,id){
 const t=clubs.get(id);
 if(!t){el.classList.remove('club-avatar','pixel-avatar');el.replaceChildren();el.textContent='⚽';el.title='';return;}
 el.classList.add('club-avatar');
 el.classList.remove('pixel-avatar');
 el.style.removeProperty('background-image');
 el.replaceChildren();
 const img=document.createElement('img');img.className='club-avatar-img';img.alt='';
 img.referrerPolicy='no-referrer';img.loading='lazy';
 const fallback=document.createElement('span');fallback.className='club-avatar-letters';fallback.textContent=t.short||'FC';
 // Try independent verified sources in order rather than silently losing the crest
 // when a CDN, SVG endpoint or network request fails.
 const sources=[t.logo,t.fallbackLogo,t.lastResortLogo].filter(Boolean);
 let sourceIndex=0;
 fallback.hidden=sources.length>0;img.hidden=sources.length===0;
 img.addEventListener('error',()=>{
  sourceIndex++;
  if(sourceIndex<sources.length){
   img.src=sources[sourceIndex];
  }else{
   img.hidden=true;
   fallback.hidden=false;
  }
 });
 if(sources.length)img.src=sources[0];
 el.append(img,fallback);
 el.title=t.name;el.setAttribute('aria-hidden','true');
}
function apply(el,name,serverId){
 if(!el)return;
 name=String(name||'').trim();
 if(!name){
  el.replaceChildren();el.textContent='⚽';el.classList.remove('club-avatar','pixel-avatar');
  el.removeAttribute('data-avatar-owner');el.removeAttribute('data-avatar-server');return;
 }
 el.dataset.avatarOwner=name;
 if(serverId)el.dataset.avatarServer=serverId;else el.removeAttribute('data-avatar-server');
 const id=chosen(name,serverId);
 if(id)badge(el,id);
 else{el.classList.remove('club-avatar','pixel-avatar');el.replaceChildren();el.textContent='⚽';el.title='';}
}
function refresh(){
 document.querySelectorAll('[data-avatar-owner]').forEach(el=>apply(el,el.dataset.avatarOwner,el.dataset.avatarServer));
 document.querySelectorAll('[data-choose-club]').forEach(b=>{b.disabled=false;b.textContent=b.dataset.pendingClub==='1'?words().choose:words().change});
}
function setProfile(name,avatarTeamId){viewer=String(name||'').trim();profileChoice=avatarTeamId||'';refresh()}
function words(){
 return document.documentElement.lang==='tr'
 ?{title:'Takım armanı seç',search:'Takım veya lig ara…',change:'Armanı değiştir',choose:'Takım arması seç',hint:'214 kulüp · 12 lig',none:'Kulüp bulunamadı',close:'Kapat'}
 :{title:'Choose your club badge',search:'Search teams or leagues…',change:'Change badge',choose:'Choose club badge',hint:'214 clubs · 12 leagues',none:'No clubs found',close:'Close'};
}
function changeButton(){
 const b=document.createElement('button');b.type='button';b.className='outline-button club-change-button';
 b.dataset.chooseClub='1';b.textContent=words().change;b.addEventListener('click',open);return b;
}
function getDialog(){
 if(dialog)return dialog;
 const cover=document.createElement('div');cover.className='club-picker-backdrop';cover.hidden=true;
 const sheet=document.createElement('div');sheet.className='club-picker-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','clubPickerHeading');
 const grab=document.createElement('div');grab.className='club-picker-grab';
 const head=document.createElement('div');head.className='club-picker-heading';
 const title=document.createElement('div'),h=document.createElement('h2'),sub=document.createElement('p');
 h.id='clubPickerHeading';title.append(h,sub);
 const close=document.createElement('button');close.type='button';close.className='club-picker-close';close.textContent='×';close.onclick=hide;
 head.append(title,close);
 const search=document.createElement('input');search.type='search';search.className='club-picker-search';search.autocomplete='off';
 const tabs=document.createElement('div');tabs.className='club-picker-tabs';tabs.setAttribute('role','tablist');
 const list=document.createElement('div');list.className='club-picker-list';
 sheet.append(grab,head,search,tabs,list);cover.append(sheet);document.body.append(cover);
 cover.addEventListener('click',e=>{if(e.target===cover)hide()});
 document.addEventListener('keydown',e=>{if(!cover.hidden&&e.key==='Escape')hide()});
 search.addEventListener('input',draw);
 dialog={cover,search,tabs,list,h,sub,close};return dialog;
}
function draw(){
 const ui=getDialog(),t=words();ui.h.textContent=t.title;ui.sub.textContent=t.hint;
 ui.close.setAttribute('aria-label',t.close);ui.search.placeholder=t.search;
 const query=norm(ui.search.value);
 ui.tabs.replaceChildren();
 if(!catalog)return;
 for(const league of catalog.leagues){
  const b=document.createElement('button');b.type='button';b.className='club-picker-tab';
  b.setAttribute('role','tab');b.textContent=league.name;
  const selected=!query&&active===league.id;
  b.classList.toggle('selected',selected);b.setAttribute('aria-selected',String(selected));
  b.onclick=()=>{active=league.id;ui.search.value='';draw()};
  ui.tabs.append(b);
 }
 ui.list.replaceChildren();
 const matching=catalog.clubs.filter(c=>query
  ?norm(c.name).includes(query)||norm(catalog.leagues.find(l=>l.id===c.leagueId)?.name).includes(query)
  :c.leagueId===active);
 if(!matching.length){const p=document.createElement('p');p.className='club-picker-empty';p.textContent=t.none;ui.list.append(p);return}
 const grid=document.createElement('div');grid.className='club-picker-grid';
 for(const team of matching){
  const b=document.createElement('button');b.type='button';b.className='club-picker-option';
  b.title=team.name;b.setAttribute('aria-label',team.name);b.setAttribute('aria-pressed',String((viewer?chosen(viewer,profileChoice):pendingChoice)===team.id));
  const pic=document.createElement('span');pic.className='club-picker-badge';badge(pic,team.id);
  const txt=document.createElement('span');txt.className='club-picker-name';txt.textContent=team.name;
  b.append(pic,txt);b.onclick=()=>select(team.id);grid.append(b);
 }
 ui.list.append(grid);
}
function open(){
 const ui=getDialog();ui.cover.hidden=false;document.body.classList.add('club-picker-visible');
 active='turkey-super-lig';ui.search.value='';draw();requestAnimationFrame(()=>ui.search.focus());
}
function hide(){if(dialog)dialog.cover.hidden=true;document.body.classList.remove('club-picker-visible')}
async function select(id){
 if(!clubs.has(id))return;
 if(!viewer){
  pendingChoice=id;
  for(const callback of pendingListeners)callback(id);
  refresh();hide();return;
 }
 store(viewer,id);profileChoice=id;refresh();hide();
 if(saveHandler)try{
  const r=await saveHandler(id);
  if(r&&r.avatarTeamId){profileChoice=r.avatarTeamId;store(viewer,r.avatarTeamId);refresh()}
 }catch(e){console.info('Badge saved in this browser; Worker sync pending:',e.message||e)}
}
function pendingButton(onChange){
 if(typeof onChange==='function')pendingListeners.add(onChange);
 const b=document.createElement('button');
 b.type='button';b.className='outline-button club-change-button';
 b.dataset.chooseClub='1';b.dataset.pendingClub='1';b.textContent=words().choose;
 b.addEventListener('click',open);return b;
}
function pendingBadge(el){
 const club=clubs.get(pendingChoice);
 if(club)badge(el,pendingChoice);
 else{el.classList.remove('club-avatar','pixel-avatar');el.replaceChildren();el.textContent='⚽';el.title='';}
}
function commitPending(username){
 const id=pendingChoice;
 if(id&&username)store(username,id);
 pendingChoice='';
 return id;
}
function resetPending(){pendingChoice='';}

window.BKAvatars={apply,setProfile,setSaveHandler(fn){saveHandler=fn},changeButton,pendingButton,pendingBadge,commitPending,resetPending,getPending:()=>pendingChoice,openPicker:open,refresh,count:214};
fetch('./assets/club-avatar-catalog.json').then(r=>{if(!r.ok)throw Error('Catalog not found');return r.json()}).then(data=>{
 if(data.clubs.length!==214)throw Error('Unexpected club count');
 catalog=data;clubs=new Map(data.clubs.map(c=>[c.id,c]));refresh();
 if(dialog&&!dialog.cover.hidden)draw();
}).catch(e=>console.warn('Club badge catalog failed:',e));
})();