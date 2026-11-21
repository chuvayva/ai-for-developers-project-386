# Calendar

A calendar booking app in the spirit of cal.com: a host publishes free slots, a guest books a call. The stack is in place and the features are still to be built.

## Layout

A pnpm workspace with three packages:

- `api` is the TypeSpec contract. It is the single source of truth for the HTTP API.
- `server` is the Fastify backend on Node.
- `web` is the Vite, React and Mantine frontend.

## API first

Every change to the HTTP API starts in `api/main.tsp`. `pnpm --filter @calendar/api build` compiles it to `api/generated/openapi.yaml` and then to `api/generated/schema.d.ts`. `server` and `web` take request and response types from `@calendar/api`, so a contract change that the code has not followed fails the typecheck.

`api/generated/` is gitignored build output. Change it only by editing `api/main.tsp` and regenerating. Regenerate after a fresh clone and after every contract edit. `mise run check` does this for you.

## Verifying

`mise run check` is the one gate, and CI runs the same command. It runs the steps in `hk.pkl`: lint (oxlint), format (oxfmt), contract generation, typecheck, tests and the web build. A change is done when it passes.

`mise run fix` applies the safe lint and format fixes. `mise run setup` installs dependencies and the git hooks. The hooks lint and format staged files on commit, check the commit message, and run the full gate on push.

Lint rules stay on. When a rule cannot be satisfied, stop and ask for a human decision. An approved exception names one path and one rule and records the reason.

`mise.toml` pins every tool. Run `pnpm` and `node` through mise (`mise exec -- pnpm ...`) when the shell has no mise activation.

## Server

The server follows the Fastify Getting Started and Testing guides. `server/src/app.ts` exports `build(opts)`, which registers route plugins and never listens. `server/src/main.ts` is the only file that calls `listen`. Each group of routes is a plugin in `server/src/routes/`, registered under the `/api` prefix. Tests call `build()` and use `app.inject()`.

Node runs the TypeScript sources directly through type stripping, with no build step. Two rules follow from that:

- Relative imports carry the `.ts` extension.
- Only erasable syntax compiles. Use union types and plain objects in place of `enum`, `namespace` and constructor parameter properties.

## Web

Render components under test inside `MantineProvider`. `web/src/test-setup.ts` stubs `matchMedia` and `ResizeObserver`, which jsdom lacks and Mantine calls.

The Vite dev server proxies `/api` to the backend on `127.0.0.1:3000`.

## TypeScript versions

The project compiles with TypeScript 7. `tsc` runs only in `server` and `web`.

`api` also lists TypeScript 5, but nothing is compiled with it. `openapi-typescript` loads it as a library to print the generated types, and it cannot load TypeScript 7 ([openapi-typescript#2841](https://github.com/openapi-ts/openapi-typescript/issues/2841)). When that issue is fixed, move `api` to TypeScript 7 as well.

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`, with the summary in the imperative mood and lower case. commitlint enforces this in the `commit-msg` hook and in CI, with the allowed scopes listed in `.commitlintrc.json`.

- Leave the scope out for a change that spans packages.
- Mark a breaking contract change with `!` after the scope and a `BREAKING CHANGE:` footer.

Example: `feat(api): add booking slots endpoint`.

## Hexlet

`.github/workflows/hexlet-check.yml` belongs to Hexlet's automated checks. Leave it and the repository name unchanged.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues, through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels, each named after its role. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
