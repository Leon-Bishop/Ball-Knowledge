/* Licensed football-player portraits for club clues.
   Seven distinct, correctly attributed players are required before a club
   becomes eligible; ten is the preferred collection target. */
(function(){
'use strict';
const FALLBACK_MINIMUM=7;
let database={clubs:{}};
const shuffledCache=new Map();
function hashString(text){
 let hash=2166136261;
 for(const ch of String(text)){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619)}
 return hash>>>0;
}
function availablePlayers(clubId){
 const list=database.clubs?.[clubId]?.players;
 if(!Array.isArray(list))return [];
 const seen=new Set();
 const valid=list.filter(p=>{
  if(!p?.photoUrl||!p?.sourceUrl||!p?.license||!p?.author||!p?.playerName||
     !p?.wikidataQid||p?.clubId!==clubId||seen.has(p.wikidataQid))return false;
  seen.add(p.wikidataQid);
  return true;
 });
 return valid.length>=FALLBACK_MINIMUM?valid:[];
}
function shuffledPlayers(clubId,roundSeed=''){
 const key=String(clubId)+'|'+String(roundSeed);
 if(shuffledCache.has(key))return shuffledCache.get(key);
 const players=availablePlayers(clubId).slice();
 let seed=hashString(key);
 // Deterministic Fisher-Yates: a fresh, unbiased-by-position order for each
 // daily or regular question, with no repeated portrait within the question.
 function nextRandom(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 for(let i=players.length-1;i>0;i--){
  const j=nextRandom()%(i+1);
  [players[i],players[j]]=[players[j],players[i]];
 }
 shuffledCache.set(key,players);
 return players;
}
function getPlayer(clubId,roundSeed='',clueIndex=0,alternative=0){
 const pool=shuffledPlayers(clubId,roundSeed);
 if(pool.length<FALLBACK_MINIMUM)return null;
 const n=((Number(clueIndex)||0)+(Number(alternative)||0))%pool.length;
 return pool[(n+pool.length)%pool.length];
}
window.BKPlayerPhotos={getPlayer,availablePlayers,ready:null};
window.BKPlayerPhotos.ready=fetch('./assets/player-photo-db.json',{cache:'no-cache'})
 .then(r=>{if(!r.ok)throw Error('Player-photo catalog missing');return r.json()})
 .then(j=>{
  if(j.version!==1||!j.clubs||typeof j.clubs!=='object')throw Error('Unexpected player-photo catalog format');
  database=j;shuffledCache.clear();
  window.dispatchEvent(new Event('bk-player-photos-ready'));
 }).catch(e=>console.info('Player photo clues unavailable:',e.message));
})();
