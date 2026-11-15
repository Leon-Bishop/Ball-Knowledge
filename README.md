> **Quiz lengths:** Short = 5 rounds, Medium = 10, Long = all clubs in the selected leagues. Every length draws randomly from the selected league(s); no club has a fixed difficulty.

# ⚽ Ball Knowledge

**Ball Knowledge** is a mobile-first football club emoji quiz with a stadium-inspired purple interface. Choose one or more leagues by tapping their logo tiles, then guess the secret club from five randomized emojis. Each round ends with **one randomly selected club story**. **Each session contains up to the selected number of unique clubs from the chosen leagues**, with no repeat answers, and finishes with a scored summary.

### Anonymous rankings (optional backend)

A new **Rankings** tab supports a one-time username, a nearby country flag, and separate global, country and region rankings for Short, Medium and Long quizzes. No password or formal sign-up is required. Cloudflare supplies approximate country/region details without requesting GPS.

**Shared rankings require a deployed Cloudflare Worker + D1 database**. Until the API URL is configured, the game remains fully playable and the Rankings tab displays a setup notice instead of fake scores. See [leaderboard-worker/README.md](leaderboard-worker/README.md) for deployment instructions, anonymity limits and score-integrity warnings. Anonymous per-browser identity cannot guarantee one account per person; leaderboard scores are currently unverified beta submissions.

### Live standings and fair guesses

When one league is selected, a sidebar displays **real current-season standings** (ranking, club, matches played, points) whenever the connected standings provider returns data. With multiple leagues, a read-only dropdown lists every club grouped by league. Neither reference searches, filters nor reveals the hidden quiz answers. The answer field accepts club names and aliases without autocomplete. The data API requires a secret configured in GitHub Actions; no fictitious standings are displayed before activation. See [LIVE_STANDINGS_SETUP.md](LIVE_STANDINGS_SETUP.md) for source licensing and setup.

### Game

- **12 leagues**, **214 input club records** (**214 unique playable clubs**).
- **6 interface languages:** Turkish, English, Spanish, French, Italian and Portuguese. The name **Ball Knowledge** is unchanged in all six.
- Five guess attempts **per round**, forgiving guesses (short names, common nicknames, accent-insensitive spelling and small typos), final session score, streak, progress tracker and spoiler-free share.
- Ambiguous short names (for example, Manchester or Madrid) ask for a more specific club name without costing an attempt. The guess input does not reveal answer suggestions.
- Helpful wrong-guess feedback: shared city, kit colour or league (when multiple leagues are selected); no redundant country hint.
- **Select All and Deselect All league buttons are included; there is no player JSON upload**.
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

- Choosing a league with 18 distinct clubs offers **5, 10, or all 18 rounds**, depending on quiz length. Each round permits up to five guesses.
- Choosing several leagues creates a random, nonrepeating sample from **all clubs in the selected leagues**, limited only by the chosen round count.
- Each club is the secret answer **once per session**. Previously completed secret clubs do not appear in autocomplete in that session.
- The session **never reshuffles and never restarts by itself** when its last club is completed. Instead it shows the final score, solved/missed counts, longest streak and a collapsible round-by-round recap.
- After the final round, players can **Play again** (a new shuffled session) or **Choose leagues**.
- Changing league/quiz-length selections affects **the next session**, not the ongoing session. Returning to the Play tab resumes the current run.
- The Premier League list contains **20 distinct playable clubs**.
- `npm test` now checks finite session length, uniqueness, daily determinism, final scoring and all six translations.
