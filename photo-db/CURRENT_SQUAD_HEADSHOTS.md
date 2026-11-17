# Current-squad face-only photo clues

The historical `assets/player-photo-db.json` contains past **and** present
footballers, including action shots. It is kept only as a research archive and
is **never read by the game**.

The game instead loads `assets/player-headshot-db.json` (schema version 2).
Every displayed club must have **at least 3 distinct** licensed, face-detected,
current-squad portraits. Four is the collection target. If a club lacks three,
the quiz shows its ordinary emoji clue rather than a historical, unidentified
or full-kit photograph.

## Evidence and image selection

1. `photo-db/club-wikidata-map.json` maps each of the 214 game clubs to a
   Wikidata club identifier; the matching Wikipedia club article, season page or local-language article
   is consulted for its explicit **Current squad**, **First-team squad**,
   **Squad** or equivalent local-language heading. Generic `Players`
   headings are rejected because they may mix historical players with
   current players.
2. Linked squad members are resolved to individual Wikidata human footballers.
   The importer retrieves their Commons image filename from Wikidata P18 or
   Wikipedia pageimages.
3. Wikimedia Commons image metadata must specify a photographer/author,
   source page and commercially reusable license (CC0, public domain, CC BY,
   or CC BY-SA). Noncommercial and no-derivatives files are rejected.
4. OpenCV detects a single dominant human face. Photos without a clear face,
   with multiple similar-sized faces or too little image resolution are
   rejected. A 192×192 JPEG **face-only crop** is saved to
   `assets/player-headshots/`. These are adaptations of the original images;
   author and license are preserved in the JSON and
   `player-photo-credits.html`.
5. A set is published only when three or four valid current-squad face crops
   exist. Player identities and their original image sources are available
   when revealing a clue; the photo itself does not show a full kit.

Current squad evidence is a snapshot of a Wikipedia article, not a real-time
official registration database. Rosters can change between weekly checks,
especially during transfer windows. Do not claim official squad verification
or absolute image identity certainty.

## Automated refresh and deployment

`.github/workflows/current-headshots.yml` runs on updates to the importer,
on manual dispatch and every Sunday at 03:27 UTC. It verifies/crops all
214 clubs in checkpointed batches of 20, commits the source-linked data and
face crops to `main`, and republishes GitHub Pages. No Cloudflare work,
paid photo service or API key is required.

The importer rechecks successful four-photo clubs after six days; clubs with
fewer photos are attempted on each run. A previous verified set is kept when
the source temporarily fails, but the browser stops displaying it if the
roster verification is more than 21 days old. An unverified player is never
substituted.

Review `assets/player-headshot-audit.json` for exact coverage, counts and
reasons clubs could not reach the three-photo minimum. This is an honest
audit: **a source page existing is not proof that three usable headshots
exist**. All 214 clubs are attempted; only verified records are displayed.

Manual test:

```bash
python scripts/build_current_headshots.py --self-test
node scripts/check-current-headshots.mjs
```

The full importer needs Python 3.12, Pillow, NumPy, OpenCV, and network
access to Wikimedia APIs. The GitHub workflow installs these dependencies.

## Correct club assignment and loan safeguards

The importer no longer treats a loaned-out player in a parent club's
Wikipedia roster as a current first-team player. It stops at the first
loan, reserve or former-player subsection and excludes known loaned-out
players. A player Wikidata QID cannot be assigned to two game clubs.

Every headshot also passes a weekly squad-membership audit:
- Reparse the **current first-team subsection** of the linked Wikipedia
  club article and confirm that the player QID appears there
- Check the player's Wikidata P54 club history, rejecting a contradictory
  2026/27 club assignment when it has a recent start date
- Use club-published current squad pages for Galatasaray, Göztepe and
  Kasımpaşa, and documented loan announcements for ambiguous players
- Expire the audit and fall back to emoji clues after 21 days if verification
  is not refreshed

Sources and audit statuses are saved in
[the membership audit](../assets/player-headshot-membership-audit.json)
and [the roster evidence registry](official-roster-evidence.json).
An entry supported only by an explicit Wikipedia squad page is **not
independently confirmed**; the audit distinguishes these from independently
corroborated players. No claim of guaranteed correctness for all 214 clubs
is made. Players without sufficiently current, consistent evidence do not
appear as photo clues.
