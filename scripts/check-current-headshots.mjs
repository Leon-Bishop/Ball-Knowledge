import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/player-photo-clues.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../assets/styles.css',import.meta.url),'utf8');
const credits=fs.readFileSync(new URL('../player-photo-credits.html',import.meta.url),'utf8');
const db=JSON.parse(fs.readFileSync(new URL('../assets/player-headshot-db.json',import.meta.url),'utf8'));
assert.equal(db.version,2);
const official=JSON.parse(fs.readFileSync(new URL('../photo-db/official-roster-evidence.json',import.meta.url),'utf8'));
const clubMap=JSON.parse(fs.readFileSync(new URL('../photo-db/club-wikidata-map.json',import.meta.url),'utf8')).clubs;
const qidOwners=new Map();
for(const [clubId,club] of Object.entries(db.clubs)){
 assert.equal(club.clubWikidataQid,clubMap[clubId],'Club must match canonical game-to-Wikidata mapping');
 for(const p of club.players||[]){
  assert.equal(p.clubWikidataQid,clubMap[clubId],'Player must match canonical club ID');
  const prior=qidOwners.get(p.wikidataQid);
  assert(!prior||prior===clubId,'A player cannot be assigned to two quiz clubs: '+p.playerName);
  qidOwners.set(p.wikidataQid,clubId);
  const loan=official.loanAssignments[p.wikidataQid];
  if(loan)assert.equal(clubId,loan.clubId,'Loaned player shown for parent club: '+p.playerName);
  if(official.officialClubs[clubId]){
   assert(official.officialClubs[clubId].players[p.wikidataQid],
     'Official club roster does not contain '+p.playerName+' at '+clubId);
  }
 }
}
assert(!source.includes('fetch(\'./assets/player-photo-db.json\''),'Historical photos must never appear in quiz');
assert(source.includes('verifiedCurrent!==true')&&source.includes('faceCrop!==true'));
assert(source.includes('ALLOWED_VERIFICATION')&&source.includes('rosterAuditAt'));
assert(css.includes('.slot .player-photo-clue')&&css.includes('object-fit:cover'));
assert(credits.includes('player-headshot-db.json'));
assert(app.includes('Current squad player:'));
for(const [id,club] of Object.entries(db.clubs)){
 const seen=new Set();
 for(const p of club.players||[]){
  assert.equal(p.clubId,id);
  assert(typeof p.verifiedCurrent==='boolean','Membership audit must decide every player');
  assert.equal(p.faceCrop,true);
  assert(p.photoUrl.startsWith('./assets/player-headshots/'));
  assert.equal(p.modified,true,'Cropping must be disclosed');
  const localImage=new URL('../'+p.photoUrl.slice(2),import.meta.url);
  assert(fs.existsSync(localImage),'Curated headshot file missing: '+p.photoUrl);
  assert(fs.statSync(localImage).size>1500,'Curated headshot image unexpectedly small');
  assert(p.sourceUrl.startsWith('https://commons.wikimedia.org/'));
  assert(/^https:\/\/[a-z]+\.wikipedia\.org\/wiki\//.test(p.membershipSource));
  assert(p.license&&p.author&&p.wikidataQid&&!seen.has(p.wikidataQid));
  seen.add(p.wikidataQid);
 }
}
const player=(n,current=true)=>({
 clubId:'team:1',clubWikidataQid:'Q999',wikidataQid:'Q'+n,playerName:'Player '+n,
 rosterVerification:'wikidata_current_club',verifiedAt:new Date().toISOString(),
 secondaryRosterSource:'https://www.wikidata.org/wiki/Q'+n,
 verifiedCurrent:current,faceCrop:true,
 photoUrl:'./assets/player-headshots/team-1--Q'+n+'.jpg',
 sourceUrl:'https://commons.wikimedia.org/wiki/File:Portrait.jpg',
 membershipSource:'https://en.wikipedia.org/wiki/Team',membershipSection:'current squad',
 author:'Photographer',license:'CC BY-SA 4.0'
});
const mock={version:2,rosterAuditAt:new Date().toISOString(),clubs:{
 'team:1':{clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[player(1),player(2),player(3),player(4,false)]},
 'team:2':{clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[{...player(10),clubId:'team:2'}, {...player(11),clubId:'team:2'}]},
 'team:3':{clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[12,13,14,15].map(i=>({...player(i),clubId:'team:3',membershipSection:'players'}))},
 'team:4':{clubWikidataQid:'Q999',checkedAt:'2020-01-01T00:00:00Z',players:[20,21,22,23].map(i=>({...player(i),clubId:'team:4'}))},
 'team:5':{clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[{...player(99),clubId:'team:5'},{...player(100),clubId:'team:5'},{...player(101),clubId:'team:5'}]},
 'team:6':{clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[{...player(99),clubId:'team:6'},{...player(102),clubId:'team:6'},{...player(103),clubId:'team:6'}]},
 'belgian-pro-league:12':{clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[30,31,32].map(i=>({...player(i),clubId:'belgian-pro-league:12'})).concat([{...player(33),clubId:'belgian-pro-league:12',wikidataQid:'Q115902876'}])}
}};
const window={dispatchEvent(){}};
vm.runInNewContext(source,{window,fetch:async()=>({ok:true,json:async()=>mock}),Event:class Event{},console});
await window.BKPlayerPhotos.ready;
assert.equal(window.BKPlayerPhotos.availablePlayers('team:1').length,3);
assert.equal(window.BKPlayerPhotos.availablePlayers('team:2').length,0);
assert.equal(window.BKPlayerPhotos.availablePlayers('team:3').length,0);
assert.equal(window.BKPlayerPhotos.availablePlayers('team:4').length,0);
assert.equal(window.BKPlayerPhotos.availablePlayers('team:5').length,0,'Cross-club duplicate invalidates incomplete club set');
assert.equal(window.BKPlayerPhotos.availablePlayers('team:6').length,0,'A duplicate must be rejected in both clubs');
assert.equal(window.BKPlayerPhotos.availablePlayers('belgian-pro-league:12').length,3);
assert.equal(window.BKPlayerPhotos.getPlayer('team:2','seed',0),null);
const ids=[0,1,2].map(i=>window.BKPlayerPhotos.getPlayer('team:1','seed',i).wikidataQid);
assert.equal(new Set(ids).size,3,'Different clues must show different players');
console.log('✓ Current squad only, three-headshot minimum, license metadata, tight crops and historical exclusion');
