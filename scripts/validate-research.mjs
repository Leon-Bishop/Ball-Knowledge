import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=(x)=>JSON.parse(fs.readFileSync(new URL('../'+x,import.meta.url),'utf8'));
const teams=read('teams.enriched.json'),rows=read('tum-kulupler-ilginc-hikayeler-guncel.json');
assert.equal(teams.length,214,'unexpected club record count');
assert.equal(rows.length,teams.length,'missing story records');
const ids=new Set(teams.map(t=>t.id));let targetCount=0,filled=0,sourced=0,translated=0;
for(const row of rows){assert.ok(ids.has(row.id),'unknown club: '+row.id);const expected=row.league_id==='turkey-super-lig'?5:3;targetCount+=expected;assert.equal(row.facts.length,expected,'story-slot count: '+row.id);for(const f of row.facts){if(typeof f.text==='string'&&f.text.trim()){filled++;if(f.sources?.length&&['sourced','source_supported'].includes(f.status))sourced++;if(['en','es','fr','it','pt'].every(l=>f.translations?.[l]?.trim()))translated++;}else{assert.equal(f.text,null,'empty fact must be null: '+row.id);}}}
assert.equal(targetCount,678);console.log(`Research schema valid: ${teams.length} clubs, ${targetCount} targets, ${filled} populated, ${sourced} source-tagged, ${translated} six-language, ${targetCount-filled} missing`);
