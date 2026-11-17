# Ball Knowledge — open-licensed league standings

## Status (17 November 2026)

The GitHub Pages deployment builds one shared JSON cache from public football
data. No visitor calls a provider, and no API key is required.

- **OpenLigaDB (ODbL 1.0)**: primary for the three independently documented
  current-season shortcuts: `bl1` (Bundesliga), `pl` (Premier League), and
  `la1` (La Liga). A league is accepted only if actual completed matches
  produce a plausible table. Community coverage and freshness are not guaranteed.
- **OpenFootball (CC0 1.0)**: fallback for these three and primary source
  for the remaining nine. The script reads the 2026/27 JSON files for England,
  France, Germany, Italy, Netherlands, Portugal, and Spain, the 2026 Brazil
  file, the Greece/Scotland/Türkiye text files, and the Belgium repository.
  **Coverage is source-file availability, not a guarantee of current results.**
  Belgium's 2026/27 source currently appears to contain mostly fixtures rather
  than completed scores; the application must not fabricate its table.
- **Ranking limitations**: calculated tables use points, goal difference, goals
  scored, then alphabetical order. League-specific head-to-head rules,
  points deductions, abandoned matches and playoff phases can change official
  ranks. Treat these as *provisional calculated standings*, not official tables.
- If a source fails, the builder retains a previous cached league where
  available; otherwise that league shows an honest unavailable message.

## Deployment

The existing `.github/workflows/static.yml` builds the cache and publishes
`assets/standings.json` in the GitHub Pages artifact. No Cloudflare action
is needed for the **three-hour refresh**. The file is generated at deployment
time and is not committed to Git. The scheduled workflow runs at
01:07, 04:07, 07:07, 10:07, 13:07, 16:07, 19:07 and 22:07 in
`Europe/Istanbul`. GitHub Actions schedules may be delayed.

To test manually: `node scripts/update-standings.mjs`.
A successful script logs how many real final scores and clubs it found for
each competition. The script is intentionally strict and can reject a source
whose data is too incomplete.

## Future live-match refresh — Cloudflare required

The optional policy in `standings-worker/schedule.mjs` targets **31 seconds
per league during actual weekend Premier League and Süper Lig matches**,
15-minute daytime checks, and overnight checks at 01:07/04:07.
It also caps provider traffic at **58 requests/minute per outgoing IP**.
This policy is tested, but is **not a deployed polling service**.

To activate genuine 31-second polling, a Cloudflare Worker needs:
1. A **Durable Object** with alarms for sub-minute scheduling and serialized,
   persisted per-league and global request accounting (ordinary Cron Triggers
   cannot run every 31 seconds).
2. A **KV or R2 cache** for the public standings JSON and the last-change
   timestamps, and a route/API endpoint for the website to read it.
3. A source-specific OpenLigaDB adapter: use
   `getlastchangedate/{shortcut}/{season}/{group}` to detect updates, then
   fetch full match data only after a change; persist last requests and apply
   exponential backoff on HTTP 429 and 5xx.
4. Current-season coverage verification before enabling a league. The
   OpenLigaDB shortcut for **Türkiye Süper Lig has not been confirmed**;
   therefore the two-minute / 31-second live Türkiye path cannot yet be
   activated using OpenLigaDB.
5. An explicit source attribution and ODbL compliance review for any
   redistributed/modified OpenLigaDB database.

Do **not** enable a per-minute GitHub Pages redeploy or have each player's
browser poll OpenLigaDB: those approaches violate the intended central-cache
design and may create avoidable provider load.

## Source licensing and documentation

- OpenLigaDB API: https://api.openligadb.de/
- OpenLigaDB terms: https://www.openligadb.de/en/terms-of-use
- OpenLigaDB ODbL: https://www.openligadb.de/lizenz
- OpenFootball CC0: https://github.com/openfootball/football.json/blob/master/LICENSE.md
- OpenFootball Europe: https://github.com/openfootball/europe
- OpenFootball Belgium: https://github.com/openfootball/belgium

The quiz's answer selection, league selector and scoring are not connected
to the read-only standings reference. Never expose guessed teams from the
quiz pool through this reference.
