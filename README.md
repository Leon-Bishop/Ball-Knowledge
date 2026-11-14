> **v3.4 — Dropdown fixes:** Dark-mode club autocomplete hover/focus text is now readable; difficulty always lists Easy, Medium, Hard (translated).

# ⚽ Ball Knowledge

**Ball Knowledge** is a mobile-first football club emoji quiz with a stadium-inspired purple interface. Choose one or more leagues by tapping their logo tiles, then guess the secret club from five randomized emojis. Each round ends with **one randomly selected club story**. **Each session contains exactly one round per unique club in the chosen leagues**, with no repeat answers, and finishes with a scored summary.

### Game

- **12 leagues**, **214 input club records** (**213 unique playable clubs**; one duplicated Ipswich Town record remains in the source data).
- **6 interface languages:** Turkish, English, Spanish, French, Italian and Portuguese. The name **Ball Knowledge** is unchanged in all six.
- Five guess attempts **per round**, autocomplete, final session score, streak, a deterministic daily session order, progress tracker and spoiler-free share.
- Helpful wrong-guess feedback: shared city, kit colour or league (when multiple leagues are selected); no redundant country hint.
- **No “All leagues” button, continent/country/tag filters or player JSON upload**.
- Light/dark mode; a separate, fully designed league-selection screen and game screen.
- Official league logo URLs are referenced where available. Tiles have **clearly distinct typographic fallbacks** if a logo cannot load. Logo imagery is **not bundled**, and use may be subject to trademark restrictions.

> **Fact coverage note:** There are **553 populated stories across 214 club records**, including **388 source-tagged** stories and **334 stories with all six translations**. The long-term target is **678 stories**; **125 slots remain**. All 214 club records have at least one playable story. Sources and editorial review are documented in `RESEARCH_COVERAGE.md`.

## Running locally

Requires Python 3 for local serving. For automated checks and building, Node.js 20+ is sufficient; no npm dependencies are required.

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

```bash
npm test
npm run build
# The deployable site is written to dist/
```

Do not open `index.html` with `file://`: browsers block the JSON fetches when run this way.

## Updating your existing GitHub Pages site

See **[UPDATE_EXISTING_REPO.md](UPDATE_EXISTING_REPO.md)**. You do **not** need a new repository. Commit the contents of this folder to `main` and keep the included `.github/workflows/deploy.yml` workflow. In **Settings → Pages**, set **Source: GitHub Actions** (not `main / (root)`, Jekyll or a second Static HTML workflow).

The GitHub Actions workflow tests and builds the `dist/` site and publishes it on each push to `main`. On successful deployment, hard-refresh your website.

## File map

```text
index.html                              Main app layout and screens
assets/styles.css                       Stadium hero, league cards, responsive game screens
assets/app.js                            Club selection, guessing, and score UI
assets/session-core.js                   Finite session deck, deterministic daily order and scoring
assets/favicon.svg                      Ball Knowledge tab icon
i18n.json                                Six user-interface languages
leagues.json                            League directory
teams.enriched.json                     Club metadata and emoji hints
tum-kulupler-ilginc-hikayeler-guncel.json  Trivia with per-fact sources and translations
scripts/                                Data validation, brand checks and static build
.github/workflows/deploy.yml            GitHub Pages CI workflow
docs/                                   Preview screenshots
RESEARCH_COVERAGE.md                    Editorial coverage and remaining work
```

## Content and logos

Club facts include draft research; publishing the project does not independently verify every claim. League marks are third-party trademarks. Ensure appropriate rights and accurate branding before commercial use; remote logos can change without notice.

## Finite quiz sessions (v3.1)

- Choosing a league with 18 distinct clubs creates **18 rounds**, regardless of how many wrong guesses occur within a round. Each round permits up to five guesses.
- Choosing several leagues creates one session with exactly the **unique club count** across those selected leagues and the current difficulty filter.
- Each club is the secret answer **once per session**. Previously completed secret clubs do not appear in autocomplete in that session.
- The session **never reshuffles and never restarts by itself** when its last club is completed. Instead it shows the final score, solved/missed counts, longest streak and a collapsible round-by-round recap.
- After the final round, players can **Play again** (a new shuffled session) or **Choose leagues**.
- Changing the league/difficulty selector affects **the next session**, not the ongoing session. Returning to the Play tab resumes the current run.
- Daily mode deterministically shuffles the entire selected session's club list and each club's hint order based on the date; it no longer repeats the same club indefinitely.
- Input data includes Ipswich Town twice in England, so England has **19 distinct playable clubs**, not 20, until the source file is corrected. No source records were silently deleted.
- `npm test` now checks finite session length, uniqueness, daily determinism, final scoring and all six translations.
