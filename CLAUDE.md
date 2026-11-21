# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Architecture, conventions and the commit format live in AGENTS.md, the single source of truth shared with other coding agents. Edit AGENTS.md when they change.

@AGENTS.md

## Commands

```bash
mise run setup                                    # once per clone: install dependencies and git hooks
mise run check                                    # the full gate, same as CI
mise run fix                                      # apply safe lint and format fixes
pnpm --filter @calendar/api build                 # regenerate api/generated/ after editing api/main.tsp
pnpm --filter @calendar/server dev                # backend with watch on http://127.0.0.1:3000
pnpm --filter @calendar/web dev                   # Vite dev server, proxies /api to the backend
pnpm -r typecheck                                 # needs api/generated/ to exist
pnpm --filter @calendar/server test               # one package's tests
pnpm --filter @calendar/web exec vitest run src/App.test.tsx   # one test file
pnpm --filter @calendar/web exec vitest run -t "renders the app heading"   # one test by name
```
