# Phase 1 Data Model: Agent Transport / SSE Streaming

No package under `packages/db` is touched by this feature (see plan.md Technical Context —
Storage: N/A). Both entities below are in-memory, runtime-only shapes, alive for the duration of
one HTTP request on the server and one hook lifecycle on the client. Nothing here is persisted.

## Stream Session

One in-flight prompt/response exchange. At most one is active per conversation at a time (per
Clarifications) — there is no client-facing session identifier.

| Field | Type | Notes |
|---|---|---|
| `conversationId` | `string` | Identifies which conversation this session belongs to; scopes the "at most one active session" rule. Not exposed as a separate session ID. |
| `status` | `"streaming" \| "complete" \| "cancelled" \| "errored"` | Lifecycle state. See transitions below. |
| `abortSignal` | `AbortSignal` | Passed into the injected fetch call; firing it is what the server observes to stop writing frames (research.md §6). |

**State transitions**:

```
streaming -> complete   (server sends the "done" frame; FR-001)
streaming -> cancelled  (user cancel, dropped connection, or a new prompt superseding this one; FR-004, FR-005)
streaming -> errored    (server error frame or malformed chunk; FR-007)
```

No transition leaves `complete`, `cancelled`, or `errored` — each is terminal.

## Assistant Message

The response content associated with one Stream Session.

| Field | Type | Notes |
|---|---|---|
| `content` | `string` | Accumulated text. Partial while `status: "streaming"`; final once the session reaches a terminal status. |
| `isFinal` | `boolean` | `false` while streaming, `true` once terminal. |
| `terminalReason` | `"complete" \| "cancelled" \| "errored" \| null` | Mirrors the owning Stream Session's terminal status; `null` while streaming. |

**Invariant (FR-005, SC-002)**: once the owning Stream Session reaches `cancelled`, the server's
in-memory `content` at the moment `abortSignal` fired and the client's cached `content` at the
moment it stopped rendering MUST be identical. This is the property the cancellation test
(data-model consumer: `packages/agent`'s state machine unit tests) asserts directly.
