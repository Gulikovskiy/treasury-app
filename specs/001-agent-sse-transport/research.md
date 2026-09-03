# Phase 0 Research: Agent Transport / SSE Streaming

## 1. Monorepo scaffold

**Decision**: pnpm workspaces + Turborepo, with a single root `tsconfig.base.json` extended by
each package/app.

**Rationale**: Mandated by Constitution Principle II, not a fresh choice — this entry documents
the concrete files needed since none exist yet: `pnpm-workspace.yaml` listing `apps/*` and
`packages/*`, a root `turbo.json` with `dev`/`build`/`test`/`lint` pipelines, and per-package
`package.json`s with their own `tsconfig.json` extending the base.

**Alternatives considered**: None — this is a non-negotiable, not a decision point for this
feature.

## 2. Where the backend lives

**Decision**: A Next.js App Router route handler inside `apps/web` (`app/api/agent/stream/route.ts`)
serves the SSE stream for both the web page and the native app's HTTP requests. No separate
`apps/api` package.

**Rationale**: The constitution's package-boundary diagram has no backend-service package —
`apps/web`/`apps/mobile` sit at the top and may import anything below. Next.js Route Handlers can
return a `ReadableStream` with the right SSE headers, giving us a real HTTP server without a
second deployable.

**Alternatives considered**: A standalone Node/Express server in a new `apps/api` package —
rejected as an unjustified package-boundary change (would require asking the user per Constitution
II) for a need Next.js already satisfies.

## 3. SSE wire format

**Decision**: Standard `text/event-stream` framing (`data: <json>\n\n` per event, blank line as
the frame delimiter), with a final `event: done` frame and a typed `event: error` frame for
mid-stream failures.

**Rationale**: This is what "SSE" in the feature name and `docs/slice-guidance.md`'s "Agent
transport / SSE" section already commit to; using the real spec format (rather than bespoke
newline-delimited JSON) lets us use a spec-compliant parser instead of a bespoke one.

**Alternatives considered**: NDJSON over plain chunked transfer — simpler to hand-roll, but
diverges from the "SSE" name already fixed at the roadmap/slice-guidance level, and forfeits the
chunk-boundary-safe parsing that `text/event-stream` parsers already solve.

## 4. Client-side parsing — `eventsource-parser`

**Decision**: Use the `eventsource-parser` package inside `packages/agent` to turn raw
`text/event-stream` bytes (from either a web or native fetch response body reader) into discrete
events, feeding a hand-written session state machine.

**Rationale**: A single network chunk does not necessarily align with one SSE frame — a `data:`
line or the blank-line delimiter can split across chunk boundaries. `eventsource-parser` is a
small (~2KB), dependency-free, widely-used library (e.g. the transport layer under the Vercel AI
SDK and the OpenAI SDK's streaming clients) that already handles this correctly. Confirmed with
the user during planning as the preferred option over hand-rolling.

**Alternatives considered**: Hand-rolled buffering + `split('\n\n')` parser — rejected (user
decision) because it re-implements spec edge cases (chunk-boundary splits, multi-line `data:`
fields, comment lines) that are easy to get subtly wrong, for a feature whose whole point is
transport correctness.

## 5. Native fetch strategy — resolves ADR 0002

**Decision**: `packages/data`'s native adapter uses `expo/fetch` (not the RN/global `fetch`) to
get a real, spec-compliant `Response.body` `ReadableStream`, and drives cancellation via the
standard `AbortController`/`AbortSignal` passed into that call. The web adapter uses the same
`AbortController` pattern with the global `fetch`, so `packages/agent`'s state machine sees an
identical cancellation contract on both platforms — only the fetch call itself differs.

**Rationale**: React Native's built-in global `fetch` is XHR-backed and does not expose a readable
`response.body`, making incremental parsing impossible. `expo/fetch` (available in current Expo
SDKs) is a fetch implementation backed by a streaming-capable native networking layer and does
expose `response.body`, and it implements the standard `AbortSignal` cancellation contract — so no
platform-specific cancellation logic is needed in `packages/agent`.

**Alternatives considered**: A WebSocket-based transport — rejected, bigger surface change (needs
a persistent connection and a different server model) for no benefit over SSE for this
one-request/one-response shape. A polling fallback for native — rejected, defeats the purpose of
proving true incremental streaming.

**Consequence if wrong**: If `expo/fetch` turns out not to support streaming or abort correctly on
a real Android device (only verifiable by running on-device, not a simulator), the whole
transport-agnostic design (`packages/agent` sharing one parser across platforms) breaks and the
native path needs a fundamentally different mechanism — this is exactly the Kill Criteria
condition in spec.md. This decision and its revisit signal are recorded in
`docs/adr/0002-sse-transport-on-react-native.md`.

## 6. Server-side cancellation detection

**Decision**: The Next.js route handler observes the incoming request's `AbortSignal`
(`request.signal`) to detect that the client aborted or the connection dropped, and stops writing
further SSE frames at that point — the in-memory partial message recorded server-side is exactly
what had been written up to that signal firing.

**Rationale**: This is the mechanism that makes FR-005's server/client agreement guarantee
achievable without a separate explicit "cancel" endpoint: closing the HTTP connection (whether by
`AbortController.abort()` on the client or a real network drop) is the same signal on the server
side either way, which is also why Clarifications resolved dropped-connection handling to reuse
the same cancelled/incomplete state as an explicit cancel.

**Alternatives considered**: A separate `POST /api/agent/cancel` endpoint — rejected as
unnecessary complexity; it would require correlating a session ID across two requests, which
Clarifications already decided against (no client-facing session ID).

## 7. Render batching

**Decision**: The 50ms flush interval from FR-006 is implemented in `packages/data`'s hook
(`useAgentStream`), buffering incoming parsed tokens/fragments and flushing accumulated text to
React state on a fixed timer, not on every parser event.

**Rationale**: Keeps the batching logic in the one shared hook (Principle IV: shared code stops at
the hook layer) rather than duplicating a timer in both apps' UI code.

**Alternatives considered**: Batching inside `packages/agent`'s state machine itself — rejected,
because render-batching is a UI-consumption concern, not a transport/parsing concern, and mixing
them would blur `packages/agent`'s "parsing and state machine only" boundary.
