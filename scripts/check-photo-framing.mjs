// Full-face layout regression for EVERY player headshot, in ALL loaded stylesheets.
// A downstream theme must never override the base crop with a 235% zoom.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const links=[...html.matchAll(/<link[^>]+href=["']\.\/assets\/([^"'?#]+\.css)(?:\?[^"']*)?["']/g)].map(x=>x[1]);
assert(links.includes('styles.css')&&links.includes('broadcast.css'),
  'Both base and broadcast CSS must be included in the headshot regression');
const rules=[];
for(const name of links){
 const css=fs.readFileSync(path.join(root,'assets',name),'utf8');
 // CSS rules are simple declaration blocks; this also scans nested media rules.
 for(const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  if(!match[1].includes('.player-photo-clue'))continue;
  const declarations=Object.fromEntries(match[2].split(';').map(s=>s.trim())
   .filter(Boolean).map(s=>{const pos=s.indexOf(':');return [s.slice(0,pos).trim(),s.slice(pos+1).trim().replace(/\s*!important$/,'')]}));
  rules.push({file:name,selector:match[1].trim(),declarations});
 }
}
assert(rules.some(x=>x.file==='styles.css'),'No base headshot styling');
assert(rules.some(x=>x.file==='broadcast.css'),'No broadcast headshot styling');
for(const {file,selector,declarations:d} of rules){
 const context=file+': '+selector;
 assert.equal(d['width'],'100%',context+' must fill width without overzoom');
 assert.equal(d['height'],'100%',context+' must fit the whole portrait vertically');
 assert.equal(d['max-width'],'100%',context+' must not overflow horizontally');
 assert.equal(d['max-height'],'100%',context+' must not crop off the chin');
 assert.equal(d['object-fit'],'contain',context+' must preserve the complete photo');
 assert(/^center(?: center)?$/.test(d['object-position']),context+' must be centered');
 assert.equal(d['transform'],'none',context+' must not scale the photo');
 assert.equal(d['position'],'static',context+' must not offset the photo');
 assert(!(['top','left','bottom','right'].some(k=>d[k]&&d[k]!=='auto')),
  context+' must not shift the image inside the card');
}
const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
assert(app.includes("image.className='player-photo-clue'"),'Images must use shared framing styles');
assert(!/image\.style\.(?:height|width|transform|objectFit|objectPosition|top|left)/.test(app),
 'Do not override player headshot framing inline');
console.log('✓ Every player portrait uses full-frame, centered, unzoomed images in all '+links.length+' stylesheets ('+rules.length+' matching CSS rules).');
