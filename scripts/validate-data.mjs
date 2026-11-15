import fs from 'node:fs';
import assert from 'node:assert/strict';
const load = file => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const leagues=load('leagues.json'), teams=load('teams.enriched.json'), stories=load('tum-kulupler-ilginc-hikayeler-guncel.json');
assert(Array.isArray(leagues) && leagues.length>0,'Lig dizisi eksik');
assert(Array.isArray(teams) && teams.length>0,'Takım dizisi eksik');
assert(Array.isArray(stories),'Bilgi dizisi eksik');
const leagueIds=new Set(leagues.map(l=>l.id));
assert.equal(leagueIds.size,leagues.length,'Tekrarlanan lig ID');
const teamsById=new Map();
for (const team of teams){
 assert.equal(typeof team.id,'string',`Takım ID eksik: ${team.name}`);
 assert(!teamsById.has(team.id),`Tekrarlanan takım ID: ${team.id}`);
 assert(leagueIds.has(team.league_id),`Bilinmeyen lig: ${team.name}`);
 assert(Array.isArray(team.emojis)&&team.emojis.length===5,`5 emoji şartı: ${team.name}`);
 assert(team.emojis.every(e=>typeof e==='string'&&e.length>0),`Boş emoji: ${team.name}`);
 assert.equal(new Set(team.emojis).size,5,`Repeated emoji within ${team.name} (${team.id})`);
 teamsById.set(team.id,team);
}
const storiesById=new Map();
for (const story of stories){
 assert(story.id && typeof story.id==='string','Bilgi dosyasında ID eksik');
 assert(!storiesById.has(story.id),`Tekrarlanan bilgi ID: ${story.id}`);
 assert(teamsById.has(story.id),`Bilgisi olan ancak takım listesinde bulunmayan ID: ${story.id}`);
 assert(Array.isArray(story.facts),'facts dizisi eksik: '+story.id);
 const validFacts=story.facts.filter(f=>typeof f?.text==='string'&&f.text.trim());
 assert(validFacts.length>0,`Oyunda gösterilecek bilgi yok: ${story.id}`);
 storiesById.set(story.id,validFacts);
}
for(const id of teamsById.keys())assert(storiesById.has(id),`Takıma ait hikâye kaydı bulunamadı: ${id}`);
const ordered = JSON.stringify(teams.map(t=>t.emojis));
const collision=new Map();
for (const t of teams){
 const key=JSON.stringify(t.emojis);
 if(collision.has(key))console.warn(`Uyarı: aynı emoji dizisi: ${collision.get(key)} / ${t.id}`);
 else collision.set(key,t.id);
}
console.log(`✓ ${leagues.length} lig · ${teams.length} takım · ${stories.length} bilgi kaydı · ${[...storiesById.values()].reduce((s,x)=>s+x.length,0)} gösterilebilir bilgi`);
console.log('✓ Her takımın kimliği eşleşiyor ve en az bir hikâyesi var.');
