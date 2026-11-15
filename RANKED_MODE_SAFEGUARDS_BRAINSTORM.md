# Future Ranked Mode — Safeguards Brainstorm

**Status:** Brainstorm / future requirements — **NOT IMPLEMENTED**. Ranked Mode is postponed. This document is a design note, not a claim that the current game is protected against cheating.

## Goal

Make Ranked Mode fair even if a player clears browser cache/localStorage, opens incognito mode, switches browsers, refreshes the page, or changes devices. Preserve player progress without requiring a traditional email-and-password signup if possible.

**Key limitation:** Clearing cache must never reset an attempt **for an existing account**, but anonymous accounts alone cannot guarantee **one attempt per human**. Someone may create a new anonymous identity. No browser-only solution, recovery code, IP address, or device fingerprint can reliably stop that. Stronger identity verification and/or abuse controls involve trade-offs in privacy and friction. Decide the acceptable trade-off before Ranked Mode launches.

## Must-have safeguards before Ranked Mode launch

- [ ] **Server-authoritative attempt limits.** Cloudflare (or another backend) stores ranked attempt entitlement, start time, state, and completion. The browser must never decide whether another attempt is allowed. Define the exact attempt window (e.g. once per day/event/season) before implementation.
- [ ] **Cache-proof enforcement for the same identity.** Clearing localStorage/cookies, opening a different browser, or using a different device does not reset an attempt recorded for that account. If identity is lost, players must recover it to resume.
- [ ] **Attempts count when started.** Record/consume the attempt atomically on the server when the ranked session begins, not only on submission. Refreshing or disconnecting cannot grant another attempt. Allow resuming the *same* active session where appropriate, with an expiry policy.
- [ ] **Server-generated, bound sessions.** Generate unpredictable session IDs on the server, bind them to the authenticated player and attempt window, store authoritative progress, and enforce expiration. Prevent duplicate starts, duplicate submissions, replay, and concurrent-session bypasses using database constraints/transactions.
- [ ] **Server-verified gameplay.** The server chooses/records the ranked club order and checks each guess/attempt and the resulting BK Points. Do not accept a browser-provided list of rounds and calculated score as proof that the game was played honestly. Avoid exposing the ranked answer key in public static assets or API responses before the relevant answer is locked; a public normal-mode club list is not a secure ranked answer bank.
- [ ] **BK Points determine rankings.** Rank by server-calculated BK Points only; accuracy and number of correct guesses must not independently change ranking order. Equal BK Points should share the same rank. Define any non-score display ordering separately.
- [ ] **Identity and account recovery.** Investigate a low-friction anonymous identity with a strong, one-time-shown recovery code (or passkey). Store only a secure verifier/hash of recovery secrets; protect recovery with rate limits and rotate/revoke secrets on use as appropriate. Restore the same account and its ranked history, never create a fresh entitlement during recovery.
- [ ] **New-account abuse strategy.** Explicitly decide whether the rule is one attempt per *account* or one attempt per *person*. If one per person is essential, evaluate stronger verification (for example passkeys plus additional controls), its limitations, privacy, accessibility, and user friction. Passkeys alone do not guarantee one account per human. Do not promise foolproof enforcement.
- [ ] **Abuse protection and monitoring.** Apply rate limits to account creation, recovery, starting attempts, and guess/submission endpoints; consider challenge-based protections, anomaly detection, audit logs, and an appeal/review process. IP addresses and device signals can be auxiliary risk signals, not definitive identity or automatic proof of cheating.
- [ ] **Security and privacy review.** Protect account tokens and recovery flows, use HTTPS, validate all inputs, use durable storage, and document data retention. Avoid invasive fingerprinting as a primary safeguard.

## Acceptance tests to design

- [ ] Start a ranked attempt, clear cache, and return with the *same recovered identity*: no second attempt is granted.
- [ ] Refresh, disconnect, or open another tab during a ranked attempt: resume the same attempt or receive the documented expired status; never create a fresh entitlement.
- [ ] Submit the same session twice or race two starts concurrently: at most one attempt and one final result are recorded.
- [ ] Tamper with submitted score, club IDs, attempts, answers, timestamps, or BK Points: the server rejects or independently computes the authoritative result.
- [ ] Try a new browser/incognito identity: document and test the chosen new-account abuse policy; do not falsely claim it proves a unique human.
- [ ] Recover an account on another device: previous ranked history remains, and spent attempts stay spent.
- [ ] Tie on BK Points: players receive the same rank regardless of accuracy.

## Scope and rollout

- **Normal Mode:** Remains available; do not add ranked-only friction to casual play.
- **Current leaderboard:** Its existing score validation does not prove that every submitted round was genuinely played. Do not present it as cheat-proof.
- **Ranked Mode:** Postponed. Treat the safeguards above as pre-launch design requirements, not completed features.
- **Next design decision:** Choose the ranked attempt window and the desired identity assurance level (account-level fairness versus stronger, more intrusive person-level controls) before building the mode.
