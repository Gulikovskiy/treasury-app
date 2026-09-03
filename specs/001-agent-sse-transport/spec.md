# Feature Specification: Agent Transport / SSE Streaming

**Feature Branch**: `001-agent-sse-transport`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "I want to build a treasury analyst agent for the Aave Finance Committee Safe(already exist). Two surfaces (Next.js web, Expo React Native), one monorepo, shared TypeScript packages." — narrowed, per `docs/roadmap.md` risk-first ordering, to the first slice: proving the streaming transport mechanism (SSE parsing, cancellation, render batching) end-to-end on web, then porting the same parser to native.

## Clarifications

### Session 2026-09-01

- Q: When a new prompt is submitted while a previous response is still streaming, how does the system know which specific stream to cancel? → A: One active stream per conversation — a new prompt implicitly supersedes/cancels any in-flight stream for that conversation. No session ID is exposed to the client.
- Q: If the network connection drops mid-stream, should the client automatically reconnect and resume, or is the stream simply ended and the analyst has to resend? → A: Terminal — a dropped connection ends the stream in the cancelled/incomplete state (same guarantee as Story 2); no automatic reconnect/resume is attempted.
- Q: Does this transport feature need to enforce who is allowed to open a stream, or is authentication/authorization already handled by a layer above and simply assumed for this spec? → A: Out of scope — authentication/authorization happens upstream, before a prompt reaches this transport; this feature assumes an already-authorized caller.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask a question and watch the answer stream in on web (Priority: P1)

A Finance Committee member opens the web app, types a question about the Safe's treasury
position, and sees the assistant's answer appear incrementally as it's generated, rather than
waiting for the full response.

**Why this priority**: This is the riskiest unknown for the whole agent feature line — if
streaming transport doesn't work reliably, every later chat feature is blocked. Proving it on
web first, with no native complexity, isolates the risk.

**Independent Test**: Send a single prompt from the web app and observe the response text
appear in multiple incremental updates (not one atomic update at the end). Delivers value by
itself: a working streaming Q&A loop, even with a minimal/no-styling UI.

**Acceptance Scenarios**:

1. **Given** the web chat is open and idle, **When** the analyst submits a prompt, **Then** the
   first fragment of the assistant's response appears before the full response is complete.
2. **Given** a response is streaming, **When** the stream finishes normally, **Then** the
   displayed message matches exactly what the server sent, with no missing or duplicated
   fragments.
3. **Given** the server encounters an error mid-stream, **When** the error occurs, **Then** the
   client surfaces a typed error result to the caller (not an uncaught exception) and the partial
   message is preserved, marked as incomplete.

---

### User Story 2 - Cancel a response mid-stream (Priority: P2)

A Finance Committee member starts a query, realizes it's the wrong question, and cancels it
before the answer finishes.

**Why this priority**: Cancellation is the part of streaming transport most likely to leave
client and server disagreeing about conversation state — a correctness risk that must be proven
before this transport is reused anywhere else, but it depends on Story 1's basic stream loop
existing first.

**Independent Test**: Start a prompt, cancel it partway through, then inspect both the
server-side record and the client-side cache for that message — they must contain the identical
partial content. Independently verifiable without any UI beyond a cancel action.

**Acceptance Scenarios**:

1. **Given** a response is streaming, **When** the analyst cancels it, **Then** the client stops
   rendering new fragments immediately.
2. **Given** a response was cancelled, **When** the cancellation completes on both ends, **Then**
   the server's stored partial message and the client's cached partial message are
   byte-for-byte identical.
3. **Given** a response was cancelled, **When** the analyst views the conversation afterward,
   **Then** the message is marked as cancelled/incomplete rather than appearing as a normal
   finished answer.

---

### User Story 3 - Same chat, ported to native (Priority: P3)

A Finance Committee member opens the Expo app and gets the same streaming question-and-answer
behavior as on web.

**Why this priority**: Confirms the transport-agnostic design actually holds — the native port
should be a fetch-adapter swap, not a rewrite of the parser or state machine. Depends on Stories
1 and 2 being solid on web first.

**Independent Test**: Send the same prompt used in Story 1's test from the native app and
confirm incremental rendering and correct cancellation behavior, using the same
`packages/agent` parser/state machine with only the fetch implementation swapped.

**Acceptance Scenarios**:

1. **Given** the native app is open, **When** the analyst submits a prompt, **Then** the response
   streams incrementally, using `expo/fetch` rather than the global `fetch`.
2. **Given** the native port is complete, **When** `packages/agent`'s parsing/state-machine code
   is diffed against the web-only version, **Then** it is unchanged — only a new fetch adapter
   was added, per the package boundary rule that `packages/agent` is transport-agnostic.
3. **Given** a response is streaming on native, **When** the analyst cancels it, **Then** the same
   server/client agreement guarantee from Story 2 holds.

---

### Edge Cases

- What happens when the network connection drops mid-stream (not a clean cancel or server
  error)? This is a terminal outcome: the client must end up in the same "cancelled/incomplete"
  state as an explicit cancellation — it must not hang indefinitely or silently show a false
  "complete" state, and no automatic reconnect/resume is attempted; the analyst must resend the
  prompt to try again.
- What happens if the analyst submits a new prompt while a previous one is still streaming? Only
  one stream can be active per conversation, so the prior stream is implicitly cancelled per
  Story 2's guarantee before the new one starts — the client does not track or pass a session ID
  to make this happen.
- What happens if the server sends a malformed or unexpected chunk? The parser must surface a
  typed error result rather than throwing, and the partial message up to that point is preserved.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST stream assistant responses to the client incrementally as they are
  generated, rather than only delivering the complete response at once.
- **FR-002**: The stream parsing and cancellation state machine MUST live in `packages/agent` and
  MUST NOT depend on any specific fetch implementation — the fetch call is injected by the web or
  native caller.
- **FR-003**: The native caller MUST use `expo/fetch` for streaming requests. The system MUST NOT
  fall back to the global `fetch` API for streaming on native under any circumstance, since global
  `fetch` on React Native exposes no readable response body.
- **FR-004**: Users MUST be able to cancel an in-flight response from both web and native.
- **FR-005**: When a stream is cancelled (by the user, a dropped connection, or a new prompt
  superseding it), the server-recorded partial assistant message and the client-cached partial
  assistant message MUST end up identical once cancellation completes on both sides.
- **FR-006**: Rendering of incoming tokens MUST be batched on a fixed flush interval rather than
  triggering one render per token. The interval is 50ms.
- **FR-007**: Errors during streaming (server error, malformed chunk, dropped connection) MUST be
  surfaced to the caller as a typed result, never as a thrown/uncaught exception, per the
  project's typed-boundary convention.
- **FR-008**: The same prompt/response/cancel flow MUST work on both the web and native surfaces,
  using the shared `packages/agent` package with only the transport (fetch) implementation
  differing per platform.

### Key Entities

- **Stream Session**: One in-flight prompt/response exchange. Tracks its own lifecycle state
  (streaming, complete, cancelled, errored) and correlates a client-side abort with server-side
  termination of the same session. At most one Stream Session is active per conversation at a
  time; there is no client-facing session ID — a new prompt implicitly supersedes the previous
  session for that conversation.
- **Assistant Message**: The response content associated with a Stream Session. Exists in a
  partial form while streaming and a final form (complete or cancelled) once the session ends.
  Partial and final forms must agree between client and server per FR-005.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of test runs, the first fragment of a streamed response is visible to the
  analyst before the response is fully generated (verified by an automated test asserting more
  than one render update occurs per response).
- **SC-002**: In 100% of cancellation test runs (user-initiated, connection-drop, and
  superseded-by-new-prompt), the server-recorded and client-cached partial message content are
  identical.
- **SC-003**: Token-driven UI updates occur at the fixed 50ms batch interval, not per-token —
  verified by a render-count assertion showing render count is decoupled from token count.
- **SC-004**: An automated check (test or lint rule) confirms zero uses of the global `fetch` API
  for streaming requests anywhere in the native app code.
- **SC-005**: Porting from web to native requires zero changes to `packages/agent`'s existing
  parsing/state-machine files — verified by the native port's diff touching only a new fetch
  adapter file.

## Non-Goals

- Any UI polish for the chat surface. A minimal, unstyled scrolling text view is sufficient to
  verify this feature; visual design is a separate feature.
- The agent's actual reasoning/answer quality (what the assistant says). This feature specifies
  only the transport mechanism — how a response gets from server to client — not the content
  generation behind it.
- Message editing, regeneration, or attachments.
- Automatic reconnect/resume of a dropped connection. A network drop mid-stream is a terminal
  outcome (same as an explicit cancellation); the analyst must resend the prompt.
- Resuming/replaying a stream after the app is fully closed and reopened (that belongs to the
  offline cache/sync slice, which owns persisted conversation state).
- iOS-specific verification (per the project's Android-first constraint); native testing targets
  Android.
- Authentication/authorization enforcement. This transport assumes the caller is already
  authenticated and authorized by an upstream layer before a prompt ever reaches it; this feature
  is not itself a security boundary.

## Kill Criteria

- If `packages/agent`'s parser cannot be kept transport-agnostic — i.e., porting to native turns
  out to require changing the parsing/state-machine logic itself, not just swapping the fetch
  call — the transport-agnostic design assumption behind this whole feature line is wrong, and
  the approach must be re-planned before continuing to any dependent chat feature.
- If cancellation cannot reliably produce identical server/client partial state (SC-002) after
  reasonable engineering effort, streaming must be re-scoped to a simpler non-cancellable or
  coarser-grained model rather than shipping a transport with known state-divergence bugs.

## Assumptions

- The underlying agent/model call that produces response content already exists or is stubbed
  with deterministic canned responses for the purposes of testing this feature; this spec covers
  the transport layer only, not the reasoning behind the answers.
- A single authenticated Finance Committee member context is assumed per session; multi-user
  concurrent access to the same conversation is out of scope. Authentication and authorization are
  established by an upstream layer before a prompt reaches this transport; this feature does not
  verify caller identity or permissions itself (see Non-Goals).
- The Aave Finance Committee Safe referenced in the input already exists and its address/data are
  available to whatever minimal backend this feature streams from; onboarding a new Safe is out
  of scope.
- The 50ms render-batching interval (FR-006) is a starting default per `docs/slice-guidance.md`'s
  instruction to state the interval as a number; it may be tuned later based on measured
  performance without requiring a spec amendment, provided the "batched, not per-token" guarantee
  in SC-003 still holds.
