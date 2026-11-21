# Calendar

A calendar booking app in the spirit of cal.com: a host publishes free slots, a guest books a call. The stack is in place and the features are still to be built.

## Layout

A pnpm workspace with three packages:

- `api` is the TypeSpec contract. It is the single source of truth for the HTTP API.
- `server` is the Fastify backend on Node.
- `web` is the Vite, React and Mantine frontend.

## API first

Every change to the HTTP API starts in `api/main.tsp`. `pnpm --filter @calendar/api build` compiles it to `api/generated/openapi.yaml` and then to `api/generated/schema.d.ts`. `server` and `web` take request and response types from `@calendar/api`, so a contract change that the code has not followed fails the typecheck.

`api/generated/` is gitignored build output. Regenerate it after a fresh clone and after every contract edit. `mise run check` does this as its first step.

## Verifying

`mise run check` is the one gate: install, generate the contract, typecheck, test, build. Run it before every commit and commit only when it passes.

`mise.toml` pins Node and pnpm. Run `pnpm` and `node` through mise (`mise exec -- pnpm ...`) when the shell has no mise activation.

## Server

The server follows the Fastify Getting Started and Testing guides. `server/src/app.ts` exports `build(opts)`, which registers route plugins and never listens. `server/src/main.ts` is the only file that calls `listen`. Each group of routes is a plugin in `server/src/routes/`, registered under the `/api` prefix. Tests call `build()` and use `app.inject()`.

Node runs the TypeScript sources directly through type stripping, with no build step. Two rules follow from that:

- Relative imports carry the `.ts` extension.
- Only erasable syntax compiles. Use union types and plain objects in place of `enum`, `namespace` and constructor parameter properties.

## Web

Render components under test inside `MantineProvider`. `web/src/test-setup.ts` stubs `matchMedia` and `ResizeObserver`, which jsdom lacks and Mantine calls.

The Vite dev server proxies `/api` to the backend on `127.0.0.1:3000`.

## TypeScript versions

`server` and `web` use TypeScript 7. `api` pins TypeScript 5 because `openapi-typescript` 7 requires it as a peer. Keep the two apart until `openapi-typescript` supports TypeScript 7.

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`, with the summary in the imperative mood and lower case.

- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `build`, `ci`.
- Scopes: `api`, `server`, `web`. Leave the scope out for a change that spans packages.
- Mark a breaking contract change with `!` after the scope and a `BREAKING CHANGE:` footer.

Example: `feat(api): add booking slots endpoint`.

## Hexlet

`.github/workflows/hexlet-check.yml` belongs to Hexlet's automated checks. Leave it and the repository name unchanged.
