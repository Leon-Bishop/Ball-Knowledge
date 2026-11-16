/* Ball Knowledge avatar portraits.
 * Original art: Marvyra — https://marvyra.itch.io/unique-free-portraits-32x32
 * Used with artist credit; individual 32×32 transparent portraits are preserved.
 * No AI-generated sprites, masks, frames, or filters.
 * Existing and new usernames receive stable pseudo-random portraits.
 */
(function(){
'use strict';
const COLS=8, ROWS=6, TOTAL=48;
const SHEET='./assets/marvyra-portraits-48.png';
const ORDER=Object.freeze([0,4,2,14,1,33,6,7,8,9,10,11,12,13,3,15,16,17,18,19,32,21,22,23,24,25,26,27,28,29,30,31,20,5,34,35,36,37,38,39,40,41,42,43,44,45,46,47]);
function indexFor(username){
 const name=String(username||'').trim().normalize('NFC').toLowerCase();
 let hash=2166136261;
 for(const c of name){hash^=c.codePointAt(0);hash=Math.imul(hash,16777619)}
 return ORDER[(hash>>>0)%TOTAL];
}
function apply(element,username){
 if(!element)return;
 const name=String(username||'').trim();
 if(!name){
  element.classList.remove('pixel-avatar');
  element.removeAttribute('data-avatar');
  element.removeAttribute('data-avatar-username');
  element.replaceChildren();
  return;
 }
 const index=indexFor(name),col=index%COLS,row=Math.floor(index/COLS);
 element.classList.add('pixel-avatar');
 element.dataset.avatar=String(index);
 element.dataset.avatarUsername=name;
 element.setAttribute('aria-hidden','true');
 let art=element.querySelector('.pixel-avatar-art');
 if(!art){art=document.createElement('span');art.className='pixel-avatar-art';element.replaceChildren(art)}
 art.style.backgroundImage="url('"+SHEET+"')";
 art.style.backgroundSize=(COLS*100)+'% '+(ROWS*100)+'%';
 art.style.backgroundPosition=(col*100/(COLS-1))+'% '+(row*100/(ROWS-1))+'%';
}
window.BKAvatars=Object.freeze({apply,index:indexFor,count:TOTAL});
})();