# v3.4 — Dropdown fixes

- **Autocomplete:** Corrected dark-mode hover, focus and pressed colours. Hovered club suggestions now show white text on a saturated dark-purple background.
- **Difficulty:** Custom fixed order: Easy → Medium → Hard, rather than alphabetical Easy → Hard → Medium. Labels remain translated in Turkish, English, Spanish, French, Italian and Portuguese.
- **Native difficulty select:** Sets explicit light-on-dark option colours so the selection remains readable in dark mode.
- The full game, 12 leagues, session length, and trivia data are unchanged.

## Update your existing GitHub site
Extract the GitHub source ZIP and replace existing repository files on `main`; keep the deployment workflow under `.github/workflows/deploy.yml`. GitHub Pages source should remain GitHub Actions.
