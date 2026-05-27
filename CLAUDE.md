# Claude Code Instructions

## File Editing
Always edit files using absolute paths under `/Users/dan_nolan/personal/album-vis/src/`. Never edit files in the worktree at `.claude/worktrees/`. The dev server runs from the main project root and both the user and Claude edit the same files directly.

- Source files: `/Users/dan_nolan/personal/album-vis/src/`
- Config only: `/Users/dan_nolan/personal/album-vis/.claude/`
- Do not use git worktrees for this project

## GitHub Pages Deployment (Staging)

GitHub Pages (`gh-pages` branch) is used as a **staging site** for mobile review. The workflow is:

- After pushing changes on a feature branch, also deploy to `gh-pages` so the user can review on mobile
- Do this at the end of every work session or whenever the user asks to preview
- The `gh-pages` branch already exists on origin

Deploy command (run from repo root after changes are committed):
```bash
npm run build && touch dist/.nojekyll && cd dist && git init && git add -A && git commit -m "Deploy to gh-pages" && git push -f $(git -C .. remote get-url origin) HEAD:gh-pages && cd ..
```

Note: `dist/` is gitignored, so `git subtree push` does not work. Instead, init a throwaway repo
inside dist and force-push directly to the gh-pages branch. This is the same thing the
`gh-pages` npm package does internally.

The `.nojekyll` file is required — without it, GitHub Actions tries to run Jekyll on the pre-built
Vite output and the Pages deployment fails.
