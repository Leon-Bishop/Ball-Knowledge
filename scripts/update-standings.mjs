/**
 * Free, open-licensed standings cache builder.
 * OpenLigaDB (ODbL 1.0) is preferred where a verified 2026 season exists.
 * OpenFootball (CC0) is a fallback. Never synthesize a missing match result.
 * The shared static cache serves every visitor; no browser polls the sources.
 */
import fs from 'node:fs/promises';

const season = Number(process.env.STANDINGS_SEASON || 2026);
const outputFile = 'assets/standings.json';
const previous = await fs.readFile(outputFile,'utf8').then(JSON.parse).catch(()=>({leagues:{}}));
const output = {provider:'OpenLigaDB / OpenFootball',licenses:{
 OpenLigaDB:'ODbL 1.0 — https://www.openligadb.de/lizenz',
 OpenFootball:'CC0 1.0 — https://github.com/openfootball/football.json/blob/master/LICENSE.md'
},leagues:{}};
const leagues = {
 'england-premier-league':{json:'2026-27/en.1.json',shortcut:'pl',expected:20},
 'france-ligue-1':{json:'2026-27/fr.1.json',expected:18},
 'germany-bundesliga':{json:'2026-27/de.1.json',shortcut:'bl1',expected:18},
 'italy-serie-a':{json:'2026-27/it.1.json',expected:20},
 'netherlands-eredivisie':{json:'2026-27/nl.1.json',expected:18},
 'portugal-liga-portugal':{json:'2026-27/pt.1.json',expected:18},
 'spain-la-liga':{json:'2026-27/es.1.json',shortcut:'la1',expected:20},
 'turkey-super-lig':{txt:'https://raw.githubusercontent.com/openfootball/europe/master/turkey/2026-27_tr1.txt',expected:18}
};
async function request(url) {
 const response=await fetch(url,{headers:{'Accept':'application/json, text/plain;q=0.9','User-Agent':'BallKnowledgeStandings/1.0'},signal:AbortSignal.timeout(18000)});
 if(!response.ok)throw Error('HTTP '+response.status+' from '+url);
 return response.text();
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function tableFromMatches(matches,expected) {
 const teams=new Map(),seen=new Set();
 const ensure=name=>{
  name=String(name||'').trim();
  if(!name||name.length>90)throw Error('Invalid club');
  if(!teams.has(name))teams.set(name,{team:name,played:0,points:0,gd:0,gf:0});
  return teams.get(name);
 };
 for(const m of matches) {
  const home=String(m.home||'').trim(),away=String(m.away||'').trim();
  if(!home||!away||home===away)continue;
  ensure(home);ensure(away);
  const a=Number(m.goalsHome),b=Number(m.goalsAway);
  if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>30||b>30)continue;
  const key=[m.date||'',home,away].join('|');
  if(seen.has(key))continue;
  seen.add(key);
  const h=ensure(home),v=ensure(away);
  h.played++;v.played++;h.gf+=a;v.gf+=b;h.gd+=a-b;v.gd+=b-a;
  h.points+=a>b?3:a===b?1:0;
  v.points+=b>a?3:a===b?1:0;
 }
 const rows=[...teams.values()].sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf||a.team.localeCompare(b.team));
 if(!seen.size||rows.length<Math.max(8,expected-3)||rows.length>expected+3)throw Error('Insufficient or inconsistent results: '+seen.size+' games, '+rows.length+' clubs');
 return {rows:rows.map((r,i)=>({rank:i+1,team:r.team,played:r.played,points:r.points})),matches:seen.size};
}
function parseJson(raw,expected) {
 const data=JSON.parse(raw);
 if(!Array.isArray(data.matches))throw Error('Missing matches');
 return tableFromMatches(data.matches.map(m=>({
  home:m.team1,away:m.team2,date:m.date,
  goalsHome:Array.isArray(m.score?.ft)?m.score.ft[0]:null,
  goalsAway:Array.isArray(m.score?.ft)?m.score.ft[1]:null
 })).filter(m=>m.goalsHome!==null&&m.goalsAway!==null),expected);
}
function parseText(raw,expected) {
 // OpenFootball Europe format: "19:00   Home  2-1 (1-0)  Away".
 // Ignore scorers, unplayed fixtures, postponed games and summary tables.
 const matches=[],lines=raw.split(/\r?\n/);
 let month='',year=season;
 for(const line of lines){
  const date=line.match(/^\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:\s+(\d{4}))?/);
  if(date){month=date[1];year=date[3]?Number(date[3]):(['Jan','Feb','Mar','Apr','May','Jun'].includes(month)?season+1:season);continue;}
  const m=line.match(/^\s*(?:(?:\d{1,2}:\d{2})\s+)?(.+?)\s{2,}(\d{1,2})-(\d{1,2})(?:\s+\(\d+-\d+\))?\s{2,}(.+?)\s*$/);
  if(m&&month)matches.push({home:m[1].trim(),away:m[4].trim(),goalsHome:Number(m[2]),goalsAway:Number(m[3]),date:month+'-'+year});
 }
 return tableFromMatches(matches,expected);
}
async function openLigaDB(shortcut,expected){
 // Only known, documented current-season shortcuts. Do not infer other
 // league shortcuts from similar names in the community-maintained index.
 const raw=JSON.parse(await request('https://api.openligadb.de/getmatchdata/'+shortcut+'/'+season));
 if(!Array.isArray(raw))throw Error('OpenLigaDB returned no fixtures');
 const matches=raw.map(m=>{
  const ft=(m.matchResults||[]).find(r=>r.resultTypeID===2||r.resultTypeId===2||r.resultName==='Endergebnis')||
   (m.matchResults||[]).find(r=>r.resultOrderID===2||r.resultOrderId===2);
  return {home:m.team1?.teamName,away:m.team2?.teamName,date:m.matchDateTime,
   goalsHome:m.matchIsFinished?ft?.pointsTeam1:null,goalsAway:m.matchIsFinished?ft?.pointsTeam2:null};
 }).filter(m=>m.goalsHome!=null&&m.goalsAway!=null);
 return tableFromMatches(matches,expected);
}
let newCount=0;
for(const [id,config] of Object.entries(leagues)){
 let entry=null;
 if(config.shortcut){
  try{
   const data=await openLigaDB(config.shortcut,config.expected);
   entry={...data,source:'OpenLigaDB',sourceUrl:'https://api.openligadb.de/getmatchdata/'+config.shortcut+'/'+season};
  }catch(e){console.warn(id+' OpenLigaDB: '+e.message)}
  await wait(1100);
 }
 if(!entry){
  try{
   const url=config.json?'https://raw.githubusercontent.com/openfootball/football.json/master/'+config.json:config.txt;
   const raw=await request(url);
   const data=config.json?parseJson(raw,config.expected):parseText(raw,config.expected);
   entry={...data,source:'OpenFootball',sourceUrl:url};
  }catch(e){console.warn(id+' OpenFootball: '+e.message)}
 }
 if(entry){
  output.leagues[id]={updatedAt:new Date().toISOString(),source:entry.source,sourceUrl:entry.sourceUrl,
   calculated:true,rankingNote:'Calculated from published final scores; official tie-breaks and deductions may differ.',
   rows:entry.rows};
  newCount++;
  console.log(id+': '+entry.rows.length+' clubs, '+entry.matches+' final scores via '+entry.source);
 }else if(previous.leagues?.[id]?.rows?.length){
  output.leagues[id]={...previous.leagues[id],stale:true};
  console.warn(id+': keeping previous cache; new data unavailable');
 }
 await wait(250);
}
if(!Object.keys(output.leagues).length)throw Error('No verified standings and no cached fallback');
await fs.writeFile(outputFile,JSON.stringify(output,null,2)+'\n');
console.log('Wrote '+newCount+' refreshed standings; '+Object.keys(output.leagues).length+' leagues in cache');
