import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=read('assets/app.js'),teams=JSON.parse(read('teams.enriched.json')),i18n=JSON.parse(read('i18n.json'));
new vm.Script(js,{filename:'app.js'});
const colours=new Set(['🔴','🔵','🟡','🟢','⚫','⚪','🟣','🟠','🟤']);
const start=js.indexOf('function promoteEarlyColour('),end=js.indexOf('function newRound(){',start);
assert(start>0&&end>start,'Expected colour promotion helper');
const promote=new Function('KIT_COLOUR_EMOJIS',js.slice(start,end)+'\nreturn promoteEarlyColour')(colours);
let nonTurkish=0;
for(const team of teams){
 assert.equal(team.emojis.length,5,team.name+' must have five clues');
 if(team.league_id==='turkey-super-lig'){
  const order=[0,1,2,3,4];
  assert.deepEqual(promote(order,team.emojis,team.league_id,()=>0),order,'Turkish league must retain its normal order');
  continue;
 }
 nonTurkish++;
 assert(team.emojis.some(e=>colours.has(e)),team.name+' has no colour clue');
 // Test every one of 120 possible starting orders for each club.
 const walk=(prefix,remaining)=>{
  if(!remaining.length){
   for(const choice of [0,0.9]){
    const result=promote(prefix,team.emojis,team.league_id,()=>choice);
    assert.equal(new Set(result).size,5,team.name+' must preserve all five clue slots');
    assert(result.slice(0,2).some(idx=>colours.has(team.emojis[idx])),team.name+' colour must appear in first two');
   }
   return;
  }
  for(const idx of remaining)walk([...prefix,idx],remaining.filter(x=>x!==idx));
 };
 walk([],[0,1,2,3,4]);
}
assert.equal(nonTurkish,196);
for(const [locale,dict] of Object.entries(i18n)){
 assert(!/unlocked|desbloquead|débloqué|sbloccata|açıldı|desbloqueado|emoji açıldı/i.test(dict.newClue),locale+': outdated unlocked notice');
 assert(dict.newClue.includes('🧩'),locale+': missing non-match explanation');
}
console.log('✓ 196 non-Turkish teams show a colour in clue 1 or 2 for all permutations; 6 languages remove unlocked text.');
