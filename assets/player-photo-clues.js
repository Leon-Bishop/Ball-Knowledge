/* Ball Knowledge: current-squad, face-only, licensed player clues.
 * Only verified, face-detected crops in the curated database are eligible.
 * Never fall back to the old historical player-photo-db.json collection.
 */
(function(){
'use strict';
// One independently corroborated, quality-approved face is useful; do not
// block it just because a club has fewer than three licensed portraits.
const MINIMUM=1;
const MAX_ROSTER_AGE_MS=21*24*60*60*1000;
const ALLOWED_VERIFICATION=new Set([
 'official_club_squad','confirmed_current_loan','wikidata_current_club'
]);
// Parent-club Wikipedia rosters can retain loaned-out players.
// These exclusions are backed by current-season transfer announcements.
const LOANED_OUT={
 'netherlands-eredivisie:5':new Set(['Q134470771']) // Plug → Excelsior
};
// Rejected after inspecting the final JPEGs: missing heads, a club sign and torso-only crops.
// Keep these exclusions until the importer publishes replacement verified portraits.
const UNUSABLE_CROPS={
 'turkey-super-lig:10':new Set(['Q98829644','Q56043335']),
 'turkey-super-lig:12':new Set(['Q40991902']),
 'turkey-super-lig:13':new Set(['Q26704485'])
};
const CURRENT_SECTIONS=new Set(['wikidata current club','current squad','first-team squad','first team squad','squad','senior squad','first team','first-team','selectie','kern','effectif','kader','kadro','plantel','plantilla','rosa','squadra','giocatori in rosa','roster','ρόστερ','ροστερ','ομάδα','elenco atual','effectif actuel','plantilla actual','huidige selectie','aktueller kader','güncel kadro']);
let database={clubs:{}};
let officialEvidence=null;
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
 const official=officialEvidence?.officialClubs?.[clubId];
 const valid=list.filter(p=>{
  const verifiedAt=Date.parse(p?.verifiedAt||'');
  // Prevent a portrait saved under another quiz club or player being shown.
  const expectedPhoto='./assets/player-headshots/'+clubId.replace(/:/g,'-')+'--'+p?.wikidataQid+'.jpg';
  if(!p||p.clubId!==clubId||p.clubWikidataQid!==club.clubWikidataQid||
     !ALLOWED_VERIFICATION.has(p.rosterVerification)||
     (official&&!official.players?.[p.wikidataQid])||
     !Number.isFinite(verifiedAt)||Date.now()-verifiedAt>MAX_ROSTER_AGE_MS||
     !p.secondaryRosterSource?.startsWith('https://')||
     p.verifiedCurrent!==true||p.faceCrop!==true||
     p.faceQualityVerified!==true||
     p.photoUrl!==expectedPhoto||
     !p.sourceUrl?.startsWith('https://commons.wikimedia.org/')||
     !p.membershipSource?.startsWith('https://')||
     !CURRENT_SECTIONS.has(p.membershipSection)||
     (p.membershipSection==='wikidata current club'&&(
       p.rosterVerification!=='wikidata_current_club'||
       p.membershipSource!=='https://www.wikidata.org/wiki/'+p.wikidataQid))||
     !p.license||!p.author||!p.playerName||!p.wikidataQid||
     LOANED_OUT[clubId]?.has(p.wikidataQid)||
     UNUSABLE_CROPS[clubId]?.has(p.wikidataQid)||
     conflictedQids.has(p.wikidataQid)||
     seen.has(p.wikidataQid))return false;
  seen.add(p.wikidataQid);
  return true;
 });
 // Every item has passed roster, identity, filename and facial-feature QA.
 // A small pool is fine: missing portrait slots stay as their original emojis.
 return valid.slice(0,4);
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
 const pos=(Number(clueIndex)||0)+(Number(alternative)||0);
 if(pos<0||pos>=pool.length)return null;
 // Never repeat the same headshot merely to fill another emoji slot.
 return pool[pos];
}
window.BKPlayerPhotos={getPlayer,availablePlayers,ready:null};
window.BKPlayerPhotos.ready=Promise.all([
 fetch('./assets/player-headshot-db.json',{cache:'no-cache'})
  .then(r=>{if(!r.ok)throw Error('Curated headshot catalog missing');return r.json()}),
 fetch('./photo-db/official-roster-evidence.json',{cache:'no-cache'})
  .then(r=>r.ok?r.json():null).catch(()=>null),
 fetch('./assets/player-headshot-manual-review.json',{cache:'no-cache'})
  .then(r=>r.ok?r.json():null).catch(()=>null)
]).then(([j,evidence,manualReview])=>{
  if(j.version!==2||!j.clubs||typeof j.clubs!=='object')throw Error('Unexpected headshot catalog');
  database=j;
  const evidenceAt=Date.parse(evidence?.checkedAt||'');
  if(Number.isFinite(evidenceAt)&&Date.now()-evidenceAt<=MAX_ROSTER_AGE_MS&&
     evidenceAt<=Date.now()+86_400_000){
   officialEvidence=evidence;
   // Official 2026/27 first-team lists can corroborate players whose
   // cached Wikidata histories are incomplete or stale. Names are keyed by QID.
   for(const [clubId,official] of Object.entries(evidence.officialClubs||{})){
    const club=database.clubs?.[clubId];
    for(const player of club?.players||[]){
     if(official.players?.[player.wikidataQid]){
      player.playerName=official.players[player.wikidataQid];
      player.rosterVerification='official_club_squad';
      player.verifiedCurrent=true;
      player.verifiedAt=evidence.checkedAt;
      player.secondaryRosterSource=official.source;
     }
    }
   }
  }
  // Restore narrowly curated Commons headshots that were wrongly dropped
  // from the auto-generated roster database. Every recovered item has its
  // own rights/author record, visually reviewed full face and a verified
  // exact-player current first-team membership from the club itself.
  const reviewedAt=Date.parse(manualReview?.reviewedAt||'');
  if(officialEvidence&&manualReview?.version===1&&
     manualReview.manuallyReviewed===true&&
     Number.isFinite(reviewedAt)&&Date.now()-reviewedAt<=MAX_ROSTER_AGE_MS&&
     reviewedAt<=Date.now()+86_400_000){
   for(const [clubId,saved] of Object.entries(manualReview.clubs||{})){
    const club=database.clubs?.[clubId];
    const official=officialEvidence.officialClubs?.[clubId];
    if(!club||!official||!Array.isArray(club.players)||
       club.clubWikidataQid!==saved?.clubWikidataQid)continue;
    for(const player of saved.players||[]){
     if(!player.manualFaceReviewed||player.clubId!==clubId||
        player.clubWikidataQid!==club.clubWikidataQid||
        !official.players?.[player.wikidataQid])continue;
     const photo='./assets/player-headshots/'+clubId.replace(/:/g,'-')+
       '--'+player.wikidataQid+'.jpg';
     if(player.photoUrl!==photo)continue;
     const existingIndex=club.players.findIndex(p=>p.wikidataQid===player.wikidataQid);
     const existing=club.players[existingIndex];
     // Prefer a new usable verified import. Restore the previously reviewed
     // headshot only when the generated record is missing or was rejected.
     if(existing?.verifiedCurrent===true&&existing.faceQualityVerified===true&&
        existing.faceCrop===true)continue;
     if(existingIndex>=0)club.players.splice(existingIndex,1);
     club.players.push({...player,playerName:official.players[player.wikidataQid],
      rosterVerification:'official_club_squad',verifiedCurrent:true,
      verifiedAt:manualReview.reviewedAt,secondaryRosterSource:official.source});
    }
   }
  }
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
