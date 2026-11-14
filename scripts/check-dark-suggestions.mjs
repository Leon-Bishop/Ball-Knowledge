import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../assets/styles.css', import.meta.url),'utf8');
for(const selector of [
 'body.dark .suggestions button{',
 'body.dark .suggestions button:hover,',
 'body.dark .suggestions button:focus-visible{',
 'body.dark .suggestions button:active{'
]) assert(css.includes(selector),`Missing dark autocomplete state: ${selector}`);
assert(css.includes('background:#604184;') && css.includes('color:#fff;'));
console.log('✓ Dark-mode autocomplete normal, hover, focus and active contrast rules present.');
