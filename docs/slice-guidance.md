# Slice guidance

These are the traps specific to this stack, for the feature areas where they apply. They are
**not** universal — do not fold them into the constitution. Instead: when you're about to run
`/speckit-specify` for one of these areas, read the matching section below and work its
constraints into the feature description (and, once written, sanity-check the resulting spec's
Success Criteria and Non-Goals against it).

## Core domain package

This package has zero runtime dependencies except zod and viem. It must be importable from a
Node test, a Next.js server component, and a React Native app with no platform branching. Any
function that touches the network, the filesystem, or a React hook belongs in a different
package — flag it in Open Questions if you find one creeping in during spec/plan.

Financial math (health factor, utilization, borrow APY) must operate on `bigint`, never `number`.
Include a fixture set of known Aave positions with hand-verified expected outputs as the ground
truth — this is what the mandatory per-story tests should assert against.

## Agent transport / SSE

Prove this on web first, then port to native — but design the parser so the port is a transport
swap, not a rewrite.

Constraints to write in as Success Criteria or Functional Requirements:

- React Native's global `fetch` is XHR-backed and exposes no `response.body`. The native client
  must use `expo/fetch`. Include a criterion asserting the app never falls back to global fetch
  for streaming.
- Cancellation is not just client-side abort. A cancelled stream must leave the server and the
  local cache agreeing on the partial assistant message. Write a criterion for the state *after*
  cancellation, not just for the abort firing.
- Render throttling: token flushes are batched, not per-token. State the interval as a number.

Non-goal for this feature: any UI polish. A scrolling text view is enough.

## Streaming chat UI (native)

Performance criteria must be numbers on a real mid-range Android device, not a simulator. Name
the device in the spec's Manual Verification table.

- Completed messages do not re-render while a new message streams. Verify with a render counter,
  not by eye.
- Markdown is parsed per block and finished blocks are memoized. Assert that a completed block's
  parse function is not called again on subsequent tokens.
- Time to first token is measured and logged.

Non-goal: message editing, regeneration, attachments.

## Offline cache and sync

Frame this correctly: server-owned data (positions, rates, history) is a cursor-based cache, not
bidirectional sync. Only user-generated data (threads, saved queries, alert rules) is pushed.

- An outbox table with idempotency keys. Criterion: replaying the entire outbox twice produces
  identical server state. Test this directly.
- Drizzle schema lives in `packages/db` and is shared between expo-sqlite and the web driver. One
  migration folder. A criterion should assert migrations apply cleanly on both.
- Behavior when the app is killed mid-drain — put this in Edge Cases and give it a criterion.

Non-goal: conflict resolution UI. Last-write-wins with a server timestamp, documented as a
limitation in Assumptions.

## Charts

Criteria must include: point count after downsampling, and sustained frame rate during a pan
gesture on the named device.

- Downsampling happens before the data reaches the chart component. State the target point
  count.
- The touch cursor is driven by a Reanimated shared value and does not trigger a React render per
  frame. Assert this.
- Chart paths are derived, not recomputed inside render.

## Push and deep linking

Three separate failure modes, three separate criteria groups:

- Android 13+ runtime `POST_NOTIFICATIONS` permission, including the denied and the "denied
  twice" paths.
- Deep link handling from cold start AND from background resume. These are different code paths;
  write criteria for both. Cold start is where the bug will be.
- Remote push requires a development build, not Expo Go. State this as a precondition in the spec
  so Manual Verification steps are honest about what they actually exercise.

The alert evaluator is server-side. Note it as a non-goal here and give it its own feature.

## Release engineering

- EAS Update channels map to branches; runtime version uses the fingerprint policy. Criterion: an
  update built against an incompatible native build cannot be delivered. Verify by trying it.
- Staged rollout via rollout percentage, with the rollback command documented in Manual
  Verification and actually executed once as part of verifying this feature.
- Maestro runs on Android in GitHub Actions only. Two flows: cold start to dashboard, and send
  prompt to first token. iOS is explicitly a non-goal.
- The APK is built once and cached; the CI job must not rebuild per flow — write this as a
  Functional Requirement, not an aspiration.
