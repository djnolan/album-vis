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
npm run build && git subtree push --prefix dist origin gh-pages
```

No additional packages needed — pure git subtree push of the `dist/` folder.
