/* Original pixel football avatars for Ball Knowledge.
   Stable pseudo-random selection by normalized username, no extra account data.
   All registered users, including pre-existing ones, are assigned automatically. */
(function(){
'use strict';
const COLUMNS=8, ROWS=6, TOTAL=COLUMNS*ROWS;
const NEW_ATLAS='./assets/football-avatars-direct.png?v=centered-2';
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

// Per-portrait silhouette contours extracted from the original 48 images.
// Coordinates are packed as [pointCount, x1,y1, ...] for each 128px tile.
// They crop the image itself, rather than placing an ellipse/box behind it.
const SILHOUETTES="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";
const SILHOUETTE_POINTS=(()=>{
 const data=atob(SILHOUETTES),result=[];
 let cursor=0;
 for(let i=0;i<TOTAL;i++){
  const count=data.charCodeAt(cursor++),points=[];
  for(let p=0;p<count;p++){
   const x=data.charCodeAt(cursor++),y=data.charCodeAt(cursor++);
   points.push((x/128*100).toFixed(2)+'% '+(y/128*100).toFixed(2)+'%');
  }
  result.push('polygon('+points.join(',')+')');
 }
 return result;
})();

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
 // Every profile uses a uniform frameless 1:1 head-and-shoulders sprite.
 let art=element.querySelector('.pixel-avatar-art');
 if(!art){art=document.createElement('span');art.className='pixel-avatar-art';element.replaceChildren(art)}
 art.style.backgroundImage=newAtlasReady?"url('"+NEW_ATLAS+"')":"url('./assets/football-avatars.svg')";
 art.style.backgroundSize='800% '+(rows*100)+'%';
 art.style.backgroundPosition=(c*100/(COLUMNS-1))+'% '+(r*100/(rows-1))+'%';
 art.style.clipPath=newAtlasReady?SILHOUETTE_POINTS[i]:'none';
 element.setAttribute('aria-hidden','true');
}

window.BKAvatars=Object.freeze({index:avatarIndex,apply,count:TOTAL});
})();