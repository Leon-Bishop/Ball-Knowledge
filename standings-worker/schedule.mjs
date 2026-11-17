/**
 * Ball Knowledge OpenLigaDB polling policy (Europe/Istanbul / UTC+3).
 *
 * Official OpenLigaDB fair-use rule (7 November 2026):
 *   live matches: <=1 request per 30–60 seconds PER LEAGUE;
 *   API ceiling: 60 requests/minute PER IP;
 *   use getlastchangedate; fetch full data only after a change;
 *   use jitter, cached results, and exponential backoff for 429/5xx.
 *
 * 31 seconds per league and 58 requests/min across the IP both stay MORE
 * than 2% below the fastest permitted request rate.
 *
 * This module is a policy, not a deployed OpenLigaDB client: the website
 * currently uses API Ninjas until a licensed alternative is integrated.
 * Exact 31-second scheduling needs Durable Object alarms or an equivalent
 * sub-minute scheduler. A minute-granularity Cron alone is insufficient.
 */
export const FAST_LEAGUES = Object.freeze([
 'england-premier-league',
 'turkey-super-lig'
]);
export const LIVE_MIN_INTERVAL_MS = 31_000;
export const PROVIDER_MAX_PER_60_SECONDS = 58;
export const NORMAL_INTERVAL_MS = 15 * 60_000;
export const OVERNIGHT_INTERVAL_MS = 3 * 60 * 60_000;
const zone = 'Europe/Istanbul';
const formatter = new Intl.DateTimeFormat('en-GB', {
 timeZone: zone, weekday: 'short', hour: '2-digit',
 minute: '2-digit', hourCycle: 'h23'
});
export function istanbulTime(date) {
 const parts = Object.fromEntries(formatter.formatToParts(date)
  .filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
 return {day: parts.weekday, hour: Number(parts.hour), minute: Number(parts.minute)};
}
export function matchWindowActive(date, fixtures = []) {
 const now = date.getTime();
 return fixtures.some(kickoff => {
  const start = new Date(kickoff).getTime();
  return Number.isFinite(start) && now >= start - 15 * 60_000 &&
         now <= start + 3 * 60 * 60_000;
 });
}
function elapsed(now, lastRequestAt) {
 if (lastRequestAt === null || lastRequestAt === undefined || lastRequestAt === '') return Infinity;
 const last = new Date(lastRequestAt).getTime();
 if (!Number.isFinite(last)) return -Infinity; // invalid tracking cannot bypass rate limits
 return now.getTime() - last;
}
/**
 * HARD limits on outgoing requests including getlastchangedate AND full data.
 * lastLeagueRequestAt must be a persisted timestamp of the LAST API call;
 * globalRequestTimes must include ALL provider calls in the last 60 seconds.
 * Reserve/persist an outgoing call in one centralized scheduler before sending
 * it: multiple Workers/visitors must never race this rate limiter.
 */
export function mayRequestProvider(date, lastLeagueRequestAt, globalRequestTimes = []) {
 if (elapsed(date, lastLeagueRequestAt) < LIVE_MIN_INTERVAL_MS) return false;
 const now = date.getTime();
 if (globalRequestTimes.filter(ts => {
  const time = new Date(ts).getTime();
  return Number.isFinite(time) && time <= now && time > now - 60_000;
 }).length >= PROVIDER_MAX_PER_60_SECONDS) return false;
 return true;
}
/**
 * The 31-second high-frequency window only applies during actual weekend
 * Premier League / Turkish Süper Lig matches, with a short pre/post margin.
 * 15m and 3h slots describe scheduling; in non-live periods the upstream
 * fetcher should prefer its cached result and fewer polls per the provider's
 * fair-use guidance, rather than querying just because a slot exists.
 *
 * fixtures: kickoff timestamps with timezone; lastLeagueRequestAt and
 * globalRequestTimes: persisted provider API-call history, not UI page views.
 */
export function checkPlan(date, leagueId, fixtures = [], lastLeagueRequestAt = null, globalRequestTimes = []) {
 const {day, hour, minute} = istanbulTime(date);
 let mode, intervalMs, scheduled;
 if (hour >= 1 && hour < 6) {
  mode = 'overnight';
  intervalMs = OVERNIGHT_INTERVAL_MS;
  scheduled = (hour === 1 || hour === 4) && minute === 7;
 } else {
  const weekend = day === 'Sat' || day === 'Sun';
  const lateSunday = day === 'Mon' && hour === 0;
  const live = (weekend || lateSunday) && (hour >= 12 || hour === 0) &&
   FAST_LEAGUES.includes(leagueId) && matchWindowActive(date, fixtures);
  if (live) {
   mode = 'live-weekend';
   intervalMs = LIVE_MIN_INTERVAL_MS;
   scheduled = true; // a sub-minute alarm checks the persisted last request
  } else {
   mode = 'normal';
   intervalMs = NORMAL_INTERVAL_MS;
   scheduled = minute % 15 === 0;
  }
 }
 // Slower 15-minute/3-hour windows must not be shortened by an extra call.
 const gapOk = elapsed(date, lastLeagueRequestAt) >= intervalMs;
 const withinProviderLimit = mayRequestProvider(date, lastLeagueRequestAt, globalRequestTimes);
 return {due: scheduled && gapOk && withinProviderLimit, mode,
  intervalMs, intervalMinutes: intervalMs / 60_000,
  nextEarliestAt: Number.isFinite(elapsed(date, lastLeagueRequestAt)) && elapsed(date, lastLeagueRequestAt) < intervalMs
   ? new Date(date.getTime() + intervalMs - elapsed(date, lastLeagueRequestAt)).toISOString()
   : null};
}
