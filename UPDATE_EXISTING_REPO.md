# Update your existing GitHub Pages repository

You do **not** need to create a second repository.

1. Download and extract `ball-knowledge-finite-github-repository.zip`.
2. Upload/commit the **contents** of the extracted directory to the **root of the `main` branch** of your existing GitHub repository. Preserve `.github/workflows/deploy.yml`, `assets/`, `scripts/` and the JSON files. Uploading a ZIP as a single file does not deploy the game.
3. In **Settings → Pages**, select **GitHub Actions** as the source. Do **not** create a second Static HTML or Jekyll workflow: use the included `Ball Knowledge - test and publish` workflow.
4. Under **Actions**, confirm the `Ball Knowledge - test and publish` run succeeds. Then visit your Pages URL and hard-refresh (or test in a private tab).

**Alternative:** For manual non-GitHub-Actions hosting, the separate `ball-knowledge-finite-deployable-site.zip` contains the `dist/` website ready to upload to the host's document root. It is not the ZIP to upload when using this repository's GitHub Actions workflow.

## Session behavior

- Number of rounds = number of **unique clubs** selected, after applying difficulty filters.
- A club can appear as the secret answer only once in a session.
- Each round has at most five guesses; once all rounds are completed, the final total score appears automatically.
- The original England source contains Ipswich Town twice; the game counts it once and therefore includes 19 unique England teams.
