# 0002. SSE transport on React Native

## Decision

The native app streams assistant responses using `expo/fetch` (not React Native's global
`fetch`), reading the response body incrementally and driving cancellation through the standard
`AbortController`/`AbortSignal` contract — the same contract the web adapter uses with the global
`fetch`. A single parser and session state machine, living in `packages/agent`, consumes events
from either adapter; only the fetch call itself is platform-specific. See
[`specs/001-agent-sse-transport/research.md`](../../specs/001-agent-sse-transport/research.md)
(§5) for the full comparison.

## Alternatives considered

- **React Native's global `fetch`**: rejected. It is XHR-backed and does not expose a readable
  `response.body`, making incremental (token-by-token) consumption impossible — the client would
  have to wait for the entire response before showing anything, defeating the purpose of
  streaming.
- **WebSocket transport**: rejected. This is a one-request/one-response shape (one prompt, one
  streamed answer), not a bidirectional persistent-connection use case; a WebSocket would add
  connection-lifecycle and reconnection complexity with no corresponding benefit over SSE here.
- **Polling for native only**: rejected. It would give native a fundamentally different
  consumption model than web (batches of complete text instead of true incremental tokens),
  breaking the goal of one transport-agnostic parser shared across platforms.

## The specific consequence that makes this hard to reverse

`packages/agent`'s parser and state machine are built assuming both platforms hand it the same
shape: a byte stream from a fetch `Response.body`, cancelled via `AbortSignal`. If `expo/fetch`
turns out not to support this reliably on-device, native would need an entirely different
consumption model (e.g., polling, or a native module bridging a raw socket), which is not a
parser tweak — it means `packages/agent` can no longer be transport-agnostic for both platforms,
and downstream chat features already built against the shared hook (`packages/data`'s
`useAgentStream`) would need to special-case native.

## What evidence would make us revisit it

`expo/fetch` failing to expose a working, incrementally-readable `response.body` or failing to
honor `AbortSignal` cancellation when actually run on a physical or emulated Android device (not
just in a simulator/dev-server proxy) — this is this feature's Kill Criteria condition in
[`spec.md`](../../specs/001-agent-sse-transport/spec.md).
