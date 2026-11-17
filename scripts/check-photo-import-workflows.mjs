#!/usr/bin/env node
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = file => fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const importJob=read('.github/workflows/current-headshots.yml');
const rosterJob=read('.github/workflows/verify-current-rosters.yml');
const importer=read('scripts/build_current_headshots.py');
const shared='group: ball-knowledge-current-headshot-writers';
assert(importJob.includes(shared)&&rosterJob.includes(shared),
  'The importer and independent roster verifier must serialize writes to player-headshot-db.json');
assert(importJob.includes('cancel-in-progress: false')&&rosterJob.includes('cancel-in-progress: false'),
  'Do not terminate a source search while saving verified photo data');
assert(importJob.includes('--only-missing-cups'),'Trophy clubs must be checked first');
assert(importJob.includes('node scripts/check-trophy-photo-coverage.mjs --write'),
  'Publish independently measured coverage in each import checkpoint');
assert(importJob.includes('assets/trophy-photo-coverage.json'),
  'Commit the latest actual runtime coverage report');
assert(importer.includes('p.get("membershipSection") == "wikidata current club"'),
  'Continue to recognize previously licensed images backed by active P54 membership');
assert(importer.includes('if not used_sources:')&&importer.includes('No independently verified current club/photo'),
  'No player should be shown without current independent roster evidence');
console.log('✓ Serialized photo-data writers, preserved verified portraits, and per-batch coverage checkpoints');
