
/* Optional online scoreboard for Ball Knowledge. No login/password or precise location. */
(()=>{
'use strict';

const root=()=>String(window.BK_LEADERBOARD_API||'').trim().replace(/\/$/,'');
const node=id=>document.getElementById(id);
const words=(key,args={})=>{try{return tr(key,args)}catch{return key}};
const tokenKey='bk-anonymous-player-token';
/* Older Workers reported Fenerbahçe for everybody, even if they had
   never chosen a crest. Treat those legacy values as unselected. */
const selectedClub=p=>{
 if(!p)return null;
 if(p.avatarSelected===false)return null;
 if(p.avatarSelected===undefined&&p.avatarTeamId==='turkey-super-lig:6')return null;
 return p.avatarTeamId||null;
};


let profile=null,busy=false,profileLoading=true,profileLoadError='',nameDraft='';

const token=()=>localStorage.getItem(tokenKey)||'';

// EU members display the EU flag; other countries keep their national flags.
const EU_COUNTRIES=new Set([
 'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE',
 'GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT',
 'RO','SK','SI','ES','SE'
]);

const flag=country=>{
 if(!/^[A-Z]{2}$/.test(country)||country==='ZZ')return '🌍';
 if(EU_COUNTRIES.has(country))return '🇪🇺';
 return String.fromCodePoint(
  ...[...country].map(c=>c.charCodeAt(0)+127397)
 );
};

const regionLabel=code=>code||'—';

const countryLabel=country=>{
 try{
  return new Intl.DisplayNames([lang],{type:'region'}).of(country);
 }catch{
  return country;
 }
};

async function api(path,{method='GET',body,withIdentity=true}={}){
 const headers={'Content-Type':'application/json'};

 if(withIdentity&&token()){
  headers.Authorization='Bearer '+token();
 }

 const r=await fetch(root()+path,{
  method,
  headers,
  body:body?JSON.stringify(body):undefined,
  mode:'cors',
  cache:'no-store'
 });

 const data=await r.json().catch(()=>({}));

 if(!r.ok){
  throw new Error(data.error||words('leaderboardUnavailable'));
 }

 return data;
}

function registrationMessage(error){
 if(error==='Username already taken')return words('homePlayerTaken');
 if(error==='Too many registration attempts. Try later.')return words('homePlayerRateLimit');
 if(error==='This browser already has a username')return words('homePlayerExisting');
 return error;
}

function createClaimForm(context){
 const form=document.createElement('form');
 form.id=context==='home'?'homeClaimUsername':'claimUsername';
 form.className='player-claim-form';

 const label=document.createElement('label');
 label.className='player-name-label';
 label.htmlFor=context==='home'?'homeUsername':'leaderboardUsername';
 label.textContent=words('homePlayerInputLabel');

 const controls=document.createElement('div');
 controls.className='player-claim-controls';

 const input=document.createElement('input');
 input.id=label.htmlFor;
 input.name='username';
 input.type='text';
 input.required=true;
 input.minLength=3;
 input.maxLength=20;
 input.autocomplete='nickname';
 input.spellcheck=false;
 input.setAttribute('autocapitalize','off');
 input.placeholder=words('usernamePlaceholder');
 input.value=nameDraft;

 const button=document.createElement('button');
 button.type='submit';
 button.className='primary-cta';
 button.textContent=words('claimUsername');

 controls.append(input,button);

 const meta=document.createElement('div');
 meta.className='player-name-meta';

 const feedback=document.createElement('span');
 feedback.className='player-name-feedback';
 feedback.id=context+'UsernameFeedback';
 feedback.setAttribute('role','status');
 feedback.setAttribute('aria-live','polite');

 const count=document.createElement('span');
 count.className='player-name-count';
 count.setAttribute('aria-hidden','true');
 input.setAttribute('aria-describedby',feedback.id);
 meta.append(feedback,count);

 const preview=document.createElement('div');
 preview.className='player-name-preview';
 const previewIcon=document.createElement('span');
 previewIcon.textContent='⚽';
 previewIcon.setAttribute('aria-hidden','true');
 const previewName=document.createElement('span');
 preview.append(previewIcon,previewName);
 const badgeChoice=document.createElement('div');
 badgeChoice.className='registration-club-choice';
 const chooseBadge=window.BKAvatars?.pendingButton(()=>{
  window.BKAvatars?.pendingBadge(previewIcon);
  validate();
 });
 if(chooseBadge)badgeChoice.append(chooseBadge);
 const badgeHint=document.createElement('span');
 badgeHint.className='registration-club-hint';
 badgeHint.textContent=document.documentElement.lang==='tr'?'Kayıt olmadan önce takım armanı seç.':'Choose your club badge before registering.';
 badgeChoice.append(badgeHint);

 const validName=name=>{
  const length=[...name].length;
  return length>=3&&length<=20&&/^[\p{L}\p{N}_]+$/u.test(name);
 };

 const validate=()=>{
  const name=input.value.trim();
  const length=[...name].length;
  const valid=validName(name);
  const touched=input.value.length>0;
  const key=!touched?'homePlayerRules':
   length<3?'homePlayerTooShort':
   length>20?'homePlayerTooLong':
   !/^[\p{L}\p{N}_]+$/u.test(name)?'homePlayerBadCharacters':
   'homePlayerLooksGood';

  feedback.textContent=words(key);
  feedback.dataset.state=!touched?'neutral':valid?'valid':'error';
  input.setAttribute('aria-invalid',String(touched&&!valid));
  count.textContent=length+'/20';
  previewName.textContent=name||words('homePlayerPreviewEmpty');
  window.BKAvatars?.pendingBadge(previewIcon);
  const selected=window.BKAvatars?.getPending();
  badgeHint.textContent=selected?(document.documentElement.lang==='tr'?'Takım arman seçildi.':'Club badge selected.'):(document.documentElement.lang==='tr'?'Kayıt olmadan önce takım armanı seç.':'Choose your club badge before registering.');
  button.disabled=busy||!valid||!selected;
 };

 input.addEventListener('input',()=>{
  nameDraft=input.value;
  validate();
 });

 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const name=input.value.trim();
  const clubId=window.BKAvatars?.getPending();
  if(busy||!validName(name)||!clubId)return;

  busy=true;
  button.disabled=true;
  input.disabled=true;
  feedback.textContent=words('homePlayerCreating');
  feedback.dataset.state='neutral';

  try{
   // Check browser storage before creating a server-side identity.
   const storageCheck='bk-identity-storage-check';
   try{
    localStorage.setItem(storageCheck,'1');
    localStorage.removeItem(storageCheck);
   }catch{
    throw new Error(words('homePlayerStorageUnavailable'));
   }

   const fresh=Array.from(
    crypto.getRandomValues(new Uint8Array(32))
   ).map(x=>x.toString(16).padStart(2,'0')).join('');

   const res=await fetch(root()+'/api/register',{
    method:'POST',
    mode:'cors',
    headers:{
     'Content-Type':'application/json',
     Authorization:'Bearer '+fresh
    },
    body:JSON.stringify({username:name,clubId})
   });

   const data=await res.json().catch(()=>({}));
   if(!res.ok){
    throw new Error(registrationMessage(
     data.error||words('leaderboardUnavailable')
    ));
   }

   localStorage.setItem(tokenKey,fresh);
   const assignedClub=window.BKAvatars?.commitPending(name)||clubId;
   profile=data.profile;
   if(profile)profile.avatarTeamId=data.profile.avatarTeamId||assignedClub;
   // Deploying the avatar API on Cloudflare syncs this choice to other devices.
   // Registration still works with the previous Worker version.
   if(assignedClub){
    api('/api/avatar',{method:'POST',body:{clubId:assignedClub}}).catch(()=>{});
   }
   profileLoadError='';
   nameDraft='';
   node('leaderboardStatus').textContent=words('profileCreated');
   renderProfiles();
   await loadRanks();
  }catch(error){
   feedback.textContent=error.message||words('leaderboardUnavailable');
   feedback.dataset.state='error';
   input.setAttribute('aria-invalid','true');
   node('leaderboardStatus').textContent=feedback.textContent;
  }finally{
   busy=false;
   input.disabled=false;
   if(form.isConnected){
    button.disabled=!validName(input.value.trim())||!window.BKAvatars?.getPending();
   }
  }
 });

 form.append(label,controls,badgeChoice,meta,preview);
 validate();
 return form;
}

function retryProfileButton(){
 const button=document.createElement('button');
 button.type='button';
 button.className='outline-button player-profile-retry';
 button.textContent=words('homePlayerRetry');
 button.onclick=restoreProfile;
 return button;
}

function describeProfile(){
 const el=node('playerProfile');
 if(!el)return;
 el.replaceChildren();

 const p=document.createElement('p');
 p.className='muted';

 if(!root()){
  p.textContent=words('leaderboardNotConnected');
  el.append(p);
  return;
 }

 if(profileLoading){
  p.textContent=words('homePlayerLoading');
  el.append(p);
  return;
 }

 if(profileLoadError){
  p.textContent=words('homePlayerLoadError',{reason:profileLoadError});
  el.append(p,retryProfileButton());
  return;
 }

 if(!profile){
  p.textContent=words('playerNameHelp');
  el.append(p,createClaimForm('leaderboard'));
  return;
 }

 const identity=document.createElement('p');
 identity.className='player-identity';
 const avatarEl=document.createElement('span');
 avatarEl.className='player-profile-avatar';
 window.BKAvatars?.apply(avatarEl,profile.username,selectedClub(profile));
 identity.textContent=
  flag(profile.country)+' '+profile.username+' · '+
  countryLabel(profile.country)+
  (profile.region?' / '+regionLabel(profile.region):'');
 identity.prepend(avatarEl);
 p.textContent=words('oneUsernameNote');
 el.append(identity,p);
 const changeBadge=window.BKAvatars?.changeButton();
 if(changeBadge)el.append(changeBadge);
}

function describeHomeProfile(){
 const card=node('homePlayerCard');
 const content=node('homePlayerContent');
 const title=node('homePlayerTitle');
 const avatar=node('homePlayerAvatar');
 const kicker=node('homePlayerKicker');
 const tag=node('homePlayerTag');
 if(!card||!content||!title||!avatar||!kicker||!tag)return;

 content.replaceChildren();
 kicker.textContent=words('homePlayerKicker');
 card.dataset.state=profile?'active':'new';
 avatar.textContent=profile?flag(profile.country):'⚽';
 window.BKAvatars?.apply(avatar,profile?.username||'',selectedClub(profile));

 const description=document.createElement('p');
 description.className='home-player-description';

 if(!root()){
  title.textContent=words('homePlayerTitle');
  tag.textContent=words('homePlayerOptional');
  description.textContent=words('leaderboardNotConnected');
  content.append(description);
  return;
 }

 if(profileLoading){
  title.textContent=words('homePlayerLoading');
  tag.textContent=words('homePlayerOptional');
  return;
 }

 if(profileLoadError){
  title.textContent=words('homePlayerLoadErrorTitle');
  tag.textContent=words('homePlayerOptional');
  description.textContent=words('homePlayerLoadError',{reason:profileLoadError});
  content.append(description,retryProfileButton());
  return;
 }

 if(!profile){
  title.textContent=words('homePlayerTitle');
  tag.textContent=words('homePlayerOptional');
  description.textContent=words('homePlayerHelp');
  content.append(description,createClaimForm('home'));
  return;
 }

 title.textContent=words('homePlayerWelcome',{name:profile.username});
 tag.textContent=words('homePlayerReady');
 description.textContent=words('homePlayerLinked');
 const actions=document.createElement('div');
 actions.className='home-player-actions';

 const country=document.createElement('span');
 country.className='home-player-country';
 country.textContent=flag(profile.country)+' '+countryLabel(profile.country);

 const view=document.createElement('button');
 view.type='button';
 view.className='outline-button';
 view.textContent=words('homePlayerViewRanks');
 view.onclick=()=>node('navLeaderboard')?.click();
 actions.append(country,view);
 const changeBadge=window.BKAvatars?.changeButton();
 if(changeBadge)actions.append(changeBadge);

 const note=document.createElement('p');
 note.className='player-profile-help';
 note.textContent=words('homePlayerBrowserNote');
 content.append(description,actions,note);
}

function renderProfiles(){
 window.BKAvatars?.setProfile(profile?.username||'',selectedClub(profile));
 describeProfile();
 describeHomeProfile();
 window.BKPlayerCard?.setProfile(profile && profile.username ? profile.username : '');
}

async function restoreProfile(){
 profileLoading=true;
 profileLoadError='';
 renderProfiles();

 if(root()&&token()){
  try{
   profile=(await api('/api/profile')).profile;
  }catch(error){
   profile=null;
   if(error.message==='Profile not found'){
    localStorage.removeItem(tokenKey);
   }else{
    profileLoadError=error.message;
    node('leaderboardStatus').textContent=error.message;
   }
  }
 }

 profileLoading=false;
 renderProfiles();
}

async function loadRanks(){
 if(!root()){
  node('leaderboardStatus').textContent=
   words('leaderboardNotConnected');
  return;
 }

 const scope=node('rankingScope').value;
 const mode=node('rankingLength').value;
 const table=node('rankingRows');

 table.replaceChildren();

 node('leaderboardStatus').textContent=
  words('loadingLeaderboard');

 if(scope!=='global'&&!profile){
  node('leaderboardStatus').textContent=
   words('chooseUsernameFirst');
  return;
 }

 try{
  const result=await api(
   '/api/leaderboard?scope='+
   encodeURIComponent(scope)+
   '&mode='+
   encodeURIComponent(mode)
  );

  node('leaderboardStatus').textContent=
   result.players.length
    ?words('leaderboardBeta')
    :words('noLeaderboardScores');

  for(const player of result.players){
   const tr=document.createElement('tr');

   const rankCell=document.createElement('td');
   rankCell.textContent=String(player.rank);
   const playerCell=document.createElement('td');
   const avatarEl=document.createElement('span');
   avatarEl.className='leaderboard-avatar';
   window.BKAvatars?.apply(avatarEl,player.username,selectedClub(player));
   const label=document.createElement('span');
   label.textContent=flag(player.country)+' '+player.username;
   playerCell.append(avatarEl,label);
   const scoreCell=document.createElement('td');
   scoreCell.textContent=Number(player.bkPoints||0).toLocaleString()+' BK';
   tr.append(rankCell,playerCell,scoreCell);

   table.append(tr);
  }

 }catch(e){
  node('leaderboardStatus').textContent=e.message;
 }
}

async function loadHomeRanks(){
 const list=node('homeRankRows');
 if(!list||!root())return;
 list.replaceChildren();
 const show=message=>{
   const item=document.createElement('li');item.className='broadcast-rank-placeholder';
   item.textContent=message;list.replaceChildren(item);
 };
 show('Loading rankings…');
 try{
   const data=await api('/api/leaderboard?scope=global&mode=short');
   if(!Array.isArray(data.players)||!data.players.length){show('No scores yet — be the first.');return;}
   list.replaceChildren();
   for(const player of data.players.slice(0,5)){
     const row=document.createElement('li');row.className='broadcast-rank-row';
     const rank=document.createElement('span');rank.className='broadcast-rank-number';rank.textContent=String(player.rank);
     const name=document.createElement('span');name.className='broadcast-rank-name';
     const avatarEl=document.createElement('span');avatarEl.className='leaderboard-avatar';window.BKAvatars?.apply(avatarEl,player.username,selectedClub(player));
     const label=document.createElement('span');label.textContent=String(player.username);
     name.append(avatarEl,label);
     const score=document.createElement('strong');score.className='broadcast-rank-score';score.textContent=Number(player.bkPoints||0).toLocaleString()+' BK';
     row.append(rank,name,score);list.append(row);
   }
 }catch(error){show('Rankings temporarily unavailable.');}
}

/*
 * Submit a completed quiz to the leaderboard.
 *
 * Short: exactly 5 clubs.
 * Medium: exactly 10 clubs.
 * Full: every club in the selected league pool.
 *
 * BK Points and league IDs are included in the request.
 * Server-side validation will be added before activation.
 */
function setSaveState(session, key, reason = '', retryable = false) {
 session.leaderboardSaveKey = key;
 session.leaderboardSaveReason = reason;
 session.leaderboardSaveRetryable = retryable;

 const status = node('bkSaveStatus');
 if(status && status.dataset.sessionId === session.leaderboardSessionId){
  status.textContent = words(key, {reason});
  const retry = node('bkRetrySave');
  if(retry){
   retry.hidden = !retryable;
   retry.classList.toggle('hidden', !retryable);
  }
 }
}

async function submit(session){
 if(!session?.completed || session.leaderboardSent || session.leaderboardSaving){
  return;
 }

 if(!root()){
  setSaveState(session, 'bkScoreNoConnection');
  return;
 }

 if(!profile){
  setSaveState(session, 'bkScoreNeedUsername', '', true);
  return;
 }

 if(!session.leaderboardSessionId){
  setSaveState(session, 'bkScoreFailed', 'Missing session ID');
  return;
 }

 const summary = BallKnowledgeSession.summary(session);
 const mode = session.leaderboardMode || 'short';

 const eligible =
  (mode === 'short' && summary.total === 5) ||
  (mode === 'medium' && summary.total === 10) ||
  (
   mode === 'long' &&
   Array.isArray(session.referencePool) &&
   session.referencePool.length > 0 &&
   summary.total === session.referencePool.length
  );

 if(!eligible){
  setSaveState(session, 'bkScoreNotEligible');
  return;
 }

 session.leaderboardSaving = true;
 setSaveState(session, 'bkScoreSaving');

 try{
  const bkPoints = window.BKPoints.calculateSession(session);

  await api('/api/scores', {
   method: 'POST',
   body: {
    sessionId: session.leaderboardSessionId,
    mode,
    score: summary.score,
    total: summary.total,
    correct: summary.correct,
    bkPoints,
    leagueIds: session.leagueIds || [],
    rounds: session.results.map(result => ({
     id: result.id,
     attempt: result.won ? result.attempts : null
    }))
   }
  });

  session.leaderboardSent = true;
  setSaveState(session, 'bkScoreSaved');
  node('leaderboardStatus').textContent = words('scoreSaved');

  if(currentView === 'leaderboard'){
   await loadRanks();
   await loadHomeRanks();
  }
 }catch(e){
  setSaveState(session, 'bkScoreFailed', e.message, true);
  node('leaderboardStatus').textContent = e.message;
 }finally{
  session.leaderboardSaving = false;
 }
}

function localize(){
 for(const [id,key] of [
  ['leaderboardTitle','leaderboardTitle'],
  ['playerTitle','playerTitle'],
  ['rankingScopeLabel','rankingScope'],
  ['rankingLengthLabel','quizLength'],
  ['rankingCaption','leaderboardBeta'],
  ['navLeaderboard','navLeaderboard']
 ]){
  const n=node(id);
  if(n)n.textContent=words(key);
 }

 for(const [id,options] of [
  [
   'rankingScope',
   [
    ['global','rankingGlobal'],
    ['country','rankingCountry'],
    ['region','rankingRegion']
   ]
  ],
  [
   'rankingLength',
   [
    ['short','lengthShort'],
    ['medium','lengthMedium'],
    ['long','lengthLong']
   ]
  ]
 ]){
  const select=node(id);
  if(!select)continue;

  const previous=select.value;
  select.replaceChildren();

  for(const [value,key] of options){
   const opt=document.createElement('option');
   opt.value=value;
   opt.textContent=words(key);
   select.append(opt);
  }

  if(options.some(([value])=>value===previous)){
   select.value=previous;
  }
 }

 renderProfiles();
}

function init(){
 if(!node('leaderboardView'))return;

 node('rankingScope').onchange=loadRanks;
 node('rankingLength').onchange=loadRanks;
 window.BKAvatars?.setSaveHandler(async clubId=>{
  const data=await api('/api/avatar',{method:'POST',body:{clubId}});
  if(profile)profile.avatarTeamId=data.avatarTeamId||clubId;
  renderProfiles();
  await Promise.all([loadRanks(),loadHomeRanks()]);
  return data;
 });
 localize();

 restoreProfile().then(()=>{loadRanks();loadHomeRanks()});
}

window.BallKnowledgeLeaderboard={
 init,
 submit,
 loadRanks,
 localize,
 refresh(){
  localize();
  loadRanks();
 }
};

document.addEventListener('DOMContentLoaded',init);

})();
