# Claude Code Instructions

## File Editing
Always edit files using absolute paths under `/Users/dan_nolan/personal/album-vis/src/`. Never edit files in the worktree at `.claude/worktrees/`. The dev server runs from the main project root and both the user and Claude edit the same files directly.

- Source files: `/Users/dan_nolan/personal/album-vis/src/`
- Config only: `/Users/dan_nolan/personal/album-vis/.claude/`
- Do not use git worktrees for this project

## Staging previews (Netlify)

Netlify hosts the site and builds a deploy preview for every pull request and branch push. That preview is the staging site for mobile review, so there's no manual deploy step:

- Push the feature branch and open or update its PR. Netlify bot comments the preview link on the PR.
- Build settings live in `netlify.toml`. `vite.config.js` uses base `/` when `NETLIFY=true`.
- Never commit `.claude/worktrees/`. A committed worktree shows up as a broken submodule and makes Netlify fail at "preparing repo".
