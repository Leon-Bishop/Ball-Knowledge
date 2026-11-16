/* Original pixel football avatars for Ball Knowledge.
   Stable pseudo-random selection by normalized username, no extra account data.
   All registered users, including pre-existing ones, are assigned automatically. */
(function(){
'use strict';
const COLUMNS=8, ROWS=6, TOTAL=COLUMNS*ROWS;
const NEW_ATLAS='./assets/football-avatars-direct.png';
const LEGACY_TOTAL=40;
let newAtlasReady=false;
const roster=new Set();
const atlas=new Image();
atlas.onload=()=>{
 newAtlasReady=true;
 for(const element of roster){
  if(element.isConnected&&element.dataset.avatarUsername)apply(element,element.dataset.avatarUsername);
 }
};
atlas.onerror=()=>{newAtlasReady=false};
atlas.src=NEW_ATLAS;
function avatarIndex(username){
 const s=String(username||'').normalize('NFC').toLocaleLowerCase('und');
 let hash=2166136261;
 for(const ch of s){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619)}
 return (hash>>>0)%TOTAL;
}
function apply(element,username){
 if(!element)return;
 roster.add(element);
 const name=String(username||'').trim();
 if(!name){
  element.classList.remove('pixel-avatar');
  element.style.removeProperty('background-position');
  element.style.removeProperty('background-image');
  element.style.removeProperty('background-size');
  element.removeAttribute('data-avatar');
  element.removeAttribute('data-avatar-username');
  return;
 }
 element.dataset.avatarUsername=name;
 const original=avatarIndex(name);
 const i=newAtlasReady?original:original%LEGACY_TOTAL;
 const rows=newAtlasReady?ROWS:5;
 const c=i%COLUMNS,r=Math.floor(i/COLUMNS);
 element.classList.add('pixel-avatar');
 element.dataset.avatar=String(original);
 element.style.backgroundImage=newAtlasReady?"url('"+NEW_ATLAS+"')":"url('./assets/football-avatars.svg')";
 element.style.backgroundSize='800% '+(rows*100)+'%';
 element.style.backgroundPosition=(c*100/(COLUMNS-1))+'% '+(r*100/(rows-1))+'%';
 element.textContent='';
 element.setAttribute('aria-hidden','true');
}

window.BKAvatars=Object.freeze({index:avatarIndex,apply,count:TOTAL});
})();