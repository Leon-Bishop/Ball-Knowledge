#!/usr/bin/env node
/**
 * Generate a gap-first research queue and localized search queries.
 * No API key or network calls: researchers copy batches into a search engine.
 * Usage: npm run research:plan -- --league=turkey-super-lig --limit=10
 */
import fs from 'node:fs';
const load=file=>JSON.parse(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));
const teams=load('teams.enriched.json');
const rows=load('tum-kulupler-ilginc-hikayeler-guncel.json');
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')).map(x=>{const [key,...value]=x.slice(2).split('=');return [key,value.join('=')||true]}));
const limit=Math.min(214,Math.max(1,Number(args.limit)||12));
const league=args.league||'';
const sourceHosts={
 'turkey-super-lig':['tff.org','uefa.com','aa.com.tr'],
 'belgian-pro-league':['proleague.be','uefa.com','sporza.be'],
 'brazil-serie-a':['cbf.com.br','ge.globo.com','conmebol.com'],
 'england-premier-league':['premierleague.com','thefa.com','uefa.com'],
 'france-ligue-1':['ligue1.com','fff.fr','uefa.com'],
 'germany-bundesliga':['bundesliga.com','dfb.de','uefa.com'],
 'greece-super-league':['slgr.gr','epo.gr','uefa.com'],
 'italy-serie-a':['legaseriea.it','figc.it','uefa.com'],
 'netherlands-eredivisie':['eredivisie.nl','knvb.nl','uefa.com'],
 'portugal-liga-portugal':['ligaportugal.pt','fpf.pt','uefa.com'],
 'scotland-premiership':['spfl.co.uk','scottishfa.co.uk','uefa.com'],
 'spain-la-liga':['laliga.com','rfef.es','uefa.com']
};
const vocab={
 'turkey-super-lig':['ilginç olay','şaşırtıcı hikâye','maskot lakap efsane','penaltı mucize uzatma'],
 'belgian-pro-league':['anekdote club','bijzonder verhaal','insolite mascotte'],
 'brazil-serie-a':['história inusitada','curiosidade histórica','mascote torcida'],
 'england-premier-league':['bizarre club story','unusual mascot','remarkable cup upset'],
 'france-ligue-1':['anecdote insolite','histoire incroyable','mascotte'],
 'germany-bundesliga':['kuriose Geschichte','ungewöhnliches Maskottchen','Pokal Sensation'],
 'greece-super-league':['παράξενη ιστορία','ιστορία ομάδας','έκπληξη κύπελλο'],
 'italy-serie-a':['storia incredibile','aneddoto curioso','mascotte'],
 'netherlands-eredivisie':['bijzonder verhaal','opmerkelijke wedstrijd','mascotte'],
 'portugal-liga-portugal':['história curiosa','insólito futebol','mascote'],
 'scotland-premiership':['strange club history','unusual supporters tradition','cup shock'],
 'spain-la-liga':['historia curiosa','anécdota insólita','gesta inesperada']
};
const byId=new Map(teams.map(t=>[t.id,t]));
const required=['en','es','fr','it','pt'];
const queue=rows.filter(r=>!league||r.league_id===league).map(r=>{
 const team=byId.get(r.id)||{};
 const missing=r.facts.filter(f=>!f.text?.trim()).length;
 const unsourced=r.facts.filter(f=>f.text?.trim() && !(f.sources?.length&&['source_supported','sourced'].includes(f.status))).length;
 const untranslated=r.facts.filter(f=>f.text?.trim() && required.some(k=>!f.translations?.[k]?.trim())).length;
 const local=(vocab[r.league_id]||vocab['england-premier-league']);
 const known=(r.facts||[]).filter(f=>f.text?.trim()).map(f=>f.text);
 const names=[r.team_name,...(team.aliases||[])].filter(Boolean);
 const short=names.filter(n=>n.length>=6 && n.toLowerCase()!==r.team_name.toLowerCase()).slice(0,2);
 const official=(sourceHosts[r.league_id]||['uefa.com']);
 const q=[
  `"${r.team_name}" "${local[0]}"`,
  `(site:${official[0]} OR site:${official[1]}) "${r.team_name}" "${local[1]}"`,
  `"${r.team_name}" "${local[2]}"`
 ];
 if(short[0])q.push(`"${short[0]}" "${local[1]}"`);
 return {id:r.id,club:r.team_name,league_id:r.league_id,required:r.facts.length,missing,unsourced,untranslated,
  // Prefer clubs with no sourced stories; do not overfocus on famous clubs with easy archives.
  priority:missing*5+unsourced*3+untranslated,known:known.slice(0,5),queries:q,preferred_domains:official};
}).filter(x=>x.missing||x.unsourced||x.untranslated).sort((a,b)=>b.priority-a.priority||a.club.localeCompare(b.club,'tr')).slice(0,limit);
if(args.format==='json'){process.stdout.write(JSON.stringify(queue,null,2)+'\n');process.exit(0)}
process.stdout.write(`# Research queue: ${league||'all leagues'} (top ${queue.length})\n\n`);
process.stdout.write('Search in the club’s own language first. Open a source and verify each claim before moving on to the next club. Do not infer history from a search snippet.\n\n');
for(const [i,r] of queue.entries()){
 process.stdout.write(`## ${i+1}. ${r.club} (${r.id})\nMissing ${r.missing}; needs source audit ${r.unsourced}; needs translation ${r.untranslated}.\n`);
 process.stdout.write('Queries:\n'+r.queries.map(x=>'- '+x).join('\n')+'\n\n');
}
