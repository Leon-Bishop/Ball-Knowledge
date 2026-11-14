# Research method — unusual, sourced football stories

## Goal and boundary

The source roster is **214 club records** across 12 leagues. Turkish clubs need **five** compelling stories each; all others need **three**. Target: **678 separate stories**, each sourced, in Turkish (`text`) and English, Spanish, French, Italian and Portuguese (`translations`). A full fact set must *not* be declared complete until all five/six language fields and references are populated and editorially checked.

The game is already functional. **Research takes priority over rebuilding the UI.** A new story is added to the repo only after a real source is examined, its match/event details checked, and the text made specific and family-friendly. A citation link by itself does not make an unexamined story true.

## Search less, find more

1. **Prioritize by gap, not by fame.** Run `npm run research:plan -- --league=turkey-super-lig --limit=10`; the queue orders clubs using missing slots, uncited candidates and missing translations. Work small and under-documented teams early, instead of repeatedly researching high-profile teams that already have content.
2. **Search in the original language.** Include alternate names in longer searches but avoid searching short abbreviations alone. For Turkish teams use Turkish terms; French clubs use French, etc. This captures local journalism, club archives and federation records that generic English searches miss.
3. **Discover by event type.** Target `unexpected cup upset`, `penalty shoot-out`, `last-minute goal`, `mascot story`, `fan-built stadium`, `lost trophy`, `unusual founding anecdote`, `match abandoned`, `record comeback`, `promotion final`. Searching only "club history" tends to return generic founding dates, shirts and stadium details, which this game does **not** want.
4. **Start with trusted archives and reuse them.** One UEFA or national-federation event page can cover several teams. Search national federation archives, official club timelines, league history pages and UEFA/CONMEBOL before general sports reporting. Examine the page, not just its headline or snippets. Follow a striking claim into an original match report when practical. Store the same genuine source URL in each independently supported club story; do not make one source pretend to support an unrelated fact.
5. **Make fact text a single surprising payoff.** Prefer a verified, specific narrative in one or two sentences (~20–50 words): *what happened, when, why unexpected*. Reject generic phrases such as “has passionate fans”, “wears red and yellow”, “was founded in 1905”, or “plays at X stadium”. An ordinary trophy win alone is not enough; a 4–0 final upset, a bizarre extra-time rule, or a trophy found in a storeroom can be.
6. **Verify details before translating.** Record source URLs at fact level; double-check names, match scores, dates and distinctions like **friendly vs competitive** and **final vs semi-final**. Reject tragedy, inflammatory rivalry, political or religious angles. Set `source_supported` only after direct review. Do not invent sources or use generic URL homepages as evidence.
7. **Translate one locked original into five languages.** Preserve all proper nouns, scores, minutes and caveats. Never translate an unverified draft and then count it as five finished facts. Each fact remains *one* story regardless of translations.
8. **Run audits after every batch.** `npm test && npm run research:audit` checks mapping, counts, language coverage, URLs and possible duplicate passages. It cannot prove historical truth; editorial judgment remains necessary. Update this repo's coverage report with measured counts only.

## Recommended high-yield query batches

For a Turkish club such as Gençlerbirliği:

- `site:uefa.com "Gençlerbirliği" 2004 Parma Valencia silver goal`
- `site:tff.org "Gençlerbirliği" penaltı unutulmaz maç`
- `"Gençlerbirliği" "ilginç hikâye" OR "efsane"`

For a smaller club, start with the **club's own site history page** and a local newspaper archive; consider the club's official social media anniversary posts only as leads that need independent confirmation. If no interesting documented event survives verification, leave the slot empty and write a specific research note rather than fabricating a surprise.

## Quality gate (per fact)

- [ ] Specific and genuinely unexpected, with a clear event or unusual tradition.
- [ ] Correct club identity (including predecessor/renamed club, never assume unrelated successor clubs are identical).
- [ ] Dates, scores and context checked from the actual linked page.
- [ ] Public, relevant source URL; corroboration for unusual or contested claims.
- [ ] At least one fact about this club, not a generic league fact recycled everywhere.
- [ ] Different event from other entries on this club; not simply restating the same result.
- [ ] Turkish original and five faithful translations checked.
- [ ] Non-tragic, family-friendly and politically neutral.

## Files and commands

- `tum-kulupler-ilginc-hikayeler-guncel.json`: live game data, strict original IDs and exactly 5 / 3 fact slots.
- `scripts/plan-research.mjs`: generated, prioritized queue and localization-aware search suggestions (no external search API required).
- `scripts/audit-editorial.mjs`: structural and near-duplicate flags; **does not verify URLs live**.
- `RESEARCH_AUDIT.json`: measured report from the audit script.
- `RESEARCH_BATCH_NOTES.md`: newly reviewed story provenance and known caveats.
- `npm run research:plan -- --format=json --limit=20`: export queue as JSON.

**Status caveat:** Existing `source_supported` tags from earlier releases were not all rechecked in this batch. The "source-tagged" audit count measures metadata consistency, **not** 100% independently verified historical facts.
