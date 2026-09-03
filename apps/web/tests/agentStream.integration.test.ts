import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAgentStream } from "@treasury/data";
import { createWebFetchAdapter } from "@treasury/data/webFetchAdapter";
import { POST } from "../app/api/agent/stream/route";

/**
 * Integration test against the *real* route handler (contracts/agent-stream.md),
 * bridged in-process instead of over a real network socket: the stubbed global
 * `fetch` builds a real `Request` and calls the real exported `POST` handler
 * directly. This exercises the actual canned-response/abort-handling logic in
 * apps/web/app/api/agent/stream/route.ts, not a mock.
 */
function stubFetchToRealHandler() {
  vi.stubGlobal(
    "fetch",
    async (input: string | URL, init?: RequestInit) =>
      POST(new Request(new URL(String(input), "http://localhost"), init)),
  );
}

describe("agent stream (US1, against the real route handler)", () => {
  beforeEach(() => {
    stubFetchToRealHandler();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it(
    "renders more than one incremental update before completion, and the final " +
      "text matches the server's content exactly (verifies FR-001, SC-001, Acceptance Scenario 1-2)",
    async () => {
      const fetchImpl = createWebFetchAdapter();
      const renderSnapshots: Array<string | undefined> = [];
      const { result } = renderHook(() => {
        const api = useAgentStream("conv-1", fetchImpl);
        renderSnapshots.push(api.snapshot?.message.content);
        return api;
      });

      act(() => {
        result.current.submit("What's our health factor?");
      });

      await waitFor(() => {
        expect(result.current.snapshot?.status).toBe("complete");
      });

      // More than one render occurred while content was still partial —
      // i.e. genuinely incremental, not one atomic update at the end.
      const partialContentRenders = renderSnapshots.filter(
        (content) => content !== undefined && content.length > 0,
      );
      const distinctContentLengths = new Set(partialContentRenders.map((c) => c!.length));
      expect(distinctContentLengths.size).toBeGreaterThan(1);

      const finalContent = result.current.snapshot?.message.content;
      expect(finalContent).toBe(
        "Based on the Safe's current position, " +
          "the health factor is comfortably above the target threshold, " +
          "with no immediate action required.",
      );
    },
  );
});
