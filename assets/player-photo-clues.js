/* Licensed football player photo clues. Never fabricate player/photo associations.
   Images only appear when a club has >=10 independently attributed player records. */
(function(){
'use strict';
const MINIMUM=10;
let database={clubs:{}};
function getPlayer(clubId){
 const list=database.clubs?.[clubId]?.players;
 if(!Array.isArray(list)||list.length<MINIMUM)return null;
 const valid=list.filter(p=>p?.photoUrl&&p?.sourceUrl&&p?.license&&p?.author&&p?.playerName&&p?.clubId===clubId);
 if(valid.length<MINIMUM)return null;
 // Stable selection for the duration of a quiz question; avoid unstable UI when
 // multiple clues are re-rendered after a guess.
 let hash=2166136261;
 for(const ch of String(clubId)){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619)}
 return valid[(hash>>>0)%valid.length];
}
window.BKPlayerPhotos={getPlayer,ready:null};
window.BKPlayerPhotos.ready=fetch('./assets/player-photo-db.json',{cache:'no-cache'})
 .then(r=>{if(!r.ok)throw Error('Player-photo catalog missing');return r.json()})
 .then(j=>{
  if(j.version!==1||!j.clubs||typeof j.clubs!=='object')throw Error('Unexpected player-photo catalog format');
  database=j;
  window.dispatchEvent(new Event('bk-player-photos-ready'));
 }).catch(e=>console.info('Player photo clues unavailable; keeping emoji clues:',e.message));
})();