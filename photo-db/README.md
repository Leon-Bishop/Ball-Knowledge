# Ball Knowledge — Player photographs

**Goal:** 10 verifiable, licensed player photographs per club (2,140 records across 214 teams); **minimum to enable player-photo clues: 7 per club** (1,498 total). These are targets, not claims of completed coverage.

## Safeguards

A footballer's association with a club must be backed by a **Wikidata P54 team membership statement**, using an exact identified club QID. Historical membership qualifies, but it is *not evidence of a 2026/27 squad position*. Photo usage must be traced to a Wikimedia Commons file with commercial-compatible licensing: CC0, Public Domain, CC BY or CC BY-SA. Store author, original source, license and license URL. Every player in a completed set must have a validated photo and metadata. Do not use unlicensed press, Getty, football-api or scraped Transfermarkt photos.

The built quiz displays a photo in place of a vague 🏆, 🥇 or ⚽ clue **only for clubs with 7+ qualifying records**; otherwise it preserves the existing emoji. This is intentional. We must not show an invented player, a wrong club or an unlicensed photo merely to fill gaps. Photos don't necessarily show the player wearing that club's kit.

## Files

- `club-wikidata-map.json`: vetted Wikidata IDs for clubs; new exact-match candidates are automatically found, but ambiguous matches are skipped.
- `../assets/player-photo-db.json`: generated, versioned, licensed photo records grouped by Ball Knowledge club ID.
- `../assets/player-photo-audit.json`: coverage and unresolved club report.
- `../scripts/build_player_photo_db.py`: reproducible importer (Python standard library).
- `../.github/workflows/player-photo-db.yml`: incremental import. The job limits batch size and retries on subsequent runs.

No API key is needed. Data and licenses remain source-specific; machine-readable Commons metadata can be incomplete. Periodic human verification of player identity and image permissions is still necessary before making a legal clearance claim.

## Attribution and accuracy

Each visible player photo has a clickable attribution link to the Commons file page with photographer and license information. CC BY-SA conditions may apply to adaptations. A photo showing a player in another team's kit is a historical player association, **not** a current-kit clue.

The importer may not be able to find seven eligible licensed images for every club, particularly for lower-profile teams. The audit records these gaps openly.

## Shirt concealment

Quiz tiles now display a strongly enlarged upper image region instead of the full photo, reducing the chance that a player shirt, sponsor or team crest reveals the answer. Source images remain unchanged for licensing and credits. Because source image composition varies, cropping cannot guarantee every shirt is hidden without individualized image review; visually inspect exceptional cases and replace them with suitable licensed portraits.
