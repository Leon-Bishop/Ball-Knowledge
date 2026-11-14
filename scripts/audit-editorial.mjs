#!/usr/bin/env node
/** Validate story shapes, source links, near-duplicate passages and localized coverage.
 * URL presence is NOT independent historical fact verification.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const parse=filename=>JSON.parse(fs.readFileSync(new URL('../'+filename,import.meta.url),'utf8'));
const data=parse('tum-kulupler-ilginc-hikayeler-guncel.json'), teams=parse('teams.enriched.json');
const locales=['en','es','fr','it','pt'];const tset=new Set(teams.map(t=>t.id));
const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const shingles=s=>new Set(clean(s).split(' ').filter(x=>x.length>3));
const sim=(a,b)=>{const sa=shingles(a),sb=shingles(b);if(!sa.size||!sb.size)return 0;return [...sa].filter(x=>sb.has(x)).length/Math.min(sa.size,sb.size)};
const issues=[],out={clubs:0,target:0,populated:0,source_tagged:0,six_languages:0,empty:0,issues:[],leagues:{}};
for(const row of data){
 out.clubs++;assert(tset.has(row.id),`Orphan story ID ${row.id}`);
 const target=row.league_id==='turkey-super-lig'?5:3;
 assert.equal(row.facts.length,target,`${row.id}: wrong fact array length`);
 out.target+=target;
 const line=out.leagues[row.league_id]??={clubs:0,target:0,populated:0,source_tagged:0,six_languages:0};line.clubs++;line.target+=target;
 const nonempty=[];
 for(let i=0;i<row.facts.length;i++){
  const f=row.facts[i];
  if(!f.text?.trim()){out.empty++;continue}
  out.populated++;line.populated++;nonempty.push([i,f.text]);
  if(f.status==='source_supported'||f.status==='sourced'){
   if(!f.sources?.length)issues.push(`${row.id}[${i}]: source tag without URL`);
   else {out.source_tagged++;line.source_tagged++}
  }
  for(const u of (f.sources||[]))if(!/^https?:\/\/[^/]+/i.test(u))issues.push(`${row.id}[${i}]: invalid source URL ${u}`);
  if(locales.every(l=>f.translations?.[l]?.trim())){out.six_languages++;line.six_languages++}
  if(f.text.length<65)issues.push(`${row.id}[${i}]: short story—check if substantive`);
 }
 for(let a=0;a<nonempty.length;a++)for(let b=a+1;b<nonempty.length;b++){
  if(sim(nonempty[a][1],nonempty[b][1])>0.78)issues.push(`${row.id}[${nonempty[a][0]},${nonempty[b][0]}]: possible duplicate event`);
 }
}
out.issues=issues;
const report=new URL('../RESEARCH_AUDIT.json',import.meta.url);
fs.writeFileSync(report,JSON.stringify(out,null,2)+'\n','utf8');
console.log(`Research audit: ${out.populated}/${out.target} populated; ${out.source_tagged} source-tagged; ${out.six_languages} fully translated; ${out.empty} empty; ${issues.length} editorial flags.`);
console.log('Detailed report: RESEARCH_AUDIT.json');
// Editorial quality flags do not fail the CI build; broken structural invariants do.
