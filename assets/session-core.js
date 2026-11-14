/* Ball Knowledge finite quiz sessions. Pure rules shared by the browser and Node tests. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.BallKnowledgeSession=api;
})(globalThis,function(){
 'use strict';
 const normalize=s=>String(s||'').toLowerCase().replace(/ı/g,'i').replace(/ß/g,'ss').replace(/æ/g,'ae').replace(/ø/g,'o').replace(/ł/g,'l').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 function uniqueClubs(clubs){
  const ids=new Set(),names=new Set();const clean=[];
  for(const club of clubs){
   if(!club||!club.id||!club.name||!club.league_id)continue;
   const nameKey=club.league_id+'|'+normalize(club.name);
   if(ids.has(club.id)||names.has(nameKey))continue;
   ids.add(club.id);names.add(nameKey);clean.push(club);
  }
  return clean;
 }
 function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
 function shuffle(items,random=Math.random){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
 function seededShuffle(items,seed){let state=seed>>>0;return shuffle(items,()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296})}
 function createSession(clubs,{daily=false,date='',random=Math.random}={}){
  const unique=uniqueClubs(clubs);
  const ordered= daily ? seededShuffle([...unique].sort((a,b)=>a.id.localeCompare(b.id)),hash(date+'|'+unique.map(t=>t.id).sort().join('|'))) : shuffle(unique,random);
  return {order:ordered,results:[],daily:Boolean(daily),date:String(date),completed:false};
 }
 function currentClub(session){return session&&!session.completed?session.order[session.results.length]||null:null}
 function recordRound(session,team,{won=false,wrongCount=0}={}){
  if(!session||session.completed)throw Error('The quiz session is already complete.');
  const answer=currentClub(session);
  if(!answer||answer.id!==team?.id)throw Error('Round answer does not match the current club.');
  if(!Number.isInteger(wrongCount)||wrongCount<0||wrongCount>5||(won&&wrongCount>4)||(!won&&wrongCount!==5))throw Error('Invalid guess count.');
  const result={id:answer.id,name:answer.name,won:Boolean(won),attempts:won?wrongCount+1:5,points:won?5-wrongCount:0};
  session.results.push(result);
  if(session.results.length===session.order.length)session.completed=true;
  return result;
 }
 function summary(session){
  if(!session)return {total:0,played:0,correct:0,missed:0,score:0,maxScore:0,percentage:0,bestStreak:0};
  const total=session.order.length,played=session.results.length;
  const correct=session.results.filter(x=>x.won).length;
  const score=session.results.reduce((sum,x)=>sum+x.points,0);
  let streak=0,bestStreak=0;
  for(const result of session.results){streak=result.won?streak+1:0;bestStreak=Math.max(bestStreak,streak)}
  return {total,played,correct,missed:played-correct,score,maxScore:total*5,percentage:total?Math.round(score/(total*5)*100):0,bestStreak};
 }
 return {normalize,uniqueClubs,hash,shuffle,seededShuffle,createSession,currentClub,recordRound,summary};
});
