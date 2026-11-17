import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = path => JSON.parse(fs.readFileSync(new URL('../'+path, import.meta.url), 'utf8'));
const removed = new Set(['belgian-pro-league','brazil-serie-a','scotland-premiership','greece-super-league']);
const allowed = id => !removed.has(String(id || '').split(':')[0]);
const leagues = read('leagues.json'), teams = read('teams.enriched.json');
const facts = read('tum-kulupler-ilginc-hikayeler-guncel.json');
const logos = read('logo-sources.json'), avatars = read('assets/club-avatar-catalog.json');
const db = read('assets/player-headshot-db.json');
const manual = read('assets/player-headshot-manual-review.json');
const evidence = read('photo-db/official-roster-evidence.json');
const mapping = read('photo-db/club-wikidata-map.json');
const trophy = read('assets/trophy-photo-coverage.json');
const app = fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
const standings = fs.readFileSync(new URL('../scripts/update-standings.mjs',import.meta.url),'utf8');
assert.equal(leagues.length,8);
assert.equal(teams.length,150);
assert.equal(facts.length,150);
assert.equal(avatars.clubs.length,150);
assert.equal(Object.keys(db.clubs).length,150);
assert.equal(trophy.trophyClubs,69);
assert.equal(trophy.covered,69);
assert.equal(trophy.missingCount,0);
for(const v of [...leagues,...teams,...facts,...avatars.leagues,...avatars.clubs]){
 assert(allowed(v.id),'Retired team or league still selectable: '+v.id);
 assert(allowed(v.league_id||v.leagueId),'Retired club still indexed');
}
for(const data of [logos,db.clubs,manual.clubs,evidence.officialClubs,mapping.clubs]){
 for(const key of Object.keys(data))assert(allowed(key),'Retired league metadata remains: '+key);
}
for(const id of removed){
 assert(!app.includes(id),'Retired league tile still in game: '+id);
 assert(!standings.includes(id),'Retired standings mapping still in game: '+id);
}
const folder=new URL('../assets/player-headshots/',import.meta.url);
const images=fs.readdirSync(folder);
for(const name of images)for(const id of removed)
 assert(!name.startsWith(id+'-'),'Retired league JPEG remains: '+name);
assert(!fs.existsSync(new URL('../assets/player-photo-db.json',import.meta.url)),
 'Old historical photo database must not be reintroduced');
assert(!fs.existsSync(new URL('../.github/workflows/player-photo-db.yml',import.meta.url)),
 'Retired legacy photo workflow must not regenerate deleted data');
console.log('✓ 8 leagues and 150 clubs; retired leagues, metadata, images and historical importer removed');
