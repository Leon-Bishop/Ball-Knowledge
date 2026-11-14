# Research coverage (measured, 14 November 2026)

Target: **5** stories for each Turkish team, **3** for every other team; six supported languages.

**Club records:** 214 · **Required:** 678 · **Populated:** 553 · **Source-tagged:** 388 · **Six-language stories:** 334 · **Missing slots:** 125

**Coverage: 81.6% of story slots populated.** This is not equivalent to fully verified and translated coverage. Source-tagged means a URL exists and the story is marked sourced; it does **not** prove that every historical claim has been independently fact-checked. Older candidates still need editorial review.

| League | Club records | Required | Populated | Source-tagged | Six-language | Missing |
|---|---:|---:|---:|---:|---:|---:|
| belgian-pro-league | 18 | 54 | 40 | 27 | 24 | 14 |
| brazil-serie-a | 20 | 60 | 47 | 30 | 27 | 13 |
| england-premier-league | 20 | 60 | 60 | 42 | 37 | 0 |
| france-ligue-1 | 18 | 54 | 46 | 29 | 28 | 8 |
| germany-bundesliga | 18 | 54 | 50 | 36 | 30 | 4 |
| greece-super-league | 14 | 42 | 31 | 18 | 15 | 11 |
| italy-serie-a | 20 | 60 | 52 | 36 | 22 | 8 |
| netherlands-eredivisie | 18 | 54 | 44 | 30 | 26 | 10 |
| portugal-liga-portugal | 18 | 54 | 37 | 23 | 17 | 17 |
| scotland-premiership | 12 | 36 | 35 | 26 | 26 | 1 |
| spain-la-liga | 20 | 60 | 51 | 37 | 33 | 9 |
| turkey-super-lig | 18 | 90 | 60 | 54 | 49 | 30 |

## Changes in this research pass

- Added 37 source-linked, six-language stories across batches 14–16. Existing filler was replaced when necessary. **Net gain: 36 populated slots**, from 517 to 553.
- Prioritized unfamiliar clubs and club-specific unusual events; added source links, localized texts and stable `event_key` identifiers to the new stories.
- Kept the original 12 leagues and 214 club records, including the duplicate Ipswich source record (deduplicated only for playable choices).
- Replaced wrong-guess feedback in all six languages: city match, common kit colour, or league match only when multiple leagues are selected. Country and continent comparisons have been removed.
- Added `scripts/check-feedback.mjs` to `npm test` to prevent redundant country hints from returning.

## Next research queue

Use `npm run research:plan -- --limit=30` and prioritize clubs with only one usable story, then inspect old candidate sources and translations. Keep facts that are individually interesting; never fill missing slots with a routine founding year, shirt colour, or stadium name.
