#!/usr/bin/env node
// Run the EXACT game eligibility rules against every trophy-clue club.
// Usage: node scripts/check-trophy-photo-coverage.mjs [--write] [--require-complete]
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const load=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const teams=load('teams.enriched.json');
const db=load('assets/player-headshot-db.json');
const official=load('photo-db/official-roster-evidence.json');
const manuallyReviewed=load('assets/player-headshot-manual-review.json');
const script=fs.readFileSync(new URL('../assets/player-photo-clues.js',import.meta.url),'utf8');
const window={dispatchEvent(){}};
vm.runInNewContext(script,{
 window,fetch:async(url)=>({ok:true,json:async()=>
  url.includes('official-roster-evidence')?official:
  url.includes('player-headshot-manual-review')?manuallyReviewed:db}),
 Event:class Event{},console
});
await window.BKPlayerPhotos.ready;
const targets=teams.filter(t=>t.emojis.includes('🏆'));
const missing=[];
const verified=[];
for(const t of targets){
 const eligible=window.BKPlayerPhotos.availablePlayers(t.id);
 if(!eligible.length)missing.push({
  id:t.id,club:t.name,league:t.league_id,
  catalogued:(db.clubs?.[t.id]?.players||[]).length,
  approvedCrops:(db.clubs?.[t.id]?.players||[]).filter(p=>p.faceCrop===true&&p.faceQualityVerified===true).length
 });
 else verified.push({id:t.id,club:t.name,league:t.league_id,players:eligible.map(p=>p.playerName)});
}
const report={
 checkedAt:new Date().toISOString(),catalogUpdatedAt:db.lastUpdated||null,
 totalClubs:teams.length,trophyClubs:targets.length,covered:verified.length,
 missingCount:missing.length,missing,verified
};
assert.equal(report.trophyClubs,69,'Verify the retained eight-league trophy population');
if(process.argv.includes('--write')){
 fs.writeFileSync(new URL('../assets/trophy-photo-coverage.json',import.meta.url),
  JSON.stringify(report,null,2)+'\n');
}
console.log('Current-trophy photo coverage: '+verified.length+'/'+targets.length);
console.log('Missing: '+missing.map(x=>x.club).join(', '));
if(missing.length===0)console.log('✓ All 69 trophy-clue clubs have a real current-player face.');
if(process.argv.includes('--require-complete')&&missing.length)process.exitCode=1;
