#!/usr/bin/env node
/** Regression check: wrong-guess hints must contain relevant information,
 * not repeat countries or single-league context. Executes the exact browser
 * function extracted from assets/app.js with a mocked translation function.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = p => fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('assets/app.js');
const locales=JSON.parse(read('i18n.json'));
const start=html.indexOf('const KIT_COLOUR_EMOJIS=');
const end=html.indexOf('function submit(){',start);
assert(start>=0&&end>start,'Could not locate guess-feedback logic in game source');
const definition=html.slice(start,end);
const normalize = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const a={id:'a',city:'London',league_id:'england-premier-league',country:'England',emojis:['🇬🇧','🔴','⚽']};
const b={id:'b',city:'London',league_id:'england-premier-league',country:'England',emojis:['🔵','⚫','🏆']};
const c={id:'c',city:'Liverpool',league_id:'england-premier-league',country:'England',emojis:['🔴','⚪','⚽']};
const d={id:'d',city:'Birmingham',league_id:'england-premier-league',country:'England',emojis:['🟢','💎','⚽']};
const e={id:'e',city:'Paris',league_id:'france-ligue-1',country:'France',emojis:['🟢','💎','⚽']};
for(const [lang,labels] of Object.entries(locales)){
 for(const k of ['sameCity','sharedColour','sameLeague','newClue','incorrectGuess'])assert(labels[k]?.trim(),`Missing ${lang}:${k}`);
 for(const banned of ['sameCountry','sameContinent','differentContinent','leagueAndCountry'])assert(!Object.hasOwn(labels,banned),`${lang} has stale hint ${banned}`);
 const mk=pool => new Function('pool','session','normalize','tr',definition+'\nreturn guessFeedback;')(pool,null,normalize,k=>labels[k]);
 const single=mk([a,b,c,d]);
 assert.equal(single(a,b,false),labels.sameCity,`${lang} same city`);
 assert.equal(single(a,c,false),labels.sharedColour,`${lang} shared kit colour`);
 assert.equal(single(a,d,false),labels.newClue,`${lang} no redundant league or country`);
 assert.equal(single(a,b,true),labels.incorrectGuess,`${lang} final attempt`);
 assert.equal(mk([a,b,c,d,e])(a,d,false),labels.sameLeague,`${lang} meaningful multiple-league match`);
 assert.equal(mk([a,b,c,d,e])(a,e,false),labels.newClue,`${lang} no match`);
}
assert(!html.includes("tr('sameCountry')")&&!html.includes("tr('sameContinent')"),'Stale country/continent references in game');
console.log('✓ Guess feedback uses city, shared kit color, or multi-league match; no country/continent hints in 6 languages.');
