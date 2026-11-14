const $=id=>document.getElementById(id);let dictionaries={},lang=localStorage.getItem('efq-language')||'tr';const tr=(key,args={})=>{let str=dictionaries[lang]?.[key]||dictionaries.tr?.[key]||key;return str.replace(/\{(\w+)\}/g,(_,k)=>String(args[k]??''))};const quizLengths={short:5,medium:10};let chosenLeagues=new Set((()=>{try{const saved=JSON.parse(localStorage.getItem('bk-leagues')||'null');return Array.isArray(saved)?saved:['england-premier-league','turkey-super-lig']}catch{return ['england-premier-league','turkey-super-lig']}})());let leagues=[],teams=[],clubFacts=new Map(),pool=[],session=null,round=null,clueOrder=[],selected=null,wrong=[],finished=false,score=0,streak=0,best=Number(localStorage.getItem('bk-best-session-score')||0),outcomes=[];
const normalize=s=>String(s||'').toLocaleLowerCase('en').replace(/ı/g,'i').replace(/ß/g,'ss').replace(/æ/g,'ae').replace(/ø/g,'o').replace(/ł/g,'l').replace(/đ/g,'d').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
function warn(s){console.warn(s);$('warnings').textContent+=s+'\n'}
function validate(){let ids=new Set(),seq=new Set();for(const t of teams){for(const k of ['id','name','league_id','emojis','why','sources','confidence','fun_fact'])if(t[k]==null)warn('Missing '+k+': '+(t.name||'?'));if(ids.has(t.id))warn('Duplicate ID: '+t.id);ids.add(t.id);if(!leagues.some(l=>l.id===t.league_id))warn('Missing league: '+t.name+' → '+t.league_id);if(!Array.isArray(t.emojis)||t.emojis.length!==5)warn('Invalid emoji count: '+t.name);else{let key=JSON.stringify(t.emojis);if(seq.has(key))warn('Duplicate emoji sequence: '+t.name);seq.add(key)}}}
function valid(t){return t.id&&t.name&&t.league_id&&Array.isArray(t.emojis)&&t.emojis.length===5&&leagues.some(l=>l.id===t.league_id)}
function quizLength(){return quizLengths[$('f-quizLength')?.value]||pool.length}
function roundCount(){return Math.min(pool.length,quizLength())}
const officialLogos={
 "belgian-pro-league": "https://commons.wikimedia.org/wiki/Special:FilePath/Belgian%20Pro%20League%20logo%20%282020%2C%20boxed%29.svg",
 "brazil-serie-a": "https://commons.wikimedia.org/wiki/Special:FilePath/Campeonato%20Brasileiro%20S%C3%A9rie%20A%20logo%20%282026%29.svg",
 "england-premier-league": "https://commons.wikimedia.org/wiki/Special:FilePath/Premier%20League%20wordmark.svg",
 "france-ligue-1": "https://commons.wikimedia.org/wiki/Special:FilePath/Logo%20Ligue%201%20McDonald%27s%202024.svg",
 "germany-bundesliga": "https://commons.wikimedia.org/wiki/Special:FilePath/Fu%C3%9Fball-Bundesliga%20Logo.png",
 "greece-super-league": "https://commons.wikimedia.org/wiki/Special:FilePath/Stoiximan%20Super%20League%20Greece%20logo.svg",
 "italy-serie-a": "https://commons.wikimedia.org/wiki/Special:FilePath/Serie%20A%20logo%202022.svg",
 "netherlands-eredivisie": "https://commons.wikimedia.org/wiki/Special:FilePath/VriendenLoterij%20Eredivisie%20Logo.png",
 "portugal-liga-portugal": "https://commons.wikimedia.org/wiki/Special:FilePath/Liga%20Portugal%20Betclic%20logo.svg",
 "spain-la-liga": "https://commons.wikimedia.org/wiki/Special:FilePath/LaLiga%20EA%20Sports%202023%20Vertical%20Logo.svg",
 "scotland-premiership": "https://images.seeklogo.com/logo-png/27/1/scottish-premiership-logo-png_seeklogo-277110.png",
 "turkey-super-lig": "https://commons.wikimedia.org/wiki/Special:FilePath/Trendyol%20S%C3%BCper%20Lig%20logo%20dikey.svg"
};
const displayOrder=['england-premier-league','spain-la-liga','italy-serie-a','germany-bundesliga','france-ligue-1','turkey-super-lig','netherlands-eredivisie','portugal-liga-portugal','belgian-pro-league','brazil-serie-a','scotland-premiership','greece-super-league'];
const leagueMarks={
 'england-premier-league':['♛','PL'],'spain-la-liga':['◆','LIGA'],'italy-serie-a':['▲','SERIE A'],
 'germany-bundesliga':['⚽','BL'],'france-ligue-1':['◢','L1'],'turkey-super-lig':['★','SÜPER LİG'],
 'netherlands-eredivisie':['◎','ERED.'],'portugal-liga-portugal':['↗','LIGA PT'],
 'belgian-pro-league':['◩','PRO'],'brazil-serie-a':['🏆','SÉRIE A'],
 'scotland-premiership':['◈','SPFL'],'greece-super-league':['▤','SL']};
function makeLeagueGrid(){
 const grid=$('leagueGrid');grid.replaceChildren();
 for(const l of [...leagues].sort((a,b)=>displayOrder.indexOf(a.id)-displayOrder.indexOf(b.id))){
  const b=document.createElement('button');b.type='button';b.className='league-tile';b.dataset.league=l.id;
  b.setAttribute('aria-pressed',String(chosenLeagues.has(l.id)));b.setAttribute('aria-label',l.name);
  const mark=document.createElement('div');mark.className='league-mark';
  const fallback=document.createElement('div');fallback.className='league-logo-fallback';
  const symbol=document.createElement('span');symbol.className='league-brand-icon';symbol.textContent=(leagueMarks[l.id]||['◈','LEAGUE'])[0];
  const initials=document.createElement('span');initials.className='league-letters';initials.textContent=(leagueMarks[l.id]||['◈',l.name])[1];
  fallback.append(symbol,initials);mark.append(fallback);
  if(officialLogos[l.id]){
   const img=document.createElement('img');img.alt=tr('logoAlt',{name:l.name});
   img.loading='lazy';img.referrerPolicy='no-referrer';
   img.onload=()=>mark.classList.add('logo-ready');img.onerror=()=>{img.remove();mark.classList.remove('logo-ready')};
   img.src=officialLogos[l.id];mark.append(img);
  }
  const name=document.createElement('span');name.className='league-name';name.textContent=l.name;b.append(mark,name);
  b.onclick=()=>{if(chosenLeagues.has(l.id))chosenLeagues.delete(l.id);else chosenLeagues.add(l.id);
   localStorage.setItem('bk-leagues',JSON.stringify([...chosenLeagues]));makeLeagueGrid();filter()};grid.append(b);
 }
}
function setAllLeagues(selectAll){chosenLeagues=new Set(selectAll?leagues.map(l=>l.id):[]);localStorage.setItem('bk-leagues',JSON.stringify([...chosenLeagues]));makeLeagueGrid();filter()}
function makeFilters(){
 const prior=$('f-quizLength')?.value||'short';
 const label=document.createElement('label');label.textContent=tr('quizLength');
 const sel=document.createElement('select');sel.id='f-quizLength';
 for(const [value,key] of [['short','lengthShort'],['medium','lengthMedium'],['long','lengthLong']]){
  const option=document.createElement('option');option.value=value;option.textContent=tr(key);sel.append(option);
 }
 sel.value=prior;sel.onchange=filter;label.append(sel);$('filters').replaceChildren(label);
}
function filter(){
 // Quiz length controls the NEXT session; every selected club is eligible regardless of length.
 pool=BallKnowledgeSession.uniqueClubs(teams.filter(t=>valid(t)&&chosenLeagues.has(t.league_id)));
 $('pool').textContent=tr('teamsAvailable',{count:pool.length});updateStartButton();
}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function seededShuffle(a,seed){a=[...a];for(let i=a.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;let j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function startQuiz(){
 if(!pool.length)return;
 const date=new Date().toLocaleDateString('sv-SE');
 session=BallKnowledgeSession.createSession(pool,{daily:false,date,limit:roundCount()});
 score=0;streak=0;round=null;outcomes=[];
 newRound();setView('game');
}
function newRound(){
 if(!session||session.completed)return;
 round=BallKnowledgeSession.currentClub(session);
 if(!round)return;
 clueOrder=session.daily?seededShuffle([0,1,2,3,4],hash(session.date+'|'+round.id+'|clues')):shuffle([0,1,2,3,4]);
 wrong=[];outcomes=[];selected=null;selectedFactForRound=null;finished=false;
 $('guess').value='';$('message').textContent='';$('history').replaceChildren();$('suggestions').replaceChildren();
 $('result').classList.add('hidden');$('sessionSummary').classList.add('hidden');$('endActions').classList.add('hidden');
 $('next').classList.remove('hidden');$('play').classList.remove('hidden');
 $('mode').textContent=session.daily?tr('dailyMode'):tr('randomMode');
 render();
}
function renderProgress(){
 if(!session){$('roundProgress').textContent='';$('sessionProgress').textContent='';$('sessionMeterFill').style.width='0%';return}
 const s=BallKnowledgeSession.summary(session);
 const current=session.completed?s.total:Math.min(s.total,s.played+(finished?0:1));
 $('roundProgress').textContent=session.completed?tr('sessionComplete'):tr('roundProgress',{current,total:s.total});
 $('sessionProgress').textContent=tr('roundsCompleted',{completed:s.played,total:s.total});
 const pct=s.total?Math.round(s.played/s.total*100):0;
 $('sessionMeterFill').style.width=pct+'%';$('sessionMeter').setAttribute('aria-valuenow',String(pct));
}
function render(){
 if(!round)return;
 $('attempts').textContent=finished?tr('roundResolved'):tr('attempts',{count:5-wrong.length});
 $('slots').innerHTML=clueOrder.map((idx,i)=>`<div class="slot ${i<=wrong.length?'show':''}" title="${tr('clue',{count:i+1})}">${i<=wrong.length||finished?round.emojis[idx]:'❓'}</div>`).join('');
 $('submit').disabled=!selected||finished;
 $('selected').textContent=selected?tr('selected',{name:selected.name}):'';
 updateStats();renderProgress();
}
function suggest(){
 selected=null;render();let q=normalize($('guess').value);$('suggestions').replaceChildren();if(!q||!session||session.completed)return;
 const played=new Set(session.results.map(x=>x.id));
 for(const t of session.order.filter(t=>!played.has(t.id)&&!wrong.some(w=>w.id===t.id)&&[t.name,...(t.aliases||[]),t.team_abbreviation].some(n=>normalize(n).includes(q))).slice(0,8)){
  let b=document.createElement('button');b.textContent=t.name;
  b.onclick=()=>{selected=t;$('guess').value=t.name;$('suggestions').replaceChildren();render()};$('suggestions').append(b)
 }
}
// Feedback must add information: never state the country, or restate the selected single league.
const KIT_COLOUR_EMOJIS=new Set(['🔴','🔵','🟡','🟢','⚫','⚪','🟣','🟠','🟤']);
function guessFeedback(guess,answer,lastAttempt){
 if(lastAttempt)return tr('incorrectGuess');
 const a=normalize(guess.city||'');const b=normalize(answer.city||'');
 if(a&&b&&a===b&&a!=='unknown'&&a!=='bilinmiyor')return tr('sameCity');
 const colors=new Set((guess.emojis||[]).filter(e=>KIT_COLOUR_EMOJIS.has(e)));
 if((answer.emojis||[]).some(e=>KIT_COLOUR_EMOJIS.has(e)&&colors.has(e)))return tr('sharedColour');
 if(new Set((session?.order||pool).map(t=>t.league_id)).size>1&&guess.league_id===answer.league_id)return tr('sameLeague');
 return tr('newClue');
}
function submit(){
 if(!selected||finished||!round||!session||session.completed)return;
 let t=selected;selected=null;$('guess').value='';$('suggestions').replaceChildren();
 if(wrong.some(w=>w.id===t.id)){$('message').textContent=tr('alreadyGuessed');render();return}
 if(t.id===round.id){outcomes.push('🟩');finish(true,5-wrong.length)}
 else{
  wrong.push(t);outcomes.push('🟥');const hint=guessFeedback(t,round,wrong.length>=5);
  $('message').textContent=tr('wrong',{hint});
  const li=document.createElement('li');li.textContent=t.name+' — '+hint;$('history').append(li);
  if(wrong.length>=5)finish(false,0);else render();
 }
}
function finish(win,pts){
 if(finished||!session||session.completed)return;
 finished=true;
 BallKnowledgeSession.recordRound(session,round,{won:win,wrongCount:wrong.length});
 score=BallKnowledgeSession.summary(session).score;
 streak=win?streak+1:0;
 if(session.completed){best=Math.max(best,score);localStorage.setItem('bk-best-session-score',String(best))}
 $('play').classList.add('hidden');$('endActions').classList.remove('hidden');
 const league=leagues.find(l=>l.id===round.league_id);
 $('message').textContent=win?tr('correct',{points:pts}):tr('gameOver');
 $('result').classList.remove('hidden');$('result').replaceChildren();
 const title=document.createElement('h3');title.textContent=round.name;
 const sub=document.createElement('p');sub.className='muted';sub.textContent=`${league?.name||round.league_id} · ${localizedCountry(round.country)}`;
 const emoji=document.createElement('p');emoji.className='result-emojis';emoji.textContent=round.emojis.join(' ');
 $('result').append(title,sub,emoji);
 const heading=document.createElement('strong');heading.textContent=tr('didYouKnow');
 const fact=document.createElement('p');fact.className='fact-text';fact.textContent=pickDisplayFact(round);
 $('result').append(heading,fact);
 if(lang!=='tr'&&lastFactIsTurkish){const note=document.createElement('p');note.className='fact-language-note';note.textContent=tr('factOriginal');$('result').append(note)}
 $('next').classList.toggle('hidden',session.completed);
 if(session.completed)renderFinalSummary();else $('sessionSummary').classList.add('hidden');
 render();
 if(session.completed)$('sessionSummary').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function renderFinalSummary(){
 const panel=$('sessionSummary');panel.replaceChildren();
 if(!session?.completed){panel.classList.add('hidden');return}
 const s=BallKnowledgeSession.summary(session);
 panel.classList.remove('hidden');
 const kicker=document.createElement('div');kicker.className='summary-kicker';kicker.textContent='🏆 '+tr('sessionComplete');
 const title=document.createElement('h2');title.textContent=tr('finalScore');
 const number=document.createElement('div');number.className='final-score-number';number.textContent=`${s.score} / ${s.maxScore}`;
 const caption=document.createElement('p');caption.className='summary-caption';caption.textContent=tr('scorePercent',{percentage:s.percentage});
 panel.append(kicker,title,number,caption);
 const grid=document.createElement('div');grid.className='summary-stat-grid';
 for(const [key,value] of [['clubsCorrect',s.correct],['clubsMissed',s.missed],['sessionBestStreak',s.bestStreak],['totalRounds',s.total]]){
  const cell=document.createElement('div');cell.className='summary-stat-cell';
  const val=document.createElement('strong');val.textContent=String(value);
  const lbl=document.createElement('span');lbl.textContent=tr(key);
  cell.append(val,lbl);grid.append(cell)
 }
 panel.append(grid);
 const details=document.createElement('details');details.className='summary-round-list';
 const label=document.createElement('summary');label.textContent=tr('roundResults');details.append(label);
 const list=document.createElement('ol');
 for(const result of session.results){const li=document.createElement('li');li.textContent=(result.won?'✅ ':'❌ ')+result.name+' — '+result.points+' '+tr('points');list.append(li)}
 details.append(list);panel.append(details);
 const buttons=document.createElement('div');buttons.className='summary-actions';
 const again=document.createElement('button');again.className='primary-cta';again.textContent=tr('playAgain');again.onclick=startQuiz;
 const change=document.createElement('button');change.className='outline-button';change.textContent=tr('selectLeagues');change.onclick=()=>setView('selection');
 buttons.append(again,change);panel.append(buttons);
}
function share(){
 let result;
 if(session?.completed){const s=BallKnowledgeSession.summary(session);result=`⚽ Ball Knowledge 🏆 ${s.score}/${s.maxScore} · ${s.correct}/${s.total} ${tr('clubsCorrect')}`}
 else result=`${tr('shareTitle')} ⚽ ${finished&&outcomes.includes('🟩')?outcomes.length+'/5':'X/5'} ${outcomes.join('')}${'⬜'.repeat(5-outcomes.length)}`;
 const onLocalHost=['localhost','127.0.0.1','0.0.0.0'].includes(window.location.hostname);
 const gameUrl=onLocalHost?'https://leon-bishop.github.io/Ball-Knowledge/':window.location.href.split('#')[0];
 const intent='https://twitter.com/intent/tweet?text='+encodeURIComponent(result+' '+tr('shareInvite'))+'&url='+encodeURIComponent(gameUrl);
 window.open(intent,'_blank','noopener,noreferrer');
}
function getFallbackFact(team){
 const direct=(team.fun_fact||'').trim();
 if(direct)return direct;
 if(Array.isArray(team.why)&&team.why.length){
  const meaningful=team.why.filter(Boolean).slice(0,5).join(' · ');
  if(meaningful)return tr('fallbackClues',{name:team.name,text:meaningful});
 }
 if(team.team_stadium)return tr('fallbackStadium',{name:team.name,stadium:team.team_stadium});
 if(team.city)return tr('fallbackCity',{name:team.name,city:team.city});
 return tr('fallbackFact',{name:team.name});
}
let lastFactIsTurkish=false,selectedFactForRound=null;
function chooseFactForRound(team){
 const all=(clubFacts.get(team.id)||[]).filter(x=>typeof x.text==='string'&&x.text.trim());
 // Prefer researched, sourced stories over provisional entries; do not show editorial labels.
 const sourced=all.filter(x=>x.status==='source_supported'&&Array.isArray(x.sources)&&x.sources.length);
 const candidates=sourced.length?sourced:all;
 if(candidates.length){const fact=candidates[Math.floor(Math.random()*candidates.length)];return {text:fact.text.trim(),translations:fact.translations||{}}}
 return {text:getFallbackFact(team),translations:{}};
}
function pickDisplayFact(team){
 if(!selectedFactForRound)selectedFactForRound=chooseFactForRound(team);
 const chosen=selectedFactForRound;
 lastFactIsTurkish=lang!=='tr'&&!chosen.translations?.[lang];
 return chosen.translations?.[lang]||chosen.text;
}
function refreshFactInResult(){
 if(!finished||!round||!selectedFactForRound)return;
 const el=$('result').querySelector('p.fact-text');if(el)el.textContent=pickDisplayFact(round);
 const note=$('result').querySelector('p.fact-language-note');if(note)note.remove();
 if(lastFactIsTurkish&&lang!=='tr'){const n=document.createElement('p');n.className='fact-language-note';n.textContent=tr('factOriginal');$('result').append(n)}
}


const countryCodes={'Turkey':'TR','Türkiye':'TR','England':'GB','Scotland':'GB','Wales':'GB','France':'FR','Germany':'DE','Spain':'ES','Italy':'IT','Greece':'GR','Brazil':'BR','Portugal':'PT','Netherlands':'NL','Belgium':'BE'};
function localizedCountry(country){if(country==='England'||country==='Scotland'||country==='Wales')return country;try{const code=countryCodes[country];return code?new Intl.DisplayNames([lang],{type:'region'}).of(code):country}catch{return country}}
let currentView='selection';
function updateStats(){
 $('stats').textContent=`${tr('points')} ${score} · ${tr('streak')} ${streak} · ${tr('best')} ${best}`;
 const cells=[['points',score],['streak',streak],['best',best]];
 $('statsDetails').replaceChildren();
 for(const [key,val] of cells){const box=document.createElement('div');box.className='stat-cell';
 const strong=document.createElement('strong');strong.textContent=String(val);
 const label=document.createElement('span');label.textContent=tr(key);box.append(strong,label);$('statsDetails').append(box)}
}
function updateStartButton(){
 const button=$('new');button.textContent=tr('startQuizRounds',{count:roundCount()});button.disabled=!pool.length||!chosenLeagues.size;
}
function setView(view){
 if(view==='game'&&!session){if(!pool.length){view='selection'}else{startQuiz();return}}
 currentView=view;
 for(const [key,id] of Object.entries({selection:'selectionView',game:'gameView',stats:'statsView',settings:'settingsView'}))$(id).classList.toggle('hidden',view!==key);
 for(const btn of document.querySelectorAll('.nav-item')){const active=btn.dataset.screen===view;btn.classList.toggle('active',active);if(active)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')}
 if(view==='stats')updateStats();
 if(view==='settings')$('settingsChoose').textContent=session?tr('resumeGame'):tr('selectLeagues');
 window.scrollTo({top:0,behavior:'instant'});
}
function refreshLanguage(){
 document.documentElement.lang=lang;document.title='Ball Knowledge';
 $('gameTitle').innerHTML='<span>BALL</span><em>KNOWLEDGE</em>';
 $('brandTagline').textContent=tr('brandTagline');
 $('languageLabel').textContent=tr('language');$('language').setAttribute('aria-label',tr('language'));
 $('language').value=lang;$('settingsLanguage').value=lang;$('theme').setAttribute('aria-label',tr('theme'));
 $('selectionEyebrow').textContent=tr('selectionEyebrow');
 $('leagueTitle').textContent=tr('selectLeagues');$('leagueHelp').textContent=tr('selectHelp');
 $('backLabel').textContent=tr('backToLeagues');$('roundEyebrow').textContent=tr('roundEyebrow');
 $('guessTitle').textContent=tr('guessTitle');$('clueHelp').textContent=tr('clueHelp');$('guessLabel').textContent=tr('guessLabel');
 $('guess').placeholder=tr('guessPlaceholder');$('submit').textContent=tr('submit');
 $('share').textContent=tr('share');$('next').textContent=tr('next');$('warningsTitle').textContent=tr('dataWarnings');
 $('statsEyebrow').textContent=tr('statsEyebrow');$('statsTitle').textContent=tr('statsTitle');
 $('settingsEyebrow').textContent=tr('settingsEyebrow');$('settingsTitle').textContent=tr('settingsTitle');
 $('settingsLanguageLabel').textContent=tr('settingsLanguage');$('settingsLanguage').setAttribute('aria-label',tr('settingsLanguage'));
 $('settingsThemeLabel').textContent=tr('settingsAppearance');$('settingsTheme').textContent=tr('theme');
 $('selectAllLeagues').textContent=tr('selectAllLeagues');$('deselectAllLeagues').textContent=tr('deselectAllLeagues');
 $('statsChoose').textContent=tr('selectLeagues');$('settingsChoose').textContent=session?tr('resumeGame'):tr('selectLeagues');
 $('navLeagues').textContent=tr('navLeagues');$('navPlay').textContent=tr('navPlay');
 $('navStats').textContent=tr('navStats');$('navSettings').textContent=tr('navSettings');
 updateStartButton();updateStats();
 if(leagues.length){makeLeagueGrid();makeFilters();$('pool').textContent=tr('teamsAvailable',{count:pool.length});
 if(round){$('mode').textContent=session?.daily?tr('dailyMode'):tr('randomMode');render();if(finished)finishViewOnly()}}
}
function finishViewOnly(){if(!finished||!round)return;const league=leagues.find(l=>l.id===round.league_id);$('message').textContent=outcomes.includes('🟩')?tr('correct',{points:5-wrong.length}):tr('gameOver');const title=$('result').querySelector('h3');if(title)title.textContent=round.name;const sub=$('result').querySelector('p.muted');if(sub)sub.textContent=`${league?.name||round.league_id} · ${localizedCountry(round.country)}`;const strong=$('result').querySelector('strong');if(strong)strong.textContent=tr('didYouKnow');refreshFactInResult();if(session?.completed)renderFinalSummary();renderProgress()}

async function init(){try{dictionaries=await fetch('i18n.json').then(r=>{if(!r.ok)throw Error('i18n.json');return r.json()});if(!dictionaries[lang])lang='tr';refreshLanguage();[leagues,teams]=await Promise.all(['leagues.json','teams.enriched.json'].map(p=>fetch(p).then(r=>{if(!r.ok)throw Error(p);return r.json()})));
try{const res=await fetch('tum-kulupler-ilginc-hikayeler-guncel.json');if(!res.ok)throw Error('HTTP '+res.status);const rows=await res.json();for(const item of rows){if(!item.id||!Array.isArray(item.facts))continue;clubFacts.set(item.id,item.facts)}}catch(e){warn('Kulüp bilgileri yüklenemedi: '+e.message)}validate();makeLeagueGrid();makeFilters();filter();refreshLanguage()}catch(e){warn('Load failed: '+e.message+' — run a local web server, not file://')}}
$('guess').oninput=suggest;
$('guess').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();if(!selected){let b=$('suggestions').querySelector('button');if(b)b.click()}else submit()}};
$('submit').onclick=submit;
$('new').onclick=startQuiz;
$('next').onclick=()=>{if(!session?.completed){newRound();setView('game')}};
$('backToLeagues').onclick=()=>setView('selection');
$('share').onclick=share;
const toggleTheme=()=>{document.body.classList.toggle('dark');localStorage.setItem('efq-theme',document.body.classList.contains('dark')?'dark':'light')};
$('theme').onclick=toggleTheme;$('settingsTheme').onclick=toggleTheme;
const changeLanguage=value=>{lang=value;localStorage.setItem('efq-language',lang);refreshLanguage()};
$('language').onchange=()=>changeLanguage($('language').value);
$('settingsLanguage').onchange=()=>changeLanguage($('settingsLanguage').value);
$('selectAllLeagues').onclick=()=>setAllLeagues(true);
$('deselectAllLeagues').onclick=()=>setAllLeagues(false);
for(const btn of document.querySelectorAll('[data-screen]'))btn.onclick=()=>setView(btn.id==='settingsChoose'&&session?'game':btn.dataset.screen);
if(localStorage.getItem('efq-theme')==='dark')document.body.classList.add('dark');
setView('selection');init();
