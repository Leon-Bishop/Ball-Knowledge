import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const context={};
vm.runInNewContext(read('assets/guess-matcher.js'),context,{filename:'guess-matcher.js'});
const matcher=context.BallKnowledgeGuessMatcher;
const clubs=JSON.parse(read('teams.enriched.json'));
const leagues=new Set(clubs.map(club=>club.league_id));
assert.equal(leagues.size,12);
assert.equal(clubs.length,214);

const match=(input,pool=clubs)=>matcher.resolve(input,pool);
const team=name=>clubs.find(club=>club.name===name);
const expect=(input,name,pool=clubs)=>{
 const result=match(input,pool);
 assert.equal(result.club?.id,team(name)?.id,'Expected "'+input+'" to mean '+name+', got '+(result.club?.name||'none'));
};
const ambiguous=(input,pool=clubs)=>{
 const result=match(input,pool);
 assert.equal(result.club,null,'Ambiguous "'+input+'" must not cost an attempt');
 assert.equal(result.ambiguous,true,'Ambiguous "'+input+'" must prompt for a specific name');
};

// Every canonical name remains playable, including diacritics and punctuation.
for(const club of clubs)expect(club.name,club.name);
for(const [input,name] of [
 ['gaziantep','Gaziantep FK'],['gaziantepp','Gaziantep FK'],
 ['rize','Çaykur Rizespor'],['rizespor','Çaykur Rizespor'],
 ['caykur rize','Çaykur Rizespor'],['caykur rizespor','Çaykur Rizespor'],
 ['konya','Konyaspor'],['alanya','Alanyaspor'],['trabzon','Trabzonspor'],
 ['Besiktas','Beşiktaş'],['Goztepe','Göztepe'],['fenerbache','Fenerbahçe'],
 ['fenrbahce','Fenerbahçe'],['galatasary','Galatasaray'],
 ['man city','Manchester City'],['man utd','Manchester United'],
 ['newcastle united','Newcastle'],['spurs','Tottenham'],
 ['nottingham forest','Nottm Forest'],['chelse','Chelsea'],
 ['liverpol','Liverpool'],['barca','FC Barcelona'],
 ['Atleti','Atlético Madrid'],['Sao Paulo','São Paulo'],
 ['Vitoria','Vitória'],['Guimaraes','Vitória Guimarães'],
 ['inter milan','Internazionale'],['Milan','AC Milan'],
 ['juve','Juventus'],['bayern','Bayern Munich'],
 ['gladbach','Borussia Monchengladbach'],['koln','FC Cologne'],
 ['psg','Paris Saint-Germain'],['sporting lisbon','Sporting CP'],
 ['porto','FC Porto'],['bragantino','Red Bull Bragantino'],
 ['leverkusen','Bayer Leverkusen'],['hearts','Heart of Midlothian'],
 ['olympiakos','Olympiacos']
])expect(input,name);

// Ambiguous short names/abbreviations across leagues are never counted wrong.
for(const input of ['manchester','madrid','paris','brugge','rotterdam','inter','INT','LEV','ALA','SCP'])ambiguous(input);
const turkish=clubs.filter(c=>c.league_id==='turkey-super-lig');
const italian=clubs.filter(c=>c.league_id==='italy-serie-a');
const brazilian=clubs.filter(c=>c.league_id==='brazil-serie-a');
expect('rize','Çaykur Rizespor',turkish);
expect('gaziantep','Gaziantep FK',turkish);
expect('inter','Internazionale',italian);
expect('inter','Internacional',brazilian);
assert.equal(match('rize',italian).club,null,'Unselected leagues must not be accepted');
assert.equal(match('xyzabcde').club,null,'Unrelated input must not be accepted');
assert.equal(match('man').club,null,'Too-short prefixes must not guess a club');
assert.equal(match('').club,null,'Empty input must not guess a club');
console.log('✓ All 214 club names, 12 leagues, short names, Turkish accents, typos, ambiguity, and league restrictions.');
