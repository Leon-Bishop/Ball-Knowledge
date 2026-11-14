# Ball Knowledge v3.3 — Dark-mode club autocomplete fix

In dark mode the hovered club suggestion used a light purple background with white text, making the club name difficult to read.

**Fixed:** dark autocomplete options now have explicit dark-purple default, hover, keyboard-focus, and pressed states with white text and a visible border. Light-mode options retain dark text on a light hover background.

The fix does not change any gameplay, data, league selection, or translation behavior.

## Publish to GitHub Pages
Extract the GitHub repository ZIP and replace your existing repository files on the `main` branch. Keep **Settings → Pages → Source: GitHub Actions** and use the included `.github/workflows/deploy.yml`.
