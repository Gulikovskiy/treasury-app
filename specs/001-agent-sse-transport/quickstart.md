# Quickstart: Agent Transport / SSE Streaming

Manual end-to-end verification. Automated coverage (parser, state machine, adapters,
render-batching) lives in each package's `vitest` suite per plan.md's Step Plan — this guide
checks the thing tests can't: that it actually works across a real network hop and, for native, on
a real Android target.

## Prerequisites

- `pnpm install` at the repo root.
- Web: any evergreen browser.
- Native: an Android device or emulator, and an Expo development build (not Expo Go — see
  `docs/slice-guidance.md`'s push/deep-linking section for why that constraint recurs elsewhere in
  this project; here it's simply what `expo/fetch` requires).

## User Story 1 — Stream a response on web

```
pnpm dev:web
```

1. Open the app, submit any prompt.
2. **Expected**: response text appears in more than one visible update — not all at once
   (SC-001).
3. Let it finish. **Expected**: final text matches exactly what the stub backend sent, no
   duplicated or missing fragments.

## User Story 2 — Cancel mid-stream

1. Submit a prompt, click cancel before it finishes.
2. **Expected**: rendering stops immediately.
3. Compare what's on screen against the server's own log of the stub response up to the same
   point (add a temporary `console.log` in the route handler for this check, or inspect the dev
   server's terminal output). **Expected**: identical (SC-002).
4. **Expected**: the message is visibly marked cancelled/incomplete, not shown as a normal
   finished answer.

## User Story 3 — Same flow on native

```
pnpm dev:mobile
```

(Run on an Android device/emulator with a development build installed.)

1. Repeat Story 1's steps in the native app.
2. **Expected**: same incremental-rendering behavior as web.
3. Repeat Story 2's cancel steps.
4. **Expected**: same server/client agreement guarantee holds.
5. Confirm no code path in the native app calls the global `fetch` for this request (grep
   `apps/mobile` and `packages/data`'s native adapter for `expo/fetch` usage — SC-004).

## Edge cases to try by hand

- Turn off networking (airplane mode / dev tools offline) mid-stream instead of clicking cancel.
  **Expected**: same cancelled/incomplete outcome as an explicit cancel (Edge Cases, Clarifications
  session).
- Submit a second prompt while the first is still streaming. **Expected**: the first is
  superseded/cancelled automatically; no stale text from it continues to appear.
