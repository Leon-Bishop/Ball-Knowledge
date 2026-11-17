import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
const sources=JSON.parse(fs.readFileSync(new URL('../logo-sources.json',import.meta.url),'utf8'));
const leagues=JSON.parse(fs.readFileSync(new URL('../leagues.json',import.meta.url),'utf8'));
const ids=leagues.map(league=>league.id);
for(const id of ids){
 assert(sources[id]?.asset_url,'Missing official league artwork source: '+id);
 assert(app.includes('"'+id+'": ['),'Missing logo image definition: '+id);
}
assert(app.includes('Pl-logo-light.svg'),'Premier League lion artwork missing');
assert(app.includes('bundesliga-germany-logo-footylogos.svg'),'Bundesliga emblem URL missing');
assert(app.includes('Bundesliga_logo.svg'),'Bundesliga backup wordmark missing');
assert(app.includes('sourceIndex<sources.length'),'League logo backup URL handling missing');
assert(app.includes("mark.classList.add('logo-ready')"),'Logo load visibility handler missing');
console.log('✓ All '+ids.length+' leagues have logo sources and image fallback handling.');
