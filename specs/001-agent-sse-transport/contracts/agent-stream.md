# Contract: Agent Stream Endpoint

## `POST /api/agent/stream`

Hosted by the Next.js route handler in `apps/web`; called by both the web page and the native app
over plain HTTP (research.md §2).

### Request

```json
{
  "conversationId": "string",
  "prompt": "string"
}
```

Submitting a request for a `conversationId` that already has an active stream implicitly
supersedes (cancels) the prior stream before the new one starts (per Clarifications — no separate
cancel call is needed for this case).

### Response

`Content-Type: text/event-stream`. Frames, in order:

1. Zero or more:
   ```
   data: {"type":"chunk","text":"<fragment>"}

   ```
2. Exactly one terminal frame:
   ```
   data: {"type":"done"}

   ```
   or, on failure:
   ```
   data: {"type":"error","message":"<human-readable message>"}

   ```

Every frame's `data:` payload is one JSON object; `type` discriminates the three cases. This is
the shape `packages/agent`'s parser (`parseStream.ts`) turns into typed events for the state
machine (FR-002).

### Cancellation

No separate cancel endpoint. The caller cancels by aborting the underlying fetch
(`AbortController.abort()` on the `AbortSignal` passed into the request). The server observes
`request.signal`'s `abort` event and stops emitting frames; whatever `chunk` frames were already
sent is exactly the partial content both sides must agree on (FR-005, data-model.md's Stream
Session invariant).

### Errors

- A malformed request body → standard HTTP 4xx, not a stream (no `text/event-stream` response
  started yet).
- A failure after the stream has started → the `error` frame above, not an HTTP-level error (the
  headers are already committed). The client's parser MUST surface this as a typed error result to
  its caller, never throw (FR-007).
