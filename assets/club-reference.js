/* Read-only league reference; never linked to the guess field. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const source='./assets/standings.json';
let latest=null,lastContext=null,loadPromise=null;
const tx=key=>typeof tr==='function'?tr(key):key;
function el(tag,cls,content){const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=content;return node}
// For multiple selected leagues, the dropdown changes ONLY the standings being
// displayed. It never searches or changes the hidden quiz or the guess input.
let selectedStandingsLeague=null;
function renderDirectory(leagues){
 $('clubDirectory').classList.remove('hidden');
 const select=$('clubDirectoryLeague');
 const previous=selectedStandingsLeague||select.value;
 select.replaceChildren(...leagues.map(league=>{
  const option=el('option','',league.name);option.value=league.id;return option;
 }));
 select.value=leagues.some(l=>l.id===previous)?previous:leagues[0].id;
 selectedStandingsLeague=select.value;
 select.onchange=()=>{
  selectedStandingsLeague=select.value;
  const league=leagues.find(l=>l.id===select.value);
  if(league)showStandings(league);
 };
 showStandings(leagues.find(l=>l.id===select.value));
}
function renderTable(league,standings){
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
// All leagues, single or multi-selection, use the same real standings feed.
let standingsRequest=0;
async function showStandings(league){
 if(!league)return;
 const request=++standingsRequest;
 $('standingsReference').classList.add('hidden');
 $('standingsRows').replaceChildren();
 $('referenceNotice').textContent=tx('standingsLoading');
 $('referenceUpdated').textContent='';
 const standings=await fetchStandings();
 // Ignore obsolete results when a player switches leagues while data loads.
 if(request!==standingsRequest)return;
 renderTable(league,standings);
}
function show(selected,leagues,pool){
 const target=$('clubReference');if(!target)return;
 const list=leagues.filter(league=>selected.has(league.id));
 target.classList.toggle('hidden',!list.length);
 if(!list.length){++standingsRequest;return}
 lastContext={selected:new Set(selected),leagues,pool};
 $('referenceTitle').textContent=tx('liveStandings');
 if(list.length===1){
  $('clubDirectory').classList.add('hidden');
  selectedStandingsLeague=null;
  showStandings(list[0]);
 }else renderDirectory(list);
}
function localize(){
 for(const [id,key] of [['standingsClubHead','referenceClub'],['standingsPlayedHead','referencePlayed'],['standingsPointsHead','referencePoints'],['directoryLeagueLabel','referenceBrowse']])$(id).textContent=tx(key);
 if(lastContext)show(lastContext.selected,lastContext.leagues,lastContext.pool);
}
window.BallKnowledgeReference={show,localize};
})();
