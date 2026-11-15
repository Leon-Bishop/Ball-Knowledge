import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('assets/app.js'),html=read('index.html'),css=read('assets/styles.css');
const locales=JSON.parse(read('i18n.json'));
new vm.Script(app,{filename:'assets/app.js'});
assert(html.includes('class="league-options-row"'),'Selection controls need a shared row');
assert(html.indexOf('id="filters"')>html.indexOf('class="league-options-row"'),'Quiz length needs to remain in options row');
assert(html.indexOf('id="deselectAllLeagues"')<html.indexOf('class="league-grid"'),'Bulk actions must precede club grid');
assert(html.includes('id="emojiExplanation"'),'Emoji explanation must be accessible');
assert(app.includes("buttons.append(again,change,shareButton)"),'Share must be beside Replay and Choose Leagues');
assert(app.includes("shareButton.onclick=share"),'Share must use existing X/Twitter functionality');
assert(app.includes("$('endActions').classList.add('hidden');renderFinalSummary()"),'No duplicate Share below completed quiz');
assert(app.includes("activeEmojiExplanation=null;finished=false"),'Previous clue state must reset each round');
assert(app.includes("const visible=i<=wrong.length||finished"),'Only revealed emojis can be interactive');
assert(app.includes("item.title=hint")&&app.includes("item.onclick=()=>"),'Hover and touch controls required');
assert(app.includes("item.setAttribute('aria-label'"),'Emoji hints must support assistive technologies');
assert(!app.includes('round.emojis[idx]:\'❓\'}</div>'),'Old non-interactive clue slots should be replaced');
assert(css.includes('.league-options-row{display:flex')&&css.includes('.emoji-explanation{'));
for(const [locale,dict] of Object.entries(locales))
 for(const key of ['emojiMeaningColor','emojiMeaningPlace','emojiMeaningSymbol','emojiMeaningIdentity'])
  assert(dict[key]?.trim(),locale+': missing '+key);
console.log('✓ Summary sharing, aligned league controls, revealed-only emoji tips, six languages.');
