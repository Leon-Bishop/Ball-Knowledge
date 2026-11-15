import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const html=read('index.html'),css=read('assets/styles.css'),app=read('assets/app.js');
const dictionary=JSON.parse(read('i18n.json'));
assert(html.includes('id="homeView" class="screen home-view"'),'Dedicated welcome view is missing');
for(const id of ['homePlay','homeLeaderboard','homeLeagues','homeSettings','homeLanguage','heroHome']){
 assert(html.includes('id="'+id+'"'),'Missing home control '+id);
}
assert(html.includes('id="selectionView" class="screen selection-view hidden"'),'Selection must start hidden behind welcome screen');
assert(app.includes("setView('home');init();"),'Initial view must be the welcome screen');
assert(app.includes("document.body.classList.toggle('home-active',view==='home')"),'Page appearance must follow home view');
for(const [id,route] of [['homePlay','game'],['homeLeagues','selection'],['homeLeaderboard','leaderboard'],['homeSettings','settings'],['heroHome','home']]){
 assert(app.includes("$('"+id+"').onclick=()=>setView('"+route+"')"),'Wrong destination for '+id);
}
assert(app.includes("if(view==='game'&&!session)"),'Existing play-session start behaviour must remain');
assert(app.includes("session.referencePool=[...pool]"),'Game's league selection must remain intact');
assert(app.includes("$('selectAllLeagues').onclick=()=>setAllLeagues(true)"),'League bulk selection must remain intact');
assert(css.includes('body.home-active .stadium-hero')&&css.includes('body.home-active .bottom-nav'),'Welcome should replace old header/nav only on home');
assert(css.includes('.home-action-primary')&&css.includes('.home-action-secondary'),'Stadium Night buttons missing');
for(const [locale,strings] of Object.entries(dictionary)){
 for(const key of ['homeKicker','homePromise','homeFooter','homeBack'])assert(strings[key]?.trim(),locale+': '+key);
}
console.log('✓ Stadium Night home screen, navigation, preserved league/quiz routing, six languages.');
