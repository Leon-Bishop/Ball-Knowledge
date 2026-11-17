#!/usr/bin/env node
// Export exactly the verified portraits the live game can show, including
// independently reviewed overlays, with immutable club/person/source mapping.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const leagues = read('leagues.json');
const teams = read('teams.enriched.json');
const db = read('assets/player-headshot-db.json');
const manual = read('assets/player-headshot-manual-review.json');
const evidence = read('photo-db/official-roster-evidence.json');
const clubMap = read('photo-db/club-wikidata-map.json').clubs;
const source = fs.readFileSync(new URL('../assets/player-photo-clues.js', import.meta.url), 'utf8');
const window = { dispatchEvent() {} };
vm.runInNewContext(source, {
  window, console, Event: class Event {},
  fetch: async url => ({ok: true, json: async () =>
    url.includes('official-roster-evidence') ? evidence :
    url.includes('player-headshot-manual-review') ? manual : db
  })
});
await window.BKPlayerPhotos.ready;

const leagueById = new Map(leagues.map(l => [l.id, l]));
const players = [], owners = new Set(), clubIds = new Set(teams.map(t => t.id));
assert.equal(leagues.length, 8);
assert.equal(teams.length, 150);
for (const team of teams) {
  assert(leagueById.has(team.league_id));
  for (const person of window.BKPlayerPhotos.availablePlayers(team.id)) {
    const original = 'assets/player-headshots/' +
      team.id.replace(/:/g, '-') + '--' + person.wikidataQid + '.jpg';
    assert.equal(person.photoUrl, './' + original);
    assert.equal(person.clubId, team.id);
    assert.equal(person.clubWikidataQid, clubMap[team.id]);
    assert(!owners.has(person.wikidataQid), 'Player belongs to two quiz clubs');
    assert(person.sourceUrl.startsWith('https://commons.wikimedia.org/'));
    assert(person.license && person.author && person.faceCrop && person.faceQualityVerified);
    assert(fs.existsSync(new URL('../' + original, import.meta.url)),
      'Missing portrait bytes: ' + original);
    owners.add(person.wikidataQid);
    players.push({
      leagueId: team.league_id,
      leagueName: leagueById.get(team.league_id).name,
      clubId: team.id,
      clubName: team.name,
      playerQid: person.wikidataQid,
      playerName: person.playerName,
      originalPath: original,
      photoSource: person.sourceUrl,
      author: person.author,
      license: person.license,
      licenseUrl: person.licenseUrl || '',
      rosterSource: person.secondaryRosterSource || person.membershipSource || '',
      verifiedAt: person.verifiedAt || ''
    });
  }
}
const trophy = teams.filter(t => t.emojis.includes('🏆'));
assert.equal(trophy.length, 69);
assert(trophy.every(t => players.some(p => p.clubId === t.id)),
  'A remaining trophy club has no eligible portrait');
assert(players.every(p => clubIds.has(p.clubId)));
const file = process.argv[2];
if(!file)throw Error('Usage: node scripts/export-photo-eligibility.mjs OUTPUT.json');
fs.writeFileSync(file, JSON.stringify({
  generatedAt: new Date().toISOString(), leagueCount: leagues.length,
  teamCount: teams.length, trophyClubs: trophy.length, players
}, null, 2) + '\n');
console.log('✓ Exported ' + players.length +
  ' verified player-to-club portraits across 8 leagues / 150 clubs; 69/69 trophy clues covered');
