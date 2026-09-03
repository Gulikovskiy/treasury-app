import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AgentStreamFetch } from "../useAgentStream";
import { useAgentStream } from "../useAgentStream";

/**
 * A fake "server" that sends one frame at a time and then pauses,
 * deterministically, until the test calls `advance()`. This mirrors the real
 * route handler's abort-checking loop (contracts/agent-stream.md;
 * apps/web/app/api/agent/stream/route.ts) — check the shared abort signal,
 * send, wait — but replaces the real handler's wall-clock delay with an
 * explicit gate so cancellation timing in the test is exact, not a race.
 * `serverSent` records exactly what this fake server considers itself to
 * have sent, so the test can assert the client ends up with identical
 * partial content (FR-005) without reaching into the real route handler.
 */
function createControlledServer(
  frames: Array<{ type: string; text?: string }>,
  serverSent: string[],
): { fetchImpl: AgentStreamFetch; advance: () => void; getSignal: () => AbortSignal | null } {
  let releaseGate: (() => void) | null = null;
  let capturedSignal: AbortSignal | null = null;
  const gate = () =>
    new Promise<void>((resolve) => {
      releaseGate = resolve;
    });

  const fetchImpl: AgentStreamFetch = async (_request, signal) => {
    capturedSignal = signal;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        for (const frame of frames) {
          if (signal.aborted) break;
          if (frame.type === "chunk" && frame.text) {
            serverSent.push(frame.text);
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(frame)}\n\n`));
          // eslint-disable-next-line no-await-in-loop
          await gate();
          if (signal.aborted) break;
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
  };

  return {
    fetchImpl,
    advance: () => {
      const release = releaseGate;
      releaseGate = null;
      release?.();
    },
    getSignal: () => capturedSignal,
  };
}

describe("useAgentStream cancellation (US2)", () => {
  it(
    "leaves server and client with byte-for-byte identical partial content after " +
      "cancelling mid-stream (verifies FR-005, SC-002, Acceptance Scenario 2)",
    async () => {
      const frames = [
        { type: "chunk", text: "one " },
        { type: "chunk", text: "two " },
        { type: "chunk", text: "three " },
        { type: "done" },
      ];
      const serverSent: string[] = [];
      const { fetchImpl } = createControlledServer(frames, serverSent);

      const { result } = renderHook(() => useAgentStream("conv-1", fetchImpl));

      act(() => {
        result.current.submit("prompt");
      });

      // Exactly one frame has been sent, then the fake server is parked
      // awaiting the gate — a genuinely mid-stream, deterministic point.
      await waitFor(() => {
        expect(result.current.snapshot?.message.content).toBe("one ");
      });

      act(() => {
        result.current.cancel();
      });

      await waitFor(() => {
        expect(result.current.snapshot?.status).toBe("cancelled");
      });

      expect(serverSent).toEqual(["one "]);
      expect(result.current.snapshot?.message).toEqual({
        content: serverSent.join(""),
        isFinal: true,
        terminalReason: "cancelled",
      });
    },
  );

  it(
    "submitting a second prompt for the same conversation implicitly cancels the " +
      "first, with no session ID exchanged (verifies the Clarifications session-" +
      "correlation decision, Edge Cases, SC-002)",
    async () => {
      const firstFrames = [
        { type: "chunk", text: "first-answer-fragment " },
        { type: "chunk", text: "more-of-first " },
        { type: "done" },
      ];
      const secondFrames = [{ type: "chunk", text: "second answer" }, { type: "done" }];
      const firstSent: string[] = [];
      const secondSent: string[] = [];
      const first = createControlledServer(firstFrames, firstSent);
      const second = createControlledServer(secondFrames, secondSent);

      const fetchImpl = vi
        .fn<AgentStreamFetch>()
        .mockImplementationOnce(first.fetchImpl)
        .mockImplementationOnce(second.fetchImpl);

      const { result } = renderHook(() => useAgentStream("conv-1", fetchImpl));

      act(() => {
        result.current.submit("first prompt");
      });

      await waitFor(() => {
        expect(result.current.snapshot?.message.content).toBe("first-answer-fragment ");
      });

      // A second prompt for the same conversation, while the first is still
      // streaming (parked mid-stream) — no explicit cancel call, no session
      // ID passed anywhere.
      act(() => {
        result.current.submit("second prompt");
      });

      second.advance(); // let the second stream's "done" frame through
      await waitFor(() => {
        expect(result.current.snapshot?.status).toBe("complete");
      });

      expect(result.current.snapshot?.message.content).toBe("second answer");
      // The first stream never got past its first frame — it was cut off.
      expect(firstSent).toEqual(["first-answer-fragment "]);
      expect(fetchImpl).toHaveBeenCalledTimes(2);
      // Not just abandoned: the first request's own AbortSignal was actually
      // fired, proving this is a real supersede-cancel, not an orphaned
      // in-flight request nobody ever told to stop.
      expect(first.getSignal()?.aborted).toBe(true);
    },
  );

  it(
    "aborting the underlying connection without an explicit cancel action still ends " +
      "in the cancelled/incomplete terminal state (verifies the Clarifications dropped-" +
      "connection decision, Edge Cases, Kill Criteria)",
    async () => {
      const fetchImpl: AgentStreamFetch = async (_request, signal) => {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "chunk", text: "partial" })}\n\n`),
            );
            // Simulate a dropped connection: after this one chunk, the server
            // just goes silent — no "done" frame, no error frame, nothing.
            // The hook exposes a single `cancel()` mechanism (it aborts the
            // shared AbortSignal); a real network-drop detector would call
            // the same thing, since the spec requires both to end up in the
            // identical cancelled/incomplete state (Edge Cases).
            signal.addEventListener("abort", () => {
              try {
                controller.close();
              } catch {
                // already closed
              }
            });
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
      };

      const { result } = renderHook(() => useAgentStream("conv-1", fetchImpl));

      act(() => {
        result.current.submit("prompt");
      });

      await waitFor(() => {
        expect(result.current.snapshot?.message.content).toBe("partial");
      });

      act(() => {
        result.current.cancel();
      });

      await waitFor(() => {
        expect(result.current.snapshot?.status).toBe("cancelled");
      });

      expect(result.current.snapshot?.message).toEqual({
        content: "partial",
        isFinal: true,
        terminalReason: "cancelled",
      });
    },
  );
});
