#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';
import Session from '../assets/session-core.js';
const data=JSON.parse(fs.readFileSync(new URL('../teams.enriched.json',import.meta.url),'utf8'));
const i18n=JSON.parse(fs.readFileSync(new URL('../i18n.json',import.meta.url),'utf8'));
const unique=Session.uniqueClubs(data);
assert.equal(data.length,150,'The original club list must stay intact');
assert.equal(unique.length,150,'All 150 clubs should be unique and playable');
const league=unique.filter(t=>t.league_id==='turkey-super-lig');
assert.equal(league.length,18,'Turkish league must have 18 unique clubs');
for(const [limit,expected] of [[5,5],[10,10],[20,18],[Infinity,18]]){
 const sample=Session.createSession(league,{limit,random:()=>.17});
 assert.equal(sample.order.length,expected,'Requested session length should cap at available clubs');
 assert.equal(new Set(sample.order.map(t=>t.id)).size,expected,'No repeated clubs in shortened quiz');
}
const shortA=Session.createSession(league,{limit:5,random:()=>.17});
const shortB=Session.createSession(league,{limit:5,random:()=>.83});
assert.notDeepEqual(shortA.order.map(t=>t.id),shortB.order.map(t=>t.id),'Different shuffles should produce different clubs');
assert(league.every(t=>!Object.hasOwn(t,'difficulty')),'All clubs should be eligible regardless of quiz length');
const single=Session.createSession(league,{random:()=>.17});
assert.equal(single.order.length,18,'One round per club');
assert.equal(new Set(single.order.map(t=>t.id)).size,18,'Club IDs must be unique in session deck');
assert.equal(Session.summary(single).maxScore,90);
for(let i=0;i<18;i++){
 const team=Session.currentClub(single);
 assert(team,`Round ${i+1} must have a club`);
 const result=Session.recordRound(single,team,{won:true,wrongCount:0});
 assert.equal(result.points,5);
 assert.equal(Session.summary(single).played,i+1);
 if(i!==17)assert.equal(single.completed,false,'Must not finish early');
}
assert.equal(single.completed,true,'Must finish exactly at last team');
assert.equal(Session.currentClub(single),null,'No additional rounds');
assert.equal(Session.summary(single).score,90,'Perfect session should score 90');
assert.equal(Session.summary(single).bestStreak,18);
assert.throws(()=>Session.recordRound(single,single.order[0],{won:true,wrongCount:0}),/complete/,'Never refill the deck');
const mixed=unique.filter(x=>['england-premier-league','italy-serie-a','turkey-super-lig'].includes(x.league_id));
assert.equal(mixed.length,58,'The retained 20+20+18-club example should produce 58 rounds');
const combined=Session.createSession(mixed,{random:()=>.34});
assert.equal(combined.order.length,58);
assert.equal(new Set(combined.order.map(t=>t.id)).size,50);
for(let i=0;i<combined.order.length;i++){
 const club=Session.currentClub(combined);
 Session.recordRound(combined,club,{won:i%2===0,wrongCount:i%2===0?2:5});
}
const summary=Session.summary(combined);
assert.deepEqual({total:summary.total,played:summary.played,correct:summary.correct,missed:summary.missed,score:summary.score,maxScore:summary.maxScore},
 {total:58,played:58,correct:29,missed:29,score:87,maxScore:290});
assert.equal(combined.completed,true);
const europe=unique.filter(x=>x.league_id==='england-premier-league');
assert.equal(europe.length,20,'Premier League must include 20 unique clubs');
const duplicate=Session.createSession(data.filter(x=>x.league_id==='england-premier-league'));
assert.equal(duplicate.order.length,20);
const daily1=Session.createSession(mixed,{daily:true,date:'2026-11-14'});
const daily2=Session.createSession([...mixed].reverse(),{daily:true,date:'2026-11-14'});
assert.deepEqual(daily1.order.map(x=>x.id),daily2.order.map(x=>x.id),'Daily order must be fixed for same date/pool');
let dailyChanged=false;
for(const date of ['2026-11-15','2026-11-16','2026-11-17']){
 if(JSON.stringify(Session.createSession(mixed,{daily:true,date}).order.map(x=>x.id))!==JSON.stringify(daily1.order.map(x=>x.id)))dailyChanged=true;
}
assert(dailyChanged,'Different dates should be able to produce new challenges');
for(const [lang,d] of Object.entries(i18n))for(const k of ['startQuizRounds','roundProgress','roundsCompleted','sessionComplete','finalScore','scorePercent','clubsCorrect','clubsMissed','sessionBestStreak','totalRounds','roundResults','playAgain','roundResolved'])assert(d[k]?.trim(),`${lang} missing ${k}`);
const source=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
assert(!source.includes('deck=[]'),'No automatic deck-refill logic in the game');
assert.match(source,/function renderFinalSummary\(\)/);
assert.match(source,/BallKnowledgeSession\.recordRound/);
console.log('✓ Finite session: 18/18 and 58/58 rounds; no repeat answers; scores, daily order, deduplication, translations.');
