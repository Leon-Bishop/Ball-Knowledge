import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../i18n.json',import.meta.url),'utf8'));
const languages=['tr','en','es','fr','it','pt'];
const keys=Object.keys(data.tr).sort();
for(const lang of languages){if(!data[lang])throw Error(`Missing language: ${lang}`);const found=Object.keys(data[lang]).sort();if(JSON.stringify(keys)!==JSON.stringify(found))throw Error(`Key mismatch in ${lang}`);for(const [k,v] of Object.entries(data[lang]))if(!v.trim())throw Error(`Empty ${lang}.${k}`)}
console.log(`✓ ${languages.length} languages and ${keys.length} strings validated.`);
