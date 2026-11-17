/* Ball Knowledge: current-squad, face-only, licensed player clues.
 * Only verified, face-detected crops in the curated database are eligible.
 * Never fall back to the old historical player-photo-db.json collection.
 */
(function(){
'use strict';
const MINIMUM=3;
const MAX_ROSTER_AGE_MS=21*24*60*60*1000;
const CURRENT_SECTIONS=new Set(['current squad','first-team squad','first team squad','squad','senior squad','first team','first-team','selectie','kern','effectif','kader','kadro','plantel','plantilla','rosa','squadra','giocatori in rosa','roster']);
let database={clubs:{}};
const shuffledCache=new Map();
function hashString(text){
 let hash=2166136261;
 for(const ch of String(text)){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619)}
 return hash>>>0;
}
function availablePlayers(clubId){
 const club=database.clubs?.[clubId];
 const checkedAt=Date.parse(club?.checkedAt||'');
 if(!Number.isFinite(checkedAt)||Date.now()-checkedAt>MAX_ROSTER_AGE_MS||checkedAt>Date.now()+86_400_000)return [];
 const list=club?.players;
 if(!Array.isArray(list))return [];
 const seen=new Set();
 const valid=list.filter(p=>{
  if(!p||p.clubId!==clubId||p.verifiedCurrent!==true||p.faceCrop!==true||
     !p.photoUrl?.startsWith('./assets/player-headshots/')||
     !p.sourceUrl?.startsWith('https://commons.wikimedia.org/')||
     !p.membershipSource?.startsWith('https://')||
     !CURRENT_SECTIONS.has(p.membershipSection)||
     !p.license||!p.author||!p.playerName||!p.wikidataQid||
     seen.has(p.wikidataQid))return false;
  seen.add(p.wikidataQid);
  return true;
 });
 // Never present one or two old/uncertain portraits as a complete club set.
 return valid.length>=MINIMUM?valid.slice(0,4):[];
}
function shuffledPlayers(clubId,roundSeed=''){
 const key=String(clubId)+'|'+String(roundSeed);
 if(shuffledCache.has(key))return shuffledCache.get(key);
 const players=availablePlayers(clubId).slice();
 let seed=hashString(key);
 function nextRandom(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 for(let i=players.length-1;i>0;i--){
  const j=nextRandom()%(i+1);[players[i],players[j]]=[players[j],players[i]];
 }
 shuffledCache.set(key,players);
 return players;
}
function getPlayer(clubId,roundSeed='',clueIndex=0,alternative=0){
 const pool=shuffledPlayers(clubId,roundSeed);
 if(pool.length<MINIMUM)return null;
 return pool[((Number(clueIndex)||0)+(Number(alternative)||0))%pool.length];
}
window.BKPlayerPhotos={getPlayer,availablePlayers,ready:null};
window.BKPlayerPhotos.ready=fetch('./assets/player-headshot-db.json',{cache:'no-cache'})
 .then(r=>{if(!r.ok)throw Error('Curated headshot catalog missing');return r.json()})
 .then(j=>{
  if(j.version!==2||!j.clubs||typeof j.clubs!=='object')throw Error('Unexpected headshot catalog');
  database=j;shuffledCache.clear();
  window.dispatchEvent(new Event('bk-player-photos-ready'));
 }).catch(e=>console.info('Current-squad headshots unavailable:',e.message));
})();
