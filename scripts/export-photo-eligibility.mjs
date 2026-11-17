#!/usr/bin/env node
// Export the exact runtime-eligible player-photo identities for a hand-edit pack.
// The game is the source of truth: no historical, wrong-club or stale pictures.
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => JSON.parse(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const teams = read('teams.enriched.json');
const db = read('assets/player-headshot-db.json');
const manual = read('assets/player-headshot-manual-review.json');
const official = read('photo-db/official-roster-evidence.json');
const source = fs.readFileSync(new URL('../assets/player-photo-clues.js', import.meta.url), 'utf8');
const window = { dispatchEvent() {} };
vm.runInNewContext(source, {
  window, console, Event: class Event {},
  fetch: async url => ({ok: true, json: async () =>
    url.includes('official-roster-evidence') ? official :
    url.includes('player-headshot-manual-review') ? manual : db
  })
});
await window.BKPlayerPhotos.ready;
const photos = [];
const seen = new Set();
for (const team of teams) {
  for (const player of window.BKPlayerPhotos.availablePlayers(team.id)) {
    const key = team.id + '|' + player.wikidataQid;
    if (seen.has(key)) throw Error('Duplicate player assigned in runtime: ' + key);
    seen.add(key);
    photos.push({
      clubId: team.id,
      playerQid: player.wikidataQid,
      playerName: player.playerName,
      photoUrl: player.photoUrl
    });
  }
}
const trophyIds = teams.filter(t => t.emojis.includes('🏆'));
const coveredTrophies = trophyIds.filter(t => photos.some(p => p.clubId === t.id));
if (trophyIds.length !== 105 || coveredTrophies.length !== 105) {
  throw Error('Photo pack would have incomplete trophy coverage: ' +
    coveredTrophies.length + '/' + trophyIds.length);
}
const out = process.argv[2];
if (!out) throw Error('Usage: node scripts/export-photo-eligibility.mjs output.json');
fs.writeFileSync(out, JSON.stringify({
  generatedAt: new Date().toISOString(),
  trophyClubs: trophyIds.length,
  coveredTrophies: coveredTrophies.length,
  photos
}, null, 2) + '\n');
console.log('Photo edit pack eligibility: ' + photos.length +
  ' distinct current-player images; 105/105 trophy clubs.');
