import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=name=>fs.readFileSync(name,'utf8');
const html=read('index.html');const css=read('assets/styles.css');const js=read('assets/app.js');
const i18n=JSON.parse(read('i18n.json'));
assert.match(html,/<title>Ball Knowledge<\/title>/);
assert.match(html,/id="gameTitle"/);
assert.match(html,/class="stadium-hero"/);
assert.match(html,/id="selectionView"/);
assert.match(html,/id="gameView"/);
assert.match(html,/id="leagueGrid"/);
assert.match(html,/id="new"/);
assert.match(css,/\.league-grid/);assert.match(css,/\.stadium-hero/);
assert.match(js,/function setView\(view\)/);
assert.match(js,/function updateStartButton\(\)/);
for(const [locale,d] of Object.entries(i18n)){
 assert.equal(d.title,'Ball Knowledge',locale);
 assert.equal(d.shareTitle,'Ball Knowledge',locale);
 for(const key of ['brandTag','brandTagline','startQuiz','guessTitle','navLeagues','navPlay','navStats','navSettings'])assert.ok(d[key],locale+' '+key);
}
assert.equal(html.includes('id="upload"'),false);
console.log('✓ Ball Knowledge branding, separate home/play screens and six-language copy.');
