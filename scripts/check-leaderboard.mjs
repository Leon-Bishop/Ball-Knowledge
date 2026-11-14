import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import Session from '../assets/session-core.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),js=read('assets/app.js'),client=read('assets/leaderboard.js'),worker=read('leaderboard-worker/src/index.js');
const rules=read('leaderboard-worker/migrations/0001_init.sql');
const i18n=JSON.parse(read('i18n.json'));
new vm.Script(client,{filename:'assets/leaderboard.js'});
new vm.Script(worker.replace('export default {','const __exported = {'),{filename:'worker/index.js'});
assert(html.includes('id="leaderboardView"')&&html.includes('id="rankingRows"'),'Missing scoreboard screen');
assert(html.includes('src="./assets/leaderboard-config.js"')&&html.includes('src="./assets/leaderboard.js"'),'Missing client scripts');
assert(js.includes('window.BallKnowledgeLeaderboard?.submit(session)'),'Completed quiz must submit score');
assert(js.includes('session.leaderboardMode='),'Quiz length must be saved at start');
assert(rules.includes('name_key TEXT NOT NULL UNIQUE')&&rules.includes('token_hash TEXT NOT NULL UNIQUE'),'Usernames and anonymous IDs must be unique');
assert(worker.includes('req.cf?.country'),'Use Cloudflare country; do not ask for precise location');
assert(worker.includes('DELETE FROM rate_limits'),'Rate limiting should be enabled');
assert(worker.includes('score>correct*5'),'Reject impossible scores');
assert(!/\bpassword\s*[:=]/i.test(worker),'No password field should be needed');
for(const [locale,strings] of Object.entries(i18n))
 for(const key of ['navLeaderboard','leaderboardTitle','playerTitle','claimUsername','oneUsernameNote','rankingGlobal','rankingCountry','rankingRegion','leaderboardNotConnected','leaderboardBeta'])
  assert(strings[key],locale+' missing '+key);
const clubs=Array.from({length:18},(_,i)=>({id:'x'+i,name:'Club '+i,league_id:'league'}));
assert.equal(Session.createSession(clubs,{limit:5}).order.length,5);
assert.equal(Session.createSession(clubs,{limit:10}).order.length,10);
assert.equal(Session.createSession(clubs,{limit:18}).order.length,18);
console.log('✓ Anonymous rankings UI, API syntax, country flags, unique identities, translations, score checks.');
