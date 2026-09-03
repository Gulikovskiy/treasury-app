import type { AgentStreamFetch } from "./useAgentStream";

export const AGENT_STREAM_ENDPOINT = "/api/agent/stream";

/**
 * Web transport: the global `fetch` + `AbortController` (FR-001). Uses the
 * global `fetch` directly rather than importing the route handler, so this
 * package stays decoupled from `apps/web` per the package-boundary rules.
 */
export function createWebFetchAdapter(endpoint: string = AGENT_STREAM_ENDPOINT): AgentStreamFetch {
  return (request, signal) =>
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
}
