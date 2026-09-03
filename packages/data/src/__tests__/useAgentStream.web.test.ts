import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAgentStream } from "../useAgentStream";
import { sseResponseFromFrames } from "./testStream";

describe("useAgentStream error handling (US1)", () => {
  it(
    "surfaces a mid-stream error frame as a typed result, not a thrown exception, " +
      "preserving the partial message as incomplete (verifies FR-007, Acceptance Scenario 3)",
    async () => {
      const fetchImpl = vi.fn(async () =>
        sseResponseFromFrames([
          { type: "chunk", text: "Partial answer before " },
          { type: "error", message: "upstream failure" },
        ]),
      );

      const { result } = renderHook(() => useAgentStream("conv-1", fetchImpl));

      act(() => {
        result.current.submit("What's our health factor?");
      });

      await waitFor(() => {
        expect(result.current.snapshot?.status).toBe("errored");
      });

      const snapshot = result.current.snapshot;
      expect(snapshot?.status).toBe("errored");
      expect(snapshot?.message).toEqual({
        content: "Partial answer before ",
        isFinal: true,
        terminalReason: "errored",
      });
    },
  );
});
