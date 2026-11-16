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
const AVATAR_ORDER=Object.freeze([0,4,2,14,1,33,6,7,8,9,10,11,12,13,3,15,16,17,18,19,32,21,22,23,24,25,26,27,28,29,30,31,20,5,34,35,36,37,38,39,40,41,42,43,44,45,46,47]);
function avatarIndex(username){
 const s=String(username||'').normalize('NFC').toLocaleLowerCase('und');
 let hash=2166136261;
 for(const ch of s){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619)}
 // Editorially balanced portrait order: spread hair colour, skin tones and
 // styles rather than clustering similar portraits in the leaderboard.
 // This is a stable permutation of the same 48 original atlas portraits.
 const slot=(hash>>>0)%TOTAL;
 return AVATAR_ORDER[slot];
}
function apply(element,username){
 if(!element)return;
 roster.add(element);
 const name=String(username||'').trim();
 if(!name){
  element.classList.remove('pixel-avatar');
  element.replaceChildren();
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
 // An inset art layer keeps the complete source portrait inside its frame.
 // Previously the full-bleed atlas extended to the border, cutting off chins
 // and making the faces appear too low in leaderboard tiles.
 let art=element.querySelector('.pixel-avatar-art');
 if(!art){art=document.createElement('span');art.className='pixel-avatar-art';element.replaceChildren(art)}
 art.style.backgroundImage=newAtlasReady?"url('"+NEW_ATLAS+"')":"url('./assets/football-avatars.svg')";
 art.style.backgroundSize='800% '+(rows*100)+'%';
 art.style.backgroundPosition=(c*100/(COLUMNS-1))+'% '+(r*100/(rows-1))+'%';
 element.setAttribute('aria-hidden','true');
}

window.BKAvatars=Object.freeze({index:avatarIndex,apply,count:TOTAL});
})();