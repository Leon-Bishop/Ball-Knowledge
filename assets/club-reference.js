/* Read-only league reference; never linked to the guess field. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const source='./assets/standings.json';
let latest=null,lastContext=null,loadPromise=null;
const tx=key=>typeof tr==='function'?tr(key):key;
function el(tag,cls,content){const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=content;return node}
// All selected leagues are visible together. The directory is never searched
// or filtered using the player's guess, and never uses the secret session order.
const countryFlags={'Belgium':'🇧🇪','Brazil':'🇧🇷','England':'🏴','France':'🇫🇷','Germany':'🇩🇪','Greece':'🇬🇷','Italy':'🇮🇹','Netherlands':'🇳🇱','Portugal':'🇵🇹','Scotland':'🏴','Spain':'🇪🇸','Turkey':'🇹🇷'};
const directoryOpen=new Map();
function renderDirectory(leagues,pool){
 $('standingsReference').classList.add('hidden');
 $('clubDirectory').classList.remove('hidden');
 $('referenceNotice').textContent='';
 const groups=$('clubDirectoryRows');
 const total=pool.filter(team=>leagues.some(league=>league.id===team.league_id)).length;
 $('directoryIntro').textContent=tx('referenceAllClubs').replace('{count}',String(total)).replace('{leagues}',String(leagues.length));
 const sections=leagues.map(league=>{
  const clubs=pool.filter(team=>team.league_id===league.id).sort((a,b)=>a.name.localeCompare(b.name,document.documentElement.lang||'en'));
  const section=el('details','directory-league-card');
  section.open=directoryOpen.get(league.id)??true;
  section.addEventListener('toggle',()=>directoryOpen.set(league.id,section.open));
  const header=el('summary','directory-league-header');
  const mark=el('span','directory-league-flag',countryFlags[league.country]||'⚽');
  mark.setAttribute('aria-hidden','true');
  const info=el('span','directory-league-info');
  info.append(el('strong','directory-league-name',league.name),el('span','directory-league-count',tx('referenceClubCount').replace('{count}',String(clubs.length))));
  const chevron=el('span','directory-league-chevron','⌄');chevron.setAttribute('aria-hidden','true');
  header.append(mark,info,chevron);
  const rows=el('div','directory-team-grid');
  for(const club of clubs)rows.append(el('div','directory-team-name',club.name));
  section.append(header,rows);
  return section;
 });
 groups.replaceChildren(...sections);
}
function renderTable(league,standings){
 $('clubDirectory').classList.add('hidden');
 $('standingsReference').classList.remove('hidden');
 const rows=standings?.leagues?.[league.id]?.rows;
 if(!Array.isArray(rows)||!rows.length){
  $('standingsReference').classList.add('hidden');$('referenceNotice').textContent=tx('standingsUnavailable');return;
 }
 $('referenceNotice').textContent='';
 const updated=standings.leagues[league.id].updatedAt;
 $('referenceUpdated').textContent=updated?tx('standingsUpdated')+' '+new Date(updated).toLocaleDateString(document.documentElement.lang||'en'):'';
 const tbody=$('standingsRows');
 tbody.replaceChildren(...rows.map(row=>{
  const tr=document.createElement('tr');
  for(const value of [row.rank,row.team,row.played,row.points]){
   tr.append(el('td','',String(value??'–')));
  }return tr;
 }));
 $('standingsSource').textContent=tx('standingsSource')+' · '+league.name;
}
async function fetchStandings(){
 if(latest)return latest;
 if(loadPromise)return loadPromise;
 loadPromise=fetch(source,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Not found');return r.json()}).then(j=>latest=j).catch(()=>null).finally(()=>{loadPromise=null});
 return loadPromise;
}
async function show(selected,leagues,pool){
 const target=$('clubReference');if(!target)return;
 const list=leagues.filter(league=>selected.has(league.id));
 target.classList.toggle('hidden',!list.length);
 if(!list.length)return;
 lastContext={selected:new Set(selected),leagues,pool};
 $('referenceUpdated').textContent='';
 if(list.length===1){
  $('referenceTitle').textContent=list[0].name+' · '+tx('liveStandings');
  $('clubDirectory').classList.add('hidden');
  $('standingsReference').classList.add('hidden');
  $('referenceNotice').textContent=tx('standingsLoading');
  const standings=await fetchStandings();
  // Do not replace a newer session's reference if an old fetch completes later.
  if(lastContext?.selected.size!==1||!lastContext.selected.has(list[0].id))return;
  renderTable(list[0],standings);
 }else{
  $('referenceTitle').textContent=tx('clubDirectory');
  renderDirectory(list,pool);
 }
}
function localize(){
 for(const [id,key] of [['standingsClubHead','referenceClub'],['standingsPlayedHead','referencePlayed'],['standingsPointsHead','referencePoints']])$(id).textContent=tx(key);
 if(lastContext)show(lastContext.selected,lastContext.leagues,lastContext.pool);
}
window.BallKnowledgeReference={show,localize};
})();
