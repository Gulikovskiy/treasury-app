# Project quick reference

This is the quick-reference copy for Claude Code sessions. **Authoritative principles live in
[`.specify/memory/constitution.md`](.specify/memory/constitution.md)** — if this file and the
constitution ever disagree, the constitution wins and this file is stale and should be updated.

## What this is

A treasury analyst agent for the Aave Finance Committee Safe. Two surfaces (Next.js web, Expo
React Native), one monorepo, shared TypeScript packages. Spec-driven via spec-kit
(`/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`).

## Non-negotiables

- TypeScript only. No Python, no Python sidecar services.
- Monorepo with shared packages. **Not** microfrontends, **not** Module Federation, **not**
  Re.Pack. Metro stays as the native bundler.
- No `react-native-web`. Web and native have separate component layers over a shared token
  package.
- Shared code stops at the data-hook layer. Nothing that renders is shared.
- Android must stay buildable without a macOS upgrade. iOS work is deferred and must never block
  a slice/feature.

## Package boundaries

Dependencies flow one direction only. A package may import from packages below it, never above.

```
apps/web  apps/mobile        <- may import anything below
packages/ui-web  ui-native   <- may import ui-tokens, data, core
packages/data                <- may import db, agent, core
packages/db  packages/agent  <- may import core
packages/core                <- imports nothing internal
packages/ui-tokens           <- imports nothing internal
```

- `core` has zero internal imports and no platform APIs. No React, no fetch, no fs.
- `agent` is transport-agnostic. Parsing and state machine only; the fetch implementation is
  injected.
- `db` holds the Drizzle schema in the SQLite dialect and a single migrations folder shared by
  both drivers.

Crossing a boundary requires asking first.

## Ask before

- Adding any dependency. Say what it does and what it replaces.
- Changing a package boundary or the dependency direction above.
- Touching `app.json`, `eas.json`, native config, or anything under `ios/` or `android/`.
- Modifying a test to make it pass.
- Editing a spec's approved sections outside of a dated amendment.

## Conventions

- Financial values are `bigint`. Never `number`. Format at the render boundary only.
- Every exported function in `core` has a test with a hand-verified fixture.
- Errors are typed results at package boundaries, not thrown exceptions.
- No `any`. No `as` casts without an adjacent comment explaining why the compiler is wrong.

## Commands

```
pnpm typecheck     # must pass before any feature closes
pnpm lint
pnpm test          # vitest, all packages
pnpm dev:web
pnpm dev:mobile
```

## Working style

- A spec is only a spec if it can fail: every acceptance criterion must be checkable by a
  command, a test, or a measured number with a threshold. If it can't be made checkable, it goes
  under the spec's Open Questions section instead of being written as a criterion.
- Plans before code. Keep `/speckit-plan` output scannable — if it sprawls, the feature is too
  big and should be split.
- Tests before implementation, derived from the spec, not from the code.
- When the spec is wrong, say so and stop. Do not route around it.

## Slice-specific guardrails

When specifying one of these areas, read the matching section in
[`docs/slice-guidance.md`](docs/slice-guidance.md) first and fold its constraints into the
`/speckit-specify` description: the core domain package, agent transport/SSE, streaming chat UI,
offline cache/sync, charts, push & deep linking, release engineering.

## Roadmap and decisions

- [`docs/roadmap.md`](docs/roadmap.md) — the feature/slice list, ordered riskiest-unknown-first.
- [`docs/adr/`](docs/adr/) — architecture decision records for anything expensive to reverse.
