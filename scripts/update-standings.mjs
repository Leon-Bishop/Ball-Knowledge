// Download current standings at deploy time. API key stays in GitHub Actions secrets.
// No API calls are made from a player's browser and no fabricated standings are published.
import fs from 'node:fs/promises';
const key=process.env.API_NINJAS_KEY;
if(!key){console.log('Standings API key not configured. Publish without live tables.');process.exit(0)}
const leagues={
 'belgian-pro-league':'belgianproleague',
 'brazil-serie-a':'brasileirao',
 'england-premier-league':'epl',
 'france-ligue-1':'ligue1',
 'germany-bundesliga':'bundesliga',
 'greece-super-league':'greeksuperleague',
 'italy-serie-a':'seriea',
 'netherlands-eredivisie':'eredivisie',
 'portugal-liga-portugal':'primeiraliga',
 'scotland-premiership':'scottishpremiership',
 'spain-la-liga':'laliga',
 'turkey-super-lig':'superlig'
};
const output={provider:'API Ninjas',leagues:{}};
for(const [id,league] of Object.entries(leagues)){
 try{
  const res=await fetch('https://api.api-ninjas.com/v1/soccerstandings?league='+encodeURIComponent(league),{
   headers:{'X-Api-Key':key,'Accept':'application/json'},signal:AbortSignal.timeout(18000)});
  if(!res.ok)throw Error('HTTP '+res.status);
  const rows=await res.json();
  if(!Array.isArray(rows)||!rows.length)throw Error('No standings returned');
  const clean=rows.map(t=>({
   rank:Number(t.league_rank),team:String(t.team?.name||'').trim().slice(0,80),
   played:Number(t.games_played),points:Number(t.points)
  })).filter(t=>Number.isInteger(t.rank)&&t.rank>0&&t.team&&Number.isInteger(t.played)&&Number.isInteger(t.points));
  if(!clean.length)throw Error('No valid rows');
  clean.sort((a,b)=>a.rank-b.rank);
  output.leagues[id]={updatedAt:new Date().toISOString(),rows:clean};
  console.log(id+': '+clean.length+' current standings rows');
 }catch(e){console.warn(id+': '+e.message)}
 await new Promise(resolve=>setTimeout(resolve,250));
}
if(!Object.keys(output.leagues).length)throw Error('No live standings from API. Check key/coverage.');
await fs.writeFile('assets/standings.json',JSON.stringify(output,null,2)+'\n');
console.log('Wrote current standings for '+Object.keys(output.leagues).length+' leagues');
