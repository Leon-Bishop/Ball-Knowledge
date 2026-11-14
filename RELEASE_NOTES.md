# Ball Knowledge 3.1 — Finite quiz sessions

## What's new

- **One secret club per round; one round per distinct club** in the selected leagues and difficulty.
- All rounds are planned when the quiz begins. There are **no repeats** and no automatic deck refill.
- A visible **Round X of N** progress tracker appears during play.
- Every round allows **up to five guesses**. Successful rounds earn 5, 4, 3, 2 or 1 point; a failed round earns 0.
- Once the final club has been answered or missed, the game ends automatically and shows the **final score out of 5 × N**, correct/missed counts, longest streak and round-by-round results.
- **Play again** starts a fresh session, and **Choose leagues** goes back to the selector.
- The autocomplete list excludes clubs whose rounds were already completed.
- The daily challenge uses a stable seeded order for the whole selected pool; it also ends after the last club.
- The interface changes are translated into all six existing languages.
- **The original club and research files were preserved.** The English source list contains Ipswich Town twice: therefore 20 source rows yield 19 unique English quiz rounds.

## Validation

- `npm test` — data, branding, translations, hint feedback, finite sessions and scoring.
- `npm run build` — creates the static site under `dist/`.
- `python3 scripts/browser-session-smoke.py` — optional Chromium/Playwright smoke test (requires installed Playwright and Chromium). Exercises a Turkish 18-club session with one miss, a 50-club multi-league session, replay, language switching and changing filters without mutating an active session.

## GitHub Pages update

Replace your repository's source files with the **GitHub repository ZIP contents** (not the deployable ZIP). Push to `main` and keep **Settings → Pages → Source: GitHub Actions**. The included workflow automatically rebuilds the site.
