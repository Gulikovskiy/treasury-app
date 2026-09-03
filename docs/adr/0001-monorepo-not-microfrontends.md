# 0001. Monorepo, not microfrontends

## Decision

One pnpm + Turborepo monorepo (`apps/web`, `apps/mobile`, `packages/*`) with shared TypeScript
packages, following the one-directional package-boundary diagram in the constitution. No
microfrontends, no Module Federation, and no Re.Pack for the native side; Metro remains the native
bundler.

## Alternatives considered

- **Microfrontends / Module Federation for web**: rejected. This project has exactly two
  consumer-facing surfaces (one web app, one mobile app), not multiple independently-deployed web
  teams — the coordination cost Module Federation exists to solve doesn't apply, and it would add
  a runtime module-loading layer with no corresponding benefit.
- **Re.Pack for the native side**: rejected. Re.Pack exists to bring Module Federation-style
  dynamic loading to React Native by replacing Metro; since Module Federation itself is rejected
  above, there is nothing for Re.Pack to federate, and it would mean carrying a second bundler
  story purely for symmetry.
- **Separate repositories per surface**: rejected. The two surfaces share domain logic (financial
  math, agent transport, data-fetching hooks per Principle IV); separate repos would force that
  logic to be duplicated or published/versioned as external packages, adding release-coordination
  overhead for no isolation benefit at this project's size.

## The specific consequence that makes this hard to reverse

Every shared package's import boundaries (`packages/core` has zero internal imports, `packages/agent`
is fetch-agnostic, `packages/data` is the hook boundary) are designed around same-repo, same-build
imports with no publish step. Splitting into microfrontends or separate repos later would mean
introducing a package registry (internal npm registry or equivalent), versioning and publishing
every shared package, and rewriting every cross-package import — not a config change.

## What evidence would make us revisit it

A second independent team needing to ship a third surface (e.g. a separate admin web app) on its
own release cadence, where coordinating through this single monorepo's CI/CD becomes the
bottleneck for their releases specifically — not general repo size or build time growth, which
Turborepo's caching is designed to absorb.
