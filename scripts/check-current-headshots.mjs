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
assert(source.includes('p.faceQualityVerified!==true'), 'Player photos require final facial-feature QA');
assert(css.includes('.slot .player-photo-clue')&&css.includes('object-fit:contain')&&!css.includes('transform:scale(1.35)'));
assert(app.includes('if(photo&&!finished)'),'Do not reveal identity during the round');
assert(app.includes("const PLAYER_PHOTO_PRIORITY=['🏆','⚽','🥇']"),'Use trophy-before-medal photo ordering');
assert(app.includes('prioritySlots.indexOf(index)'),'Photo clues must respect priority ordering');
assert(!app.includes('item.title=(lang===\'tr\'?\'Futbolcu fotoğrafını'),'No photograph source tooltips');
assert(credits.includes('player-headshot-db.json'));
assert(source.includes('UNUSABLE_CROPS')&&source.includes('Q56043335')&&source.includes('Q40991902')&&source.includes('Q26704485'),
 'Reject off-center, logo-only and torso-only photo clues');
assert(app.includes('Current squad player:'));
for(const [id,club] of Object.entries(db.clubs)){
 const seen=new Set();
 for(const p of club.players||[]){
  assert.equal(p.clubId,id);
  assert([true,false,undefined].includes(p.verifiedCurrent),'Never implicitly approve unaudited player membership');
  assert.equal(typeof p.faceCrop,'boolean','Every image has an explicit quality decision');
  assert.equal(p.photoUrl,'./assets/player-headshots/'+id.replace(/:/g,'-')+'--'+p.wikidataQid+'.jpg',
    'The player photo must match the exact quiz club and player');
  assert.equal(p.modified,true,'Cropping must be disclosed');
  const localImage=new URL('../'+p.photoUrl.slice(2),import.meta.url);
  assert(fs.existsSync(localImage),'Curated headshot file missing: '+p.photoUrl);
  assert(fs.statSync(localImage).size>1500,'Curated headshot image unexpectedly small');
  assert(p.sourceUrl.startsWith('https://commons.wikimedia.org/'));
  assert(/^https:\/\/[a-z]+\.wikipedia\.org\/wiki\//.test(p.membershipSource)||
   (p.membershipSection==='wikidata current club'&&
    p.membershipSource==='https://www.wikidata.org/wiki/'+p.wikidataQid),
   'Player roster source must be explicit Wikipedia current squad or active Wikidata P54');
  assert(p.license&&p.author&&p.wikidataQid&&!seen.has(p.wikidataQid));
  seen.add(p.wikidataQid);
 }
}
const player=(n,current=true)=>({
 clubId:'team:1',clubWikidataQid:'Q999',wikidataQid:'Q'+n,playerName:'Player '+n,
 rosterVerification:'wikidata_current_club',verifiedAt:new Date().toISOString(),
 secondaryRosterSource:'https://www.wikidata.org/wiki/Q'+n,
 verifiedCurrent:current,faceCrop:true,faceQualityVerified:true,
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
 'belgian-pro-league:12':{clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[30,31,32].map(i=>({...player(i),clubId:'belgian-pro-league:12',photoUrl:'./assets/player-headshots/belgian-pro-league-12--Q'+i+'.jpg'})).concat([{...player(33),clubId:'belgian-pro-league:12',wikidataQid:'Q115902876'}])}
}};
mock.clubs['team:8']={clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[80,81,82].map(n=>({
 ...player(n,false),clubId:'team:8',photoUrl:'./assets/player-headshots/team-8--Q'+n+'.jpg',
 rosterVerification:'wikipedia_squad_no_p54'
}))};
const officialMock={checkedAt:new Date().toISOString(),officialClubs:{
 'team:8':{source:'https://club.example/first-team',players:{Q80:'Player 80',Q81:'Player 81',Q82:'Player 82'}}
}};
const window={dispatchEvent(){}};
vm.runInNewContext(source,{window,fetch:async(url)=>({ok:true,json:async()=>url.includes('official-roster-evidence')?officialMock:mock}),Event:class Event{},console});
await window.BKPlayerPhotos.ready;
assert.equal(window.BKPlayerPhotos.availablePlayers('team:1').length,3);
mock.clubs['team:1'].players[0].faceQualityVerified=false;
assert.equal(window.BKPlayerPhotos.availablePlayers('team:1').length,2,
 'Only the bad photo is removed; other approved faces still appear');
mock.clubs['team:1'].players[0].faceQualityVerified=true;
const wikipediaOnly=[70,71,72].map(n=>({...player(n),clubId:'team:7',
 photoUrl:'./assets/player-headshots/team-7--Q'+n+'.jpg',rosterVerification:'wikipedia_squad_no_p54'}));
mock.clubs['team:7']={clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:wikipediaOnly};
assert.equal(window.BKPlayerPhotos.availablePlayers('team:7').length,0,'Wikipedia-only records must not qualify');
assert.equal(window.BKPlayerPhotos.availablePlayers('team:8').length,3,'Current official club squad corroborates stale membership');
assert.equal(window.BKPlayerPhotos.availablePlayers('team:2').length,0);
assert.equal(window.BKPlayerPhotos.availablePlayers('team:3').length,0);
assert.equal(window.BKPlayerPhotos.availablePlayers('team:4').length,0);
assert.equal(window.BKPlayerPhotos.availablePlayers('team:5').length,0,'Cross-club duplicate invalidates incomplete club set');
assert.equal(window.BKPlayerPhotos.availablePlayers('team:6').length,0,'A duplicate must be rejected in both clubs');
assert.equal(window.BKPlayerPhotos.availablePlayers('belgian-pro-league:12').length,3);
assert.equal(window.BKPlayerPhotos.getPlayer('team:2','seed',0),null);
const single={...player(90),clubId:'team:9',photoUrl:'./assets/player-headshots/team-9--Q90.jpg'};
const pair=[91,92].map(n=>({...player(n),clubId:'team:10',photoUrl:'./assets/player-headshots/team-10--Q'+n+'.jpg'}));
mock.clubs['team:9']={clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:[single]};
mock.clubs['team:10']={clubWikidataQid:'Q999',checkedAt:new Date().toISOString(),players:pair};
assert.equal(window.BKPlayerPhotos.availablePlayers('team:9').length,1,'A single approved face appears');
assert.equal(window.BKPlayerPhotos.availablePlayers('team:10').length,2,'Two approved faces appear');
assert.equal(window.BKPlayerPhotos.getPlayer('team:9','seed',0).wikidataQid,'Q90');
assert.equal(window.BKPlayerPhotos.getPlayer('team:9','seed',1),null,'Never duplicate a player headshot');
assert.equal(window.BKPlayerPhotos.getPlayer('team:10','seed',2),null,'Missing photos fall back to emojis');
const ids=[0,1,2].map(i=>window.BKPlayerPhotos.getPlayer('team:1','seed',i).wikidataQid);
assert.equal(new Set(ids).size,3,'Different clues must show different players');
console.log('✓ Approved player faces appear without duplicates; bad crops and uncertain rosters stay excluded');
