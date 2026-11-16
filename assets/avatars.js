/* Original pixel football avatars for Ball Knowledge.
   Stable pseudo-random selection by normalized username, no extra account data.
   All registered users, including pre-existing ones, are assigned automatically. */
(function(){
'use strict';
const COLUMNS=8, ROWS=5, TOTAL=COLUMNS*ROWS;
function avatarIndex(username){
 const s=String(username||'').normalize('NFC').toLocaleLowerCase('und');
 let hash=2166136261;
 for(const ch of s){hash^=ch.codePointAt(0);hash=Math.imul(hash,16777619)}
 return (hash>>>0)%TOTAL;
}
function apply(element,username){
 if(!element)return;
 const name=String(username||'').trim();
 if(!name){
  element.classList.remove('pixel-avatar');
  element.style.removeProperty('background-position');
  element.removeAttribute('data-avatar');
  return;
 }
 const i=avatarIndex(name),c=i%COLUMNS,r=Math.floor(i/COLUMNS);
 element.classList.add('pixel-avatar');
 element.dataset.avatar=String(i);
 element.style.backgroundPosition=(c*100/(COLUMNS-1))+'% '+(r*100/(ROWS-1))+'%';
 element.textContent='';
 element.setAttribute('aria-hidden','true');
}
window.BKAvatars=Object.freeze({index:avatarIndex,apply,count:TOTAL});
})();