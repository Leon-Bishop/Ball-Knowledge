import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
assert(js.includes("return ['easy','medium','hard'].map(v=>[v,v])"),'Difficulty values must always be Easy, Medium, Hard');
console.log('✓ Difficulty order is Easy → Medium → Hard (localized labels).');
