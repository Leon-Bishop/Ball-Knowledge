#!/usr/bin/env node
// Historic Wikimedia face crops, directly inspected and verified,
// are permitted ONLY when current primary-source club membership is proven.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const load=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const manual=load('assets/player-headshot-manual-review.json');
const db=load('assets/player-headshot-db.json');
const official=load('photo-db/official-roster-evidence.json');
assert.equal(manual.version,1);
assert.equal(manual.manuallyReviewed,true);
assert(Number.isFinite(Date.parse(manual.reviewedAt)));
const selected={
 'turkey-super-lig:10':['Q68593365','Q108513776'],
 'turkey-super-lig:13':['Q21004899','Q60182084'],
 'england-premier-league:8':['Q18614641','Q83632882','Q110565461'],
 'france-ligue-1:3':['Q105473333','Q56612830','Q713627'],
 'portugal-liga-portugal:12':['Q56233291']
};
const legal=/^(CC0|Public domain|CC BY [234]\.0|CC BY-SA [234]\.0)$/;
const qids=new Set();
for(const [clubId,ids] of Object.entries(selected)){
 const club=manual.clubs[clubId],roster=official.officialClubs[clubId];
 assert(club&&roster?.source?.startsWith('https://'),'Missing current official club proof: '+clubId);
 assert.equal(club.clubWikidataQid,db.clubs[clubId].clubWikidataQid);
 assert.deepEqual(club.players.map(p=>p.wikidataQid),ids);
 for(const p of club.players){
  assert.equal(roster.players[p.wikidataQid],p.playerName);
  assert(p.manualFaceReviewed&&p.faceQualityVerified&&p.faceCrop,'Full face must be reviewed');
  assert.equal(p.rosterVerification,'official_club_squad');
  assert.equal(p.clubId,clubId);
  assert.equal(p.clubWikidataQid,club.clubWikidataQid);
  assert.equal(p.secondaryRosterSource,roster.source);
  assert(!qids.has(p.wikidataQid),'Never assign one player to two quiz teams');
  qids.add(p.wikidataQid);
  assert(legal.test(p.license),'Only licensed, commercially reusable source photos');
  assert(p.author&&p.sourceUrl?.startsWith('https://commons.wikimedia.org/wiki/File:'));
  const expected='./assets/player-headshots/'+clubId.replace(/:/g,'-')+'--'+p.wikidataQid+'.jpg';
  assert.equal(p.photoUrl,expected);
  const img=fs.readFileSync(new URL('../'+expected.slice(2),import.meta.url));
  assert(img.length>1500&&img[0]===0xff&&img[1]===0xd8,'Valid existing JPEG missing');
 }
}
const source=fs.readFileSync(new URL('../assets/player-photo-clues.js',import.meta.url),'utf8');
const window={dispatchEvent(){}};
vm.runInNewContext(source,{window,fetch:async(url)=>({ok:true,json:async()=>{
 if(url.includes('official-roster-evidence'))return official;
 if(url.includes('player-headshot-manual-review'))return manual;
 return db;
}}),Event:class Event{},console});
await window.BKPlayerPhotos.ready;
for(const [clubId,ids] of Object.entries(selected)){
 const eligible=new Set(window.BKPlayerPhotos.availablePlayers(clubId).map(p=>p.wikidataQid));
 for(const qid of ids)assert(eligible.has(qid),'Manually reviewed, officially confirmed photo is hidden: '+clubId+' '+qid);
}
console.log('✓ '+qids.size+' reviewed, attributed portraits display only for their independently verified current clubs');
