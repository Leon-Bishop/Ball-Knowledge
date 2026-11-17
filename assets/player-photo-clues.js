/* Ball Knowledge: current-squad, face-only, licensed player clues.
 * Only verified, face-detected crops in the curated database are eligible.
 * Never fall back to the old historical player-photo-db.json collection.
 */
(function(){
'use strict';
const MINIMUM=3;
const MAX_ROSTER_AGE_MS=21*24*60*60*1000;
const ALLOWED_VERIFICATION=new Set([
 'official_club_squad','confirmed_current_loan','wikidata_current_club',
 'wikipedia_squad_stale_p54','wikipedia_squad_no_p54'
]);
// Parent-club Wikipedia rosters can retain loaned-out players.
// These exclusions are backed by current-season transfer announcements.
const LOANED_OUT={
 'belgian-pro-league:12':new Set(['Q115902876']), // Boukamir → RAAL
 'belgian-pro-league:13':new Set(['Q59728235']),  // Krastev → PEC Zwolle
 'netherlands-eredivisie:5':new Set(['Q134470771']) // Plug → Excelsior
};
const CURRENT_SECTIONS=new Set(['current squad','first-team squad','first team squad','squad','senior squad','first team','first-team','selectie','kern','effectif','kader','kadro','plantel','plantilla','rosa','squadra','giocatori in rosa','roster','ρόστερ','ροστερ','ομάδα','elenco atual','effectif actuel','plantilla actual','huidige selectie','aktueller kader','güncel kadro']);
let database={clubs:{}};
let conflictedQids=new Set();
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
 const auditAt=Date.parse(database.rosterAuditAt||'');
 if(!Number.isFinite(auditAt)||Date.now()-auditAt>MAX_ROSTER_AGE_MS)return [];
 const list=club?.players;
 if(!Array.isArray(list))return [];
 const seen=new Set();
 const valid=list.filter(p=>{
  const verifiedAt=Date.parse(p?.verifiedAt||'');
  if(!p||p.clubId!==clubId||p.clubWikidataQid!==club.clubWikidataQid||
     !ALLOWED_VERIFICATION.has(p.rosterVerification)||
     !Number.isFinite(verifiedAt)||Date.now()-verifiedAt>MAX_ROSTER_AGE_MS||
     !p.secondaryRosterSource?.startsWith('https://')||
     p.verifiedCurrent!==true||p.faceCrop!==true||
     !p.photoUrl?.startsWith('./assets/player-headshots/')||
     !p.sourceUrl?.startsWith('https://commons.wikimedia.org/')||
     !p.membershipSource?.startsWith('https://')||
     !CURRENT_SECTIONS.has(p.membershipSection)||
     !p.license||!p.author||!p.playerName||!p.wikidataQid||
     LOANED_OUT[clubId]?.has(p.wikidataQid)||
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
  database=j;
  // Never show the same player as belonging to two different clubs,
  // even when a source has outdated loan/parent-club rosters.
  const byPlayer=new Map();
  conflictedQids=new Set();
  for(const [clubId,club] of Object.entries(database.clubs)){
   for(const player of club.players||[]){
    if(!player.wikidataQid)continue;
    const previous=byPlayer.get(player.wikidataQid);
    if(previous&&previous!==clubId)conflictedQids.add(player.wikidataQid);
    else byPlayer.set(player.wikidataQid,clubId);
   }
  }
  shuffledCache.clear();
  window.dispatchEvent(new Event('bk-player-photos-ready'));
 }).catch(e=>console.info('Current-squad headshots unavailable:',e.message));
})();
