# Architecture Decision Records

One ADR per decision that is expensive to reverse. Not every decision — only the ones where being
wrong is costly to undo.

## Format

Each ADR is a single markdown file, numbered `NNNN-short-title.md`. State four things:

1. **Decision** — what was chosen, in one or two sentences.
2. **Alternatives considered** — what else was on the table, and why each was rejected.
3. **The specific consequence that makes this hard to reverse** — not "it would take effort," the
   actual mechanism (a schema migration, a native module boundary, a contract other teams build
   against).
4. **What evidence would make us revisit it** — a concrete signal, not "if it stops working."

Choosing *not* to build something, with this reasoning, is as valid an ADR as choosing to build
it — see the monorepo-not-microfrontends topic below.

## Outstanding topics

These were flagged as needing an ADR but haven't been written yet. Each needs the decision made
(not just documented) before the dependent features can be planned with confidence:

- `0003-wallet-scope.md` — read-only vs. connected wallet for the Finance Committee Safe.
- `0004-offline-sync-model.md` — cursor-based cache for server-owned data vs. any bidirectional
  sync, and the last-write-wins limitation for user-generated data (see
  [`slice-guidance.md`](../slice-guidance.md#offline-cache-and-sync)).

## Recorded

- [`0001-monorepo-not-microfrontends.md`](0001-monorepo-not-microfrontends.md)
- [`0002-sse-transport-on-react-native.md`](0002-sse-transport-on-react-native.md) — written
  during `/speckit-plan` for [`specs/001-agent-sse-transport`](../../specs/001-agent-sse-transport/).

Write each as its own file once the decision is actually made — don't pre-fill these with a
guessed answer.
