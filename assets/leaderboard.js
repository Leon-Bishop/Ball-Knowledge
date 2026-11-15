/* Optional online scoreboard for Ball Knowledge. No login/password or precise location. */
(()=>{
'use strict';
const root=()=>String(window.BK_LEADERBOARD_API||'').trim().replace(/\/$/,'');
const node=id=>document.getElementById(id);
const words=(key)=>{try{return tr(key)}catch{return key}};
const tokenKey='bk-anonymous-player-token';
let profile=null,busy=false;
const token=()=>localStorage.getItem(tokenKey)||'';
const flag=country=>{if(!/^[A-Z]{2}$/.test(country)||country==='ZZ')return '🌍';return String.fromCodePoint(...[...country].map(c=>c.charCodeAt(0)+127397))};
const regionLabel=code=>code||'—';
const countryLabel=country=>{try{return new Intl.DisplayNames([lang],{type:'region'}).of(country)}catch{return country}};
async function api(path,{method='GET',body,withIdentity=true}={}){
 const headers={'Content-Type':'application/json'};
 if(withIdentity&&token())headers.Authorization='Bearer '+token();
 const r=await fetch(root()+path,{method,headers,body:body?JSON.stringify(body):undefined,mode:'cors',cache:'no-store'});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.error||words('leaderboardUnavailable'));
 return data;
}
function describeProfile(){
 const el=node('playerProfile');
 if(!el)return;
 el.replaceChildren();
 if(!root()){const p=document.createElement('p');p.className='muted';p.textContent=words('leaderboardNotConnected');el.append(p);return}
 if(!profile){
  const info=document.createElement('p');info.className='muted';info.textContent=words('playerNameHelp');
  const form=document.createElement('form');form.id='claimUsername';form.className='player-claim-form';
  const input=document.createElement('input');input.name='username';input.type='text';input.required=true;input.minLength=3;input.maxLength=20;input.autocomplete='nickname';input.placeholder=words('usernamePlaceholder');
  const button=document.createElement('button');button.type='submit';button.className='primary-cta';button.textContent=words('claimUsername');
  form.append(input,button);
  form.onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;button.disabled=true;
   const fresh=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('');
   try{const res=await fetch(root()+'/api/register',{method:'POST',mode:'cors',headers:{'Content-Type':'application/json',Authorization:'Bearer '+fresh},body:JSON.stringify({username:input.value.trim()})});
    const data=await res.json();if(!res.ok)throw new Error(data.error||words('leaderboardUnavailable'));
    localStorage.setItem(tokenKey,fresh);profile=data.profile;node('leaderboardStatus').textContent=words('profileCreated');describeProfile();await loadRanks();
   }catch(err){node('leaderboardStatus').textContent=err.message}
   finally{busy=false;button.disabled=false}
  };
  el.append(info,form);return;
 }
 const p=document.createElement('p');p.className='player-identity';p.textContent=flag(profile.country)+' '+profile.username+' · '+countryLabel(profile.country)+(profile.region?' / '+regionLabel(profile.region):'');
 const note=document.createElement('p');note.className='muted';note.textContent=words('oneUsernameNote');el.append(p,note);
}
async function restoreProfile(){
 if(!root()){describeProfile();return}
 if(token()){try{profile=(await api('/api/profile')).profile}catch(e){profile=null;if(e.message!=='Profile not found')node('leaderboardStatus').textContent=e.message;}}
 describeProfile();
}
async function loadRanks(){
 if(!root()){node('leaderboardStatus').textContent=words('leaderboardNotConnected');return}
 const scope=node('rankingScope').value,mode=node('rankingLength').value,table=node('rankingRows');
 table.replaceChildren();node('leaderboardStatus').textContent=words('loadingLeaderboard');
 if(scope!=='global'&&!profile){node('leaderboardStatus').textContent=words('chooseUsernameFirst');return}
 try{
  const result=await api('/api/leaderboard?scope='+encodeURIComponent(scope)+'&mode='+encodeURIComponent(mode));
  node('leaderboardStatus').textContent=result.players.length?words('leaderboardBeta'):words('noLeaderboardScores');
  for(const player of result.players){const tr=document.createElement('tr');
   for(const value of [String(player.rank),flag(player.country)+' '+player.username,player.score+' / '+player.rounds*5,String(player.accuracy)+'%']){
    const td=document.createElement('td');td.textContent=value;tr.append(td)
   }table.append(tr);
  }
 }catch(e){node('leaderboardStatus').textContent=e.message}
}
async function submit(session){
 if(!root()||!profile||!session?.completed||!session.leaderboardSessionId||session.leaderboardSent)return;
 const summary=BallKnowledgeSession.summary(session);
 
 // Only completed, eligible quizzes can affect the leaderboard.
 const mode = session.leaderboardMode || 'short';

 const eligible =
   (mode === 'short' && summary.total === 5) ||
   (mode === 'medium' && summary.total === 10) ||
   (mode === 'long' && summary.total >= 20);

 if (!eligible) {
   console.info(
     'Ball Knowledge: Quiz does not meet leaderboard requirements.'
   );
   return;
 }

 try{
  await api('/api/scores',{method:'POST',body:{sessionId:session.leaderboardSessionId,mode:session.leaderboardMode||'short',score:summary.score,total:summary.total,correct:summary.correct}});
  session.leaderboardSent=true;node('leaderboardStatus').textContent=words('scoreSaved');if(currentView==='leaderboard')await loadRanks();
 }catch(e){node('leaderboardStatus').textContent=e.message}
}
function localize(){
 for(const [id,key] of [['leaderboardTitle','leaderboardTitle'],['playerTitle','playerTitle'],['rankingScopeLabel','rankingScope'],['rankingLengthLabel','quizLength'],['rankingCaption','leaderboardBeta'],['navLeaderboard','navLeaderboard']]){
  const n=node(id);if(n)n.textContent=words(key)
 }
 for(const [id,options] of [['rankingScope',[['global','rankingGlobal'],['country','rankingCountry'],['region','rankingRegion']]],['rankingLength',[['short','lengthShort'],['medium','lengthMedium'],['long','lengthLong']]]]){
  const select=node(id);if(!select)continue;const previous=select.value;select.replaceChildren();
  for(const [value,key] of options){const opt=document.createElement('option');opt.value=value;opt.textContent=words(key);select.append(opt)}
  if(options.some(([value])=>value===previous))select.value=previous;
 }
 describeProfile();
}
function init(){
 if(!node('leaderboardView'))return;
 node('rankingScope').onchange=loadRanks;
 node('rankingLength').onchange=loadRanks;
 localize();restoreProfile().then(loadRanks);
}
window.BallKnowledgeLeaderboard={init,submit,loadRanks,localize,refresh(){localize();loadRanks()}};
document.addEventListener('DOMContentLoaded',init);
})();
