# Live league standings reference (Ball Knowledge)

## Gameplay

- With **one selected league**, a read-only current-season standings table appears to the right of the quiz on wide screens (below the quiz on narrow screens). It shows actual ranking, club, games played and points, with provider and last-fetched date. Never generated from the hidden 5/10 quiz selections.
- With **multiple leagues**, a separate unsearchable directory dropdown groups **every eligible club** by league. Changing the directory never changes the answer or matches against what is typed.
- The guess input no longer autocompletes or narrows clubs as a user types. Enter the full club name or a supported alias/abbreviation. Guesses are checked against **all clubs of the selected leagues**, not only those secretly drawn for this session. Unknown names do not cost an attempt, but an actual wrong guess does. Five attempts and scoring remain unchanged.
- The directory remains public reference information. Quiz answers stay hidden until each round ends.
- If standings are not available, **no false table is shown**; an honest unavailability message appears.

## Live data integration

The static GitHub Pages site needs a licensed live standings source. The integration uses the documented [API Ninjas Soccer Standings endpoint](https://api-ninjas.com/api/football). API Ninjas lists competition codes for all 12 Ball Knowledge leagues, but *you must verify current-season access for each league with your own API account*. A listed competition may return errors or be unavailable on your plan.

**Commercial use is not permitted on API Ninjas' free tier.** Because Ball Knowledge has ad slots and may be monetized, obtain the appropriate commercial license before enabling monetized publication. Comply with the provider's data caching, storage and redisplay rules as well. Do not use this automated publishing approach unless your selected plan permits it. A different, appropriately licensed standings provider can be plugged into the same JSON schema.

### Enable the feed

1. Create an account with [API Ninjas](https://api-ninjas.com/register) and obtain the permitted API key. Do not paste it into the website or a GitHub file.
2. In GitHub: **Ball-Knowledge → Settings → Secrets and variables → Actions → New repository secret**.
3. Enter the secret name exactly `API_NINJAS_KEY`; set its value to the API key.
4. Open **Actions → Deploy static content to Pages → Run workflow**, or merge an update to `main` to invoke a build.
5. Check the deployment logs: they should report retrieved standings rows for the leagues included in your plan. The scheduled workflow tries again every six hours (4 refreshes/day). With all 12 leagues that is 48 API calls/day, roughly 1,440 per 30 days, below the provider's advertised 3,000/month free *testing* allowance, but a paid/commercial license may be required for public use.
6. The generated `assets/standings.json` is published with the Pages artifact, NOT committed to Git or included in the source repository. This prevents accidental key exposure. The file is only created if the API returns genuine rows.

### Data formatting

`scripts/update-standings.mjs` requests the 12 standings tables and writes:
```json
{
  "provider": "API Ninjas",
  "leagues": {
    "greece-super-league": {
      "updatedAt": "2026-11-15T00:00:00.000Z",
      "rows": [
        {"rank": 1, "team": "Example name only", "played": 10, "points": 24}
      ]
    }
  }
}
```
The JSON above is illustrative documentation, **not an actual league ranking**. The app does not ship mock standings.

A league missing from the licensed feed displays a localized 'not available' message; neither false standings nor guessed placements are shown. Standings are updated after games and on a schedule, not instantaneous play-by-play. The club names in the external standings can change across seasons and may differ from the quiz's fixed club roster.

## Safety / integrity

The API key is used only by GitHub Actions; visitors cannot see it in the page. The answer input is deliberately unrelated to the reference panel. Automated tests verify there is no suggestion list and that every selected-league club is eligible. Client-side quizzes are not fully cheat-proof against users who inspect the site's files and scripts; a truly competitive anti-cheating game would need server-side answer verification.
