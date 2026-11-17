import assert from 'node:assert/strict';
import {
 FAST_LEAGUES, LIVE_MIN_INTERVAL_MS, PROVIDER_MAX_PER_60_SECONDS,
 istanbulTime, matchWindowActive, mayRequestProvider, checkPlan
} from '../standings-worker/schedule.mjs';

assert.deepEqual(FAST_LEAGUES, ['england-premier-league','turkey-super-lig']);
assert.equal(LIVE_MIN_INTERVAL_MS, 31_000);
assert.equal(PROVIDER_MAX_PER_60_SECONDS, 58);
// The two independent published provider limits: 30 seconds per league,
// 60 calls/minute per outbound IP. The policy maintains >2% headroom.
assert(LIVE_MIN_INTERVAL_MS >= 30_000 / 0.98);
assert(PROVIDER_MAX_PER_60_SECONDS <= Math.floor(60 * 0.98));

const kickoff = '2026-11-21T16:00:00+03:00'; // Saturday Turkish Standard Time
const now = new Date('2026-11-21T14:00:00Z'); // 17:00 Istanbul
const ago = milliseconds => new Date(now.getTime()-milliseconds);
assert.deepEqual(istanbulTime(now), {day:'Sat',hour:17,minute:0});
assert(matchWindowActive(now,[kickoff]));
assert.equal(checkPlan(now,'turkey-super-lig',[kickoff]).mode,'live-weekend');
assert.equal(checkPlan(now,'england-premier-league',[kickoff]).due,true);
assert.equal(checkPlan(now,'turkey-super-lig',[kickoff],ago(30_999)).due,false);
assert.equal(checkPlan(now,'turkey-super-lig',[kickoff],ago(31_000)).due,true);
assert.equal(checkPlan(now,'france-ligue-1',[kickoff]).mode,'normal');
assert.equal(checkPlan(now,'turkey-super-lig',[]).mode,'normal');

assert.equal(mayRequestProvider(now,ago(30_999)),false);
assert.equal(mayRequestProvider(now,ago(31_000)),true);
const recent = Array.from({length:58},() => ago(15_000));
assert.equal(mayRequestProvider(now,ago(31_000),recent),false);
assert.equal(mayRequestProvider(now,ago(31_000),recent.slice(0,57)),true);
assert.equal(checkPlan(now,'turkey-super-lig',[kickoff],ago(31_000),recent).due,false);
// A 429 followed by an immediate attempt is forbidden; even changed-data
// follow-up requests need the same 31-second per-league accounting.
assert.equal(mayRequestProvider(now,ago(1_000)),false);
assert.equal(mayRequestProvider(now,'invalid-timestamp'),false);

// Off-match checks remain quarter-hourly, with overnight at 01:07/04:07.
assert.equal(checkPlan(new Date('2026-11-21T08:15:00Z'),'turkey-super-lig').due,true);
assert.equal(checkPlan(new Date('2026-11-21T08:16:00Z'),'turkey-super-lig').due,false);
assert.equal(checkPlan(new Date('2026-11-20T22:07:00Z'),'turkey-super-lig').mode,'overnight');
assert.equal(checkPlan(new Date('2026-11-20T22:07:00Z'),'turkey-super-lig').due,true);
assert.equal(checkPlan(new Date('2026-11-20T23:07:00Z'),'turkey-super-lig').due,false);
assert.equal(checkPlan(new Date('2026-11-21T01:07:00Z'),'turkey-super-lig').due,true);
console.log('✓ OpenLigaDB 31-second live and 58/minute global caps, Istanbul match windows and overnight schedule');
