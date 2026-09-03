import { fetch as expoFetch } from "expo/fetch";
import type { AgentStreamFetch, StreamResponse } from "./useAgentStream";

export const AGENT_STREAM_ENDPOINT = "/api/agent/stream";

/**
 * Native transport (FR-003): `expo/fetch`, never the RN/global `fetch` — the
 * global fetch on React Native has no readable `response.body`, making
 * incremental parsing impossible (research.md §5, ADR 0002). Cancellation
 * uses the same `AbortSignal` contract as the web adapter, so
 * `packages/agent`'s parser/state machine needs no platform branching
 * (FR-002).
 *
 * Unlike the web adapter, native has no same-origin relative URL to call —
 * the caller must supply the API's absolute base URL.
 */
export function createNativeFetchAdapter(
  baseUrl: string,
  endpoint: string = AGENT_STREAM_ENDPOINT,
): AgentStreamFetch {
  return (request, signal) => {
    const response = expoFetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
    // `expo/fetch`'s FetchResponse.body is typed against the
    // `web-streams-polyfill` ReadableStream, not lib.dom's — a different
    // `getReader()` overload signature that TS treats as incompatible even
    // though both are spec-compliant ReadableStreams at runtime.
    return response as unknown as Promise<StreamResponse>;
  };
}
