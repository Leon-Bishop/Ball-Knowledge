import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/player-photo-clues.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../assets/styles.css',import.meta.url),'utf8');
const credits=fs.readFileSync(new URL('../player-photo-credits.html',import.meta.url),'utf8');
const db=JSON.parse(fs.readFileSync(new URL('../assets/player-headshot-db.json',import.meta.url),'utf8'));
assert.equal(db.version,2);
assert(!source.includes('fetch(\'./assets/player-photo-db.json\''),'Historical photos must never appear in quiz');
assert(source.includes('verifiedCurrent!==true')&&source.includes('faceCrop!==true'));
assert(css.includes('.slot .player-photo-clue')&&css.includes('object-fit:cover'));
assert(credits.includes('player-headshot-db.json'));
assert(app.includes('Current squad player:'));
for(const [id,club] of Object.entries(db.clubs)){
 const seen=new Set();
 for(const p of club.players||[]){
  assert.equal(p.clubId,id);
  assert.equal(p.verifiedCurrent,true);
  assert.equal(p.faceCrop,true);
  assert(p.photoUrl.startsWith('./assets/player-headshots/'));
  assert(p.sourceUrl.startsWith('https://commons.wikimedia.org/'));
  assert(p.membershipSource.startsWith('https://en.wikipedia.org/wiki/'));
  assert(p.membershipSection!=='players','Generic player list is not proof of current squad');
  assert(p.license&&p.author&&p.wikidataQid&&!seen.has(p.wikidataQid));
  seen.add(p.wikidataQid);
 }
}
const player=(n,current=true)=>({
 clubId:'team:1',wikidataQid:'Q'+n,playerName:'Player '+n,
 verifiedCurrent:current,faceCrop:true,
 photoUrl:'./assets/player-headshots/team-1--Q'+n+'.jpg',
 sourceUrl:'https://commons.wikimedia.org/wiki/File:Portrait.jpg',
 membershipSource:'https://en.wikipedia.org/wiki/Team',membershipSection:'current squad',
 author:'Photographer',license:'CC BY-SA 4.0'
});
const mock={version:2,clubs:{
 'team:1':{players:[player(1),player(2),player(3),player(4,false)]},
 'team:2':{players:[{...player(1),clubId:'team:2'}, {...player(2),clubId:'team:2'}]}
}};
const window={dispatchEvent(){}};
vm.runInNewContext(source,{window,fetch:async()=>({ok:true,json:async()=>mock}),Event:class Event{},console});
await window.BKPlayerPhotos.ready;
assert.equal(window.BKPlayerPhotos.availablePlayers('team:1').length,3);
assert.equal(window.BKPlayerPhotos.availablePlayers('team:2').length,0);
assert.equal(window.BKPlayerPhotos.getPlayer('team:2','seed',0),null);
const ids=[0,1,2].map(i=>window.BKPlayerPhotos.getPlayer('team:1','seed',i).wikidataQid);
assert.equal(new Set(ids).size,3,'Different clues must show different players');
console.log('✓ Current squad only, three-headshot minimum, license metadata, tight crops and historical exclusion');
