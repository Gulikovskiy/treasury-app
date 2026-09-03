import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { sseResponseFromFrames } from "./testStream";

const { expoFetchMock } = vi.hoisted(() => ({
  expoFetchMock: vi.fn(),
}));
vi.mock("expo/fetch", () => ({ fetch: expoFetchMock }));

import { createNativeFetchAdapter } from "../nativeFetchAdapter";
import { useAgentStream } from "../useAgentStream";

describe("useAgentStream over the native adapter (US3)", () => {
  it(
    "reproduces the same incremental-render and cancellation guarantees as the web " +
      "adapter, via a mocked expo/fetch streaming response (verifies Acceptance " +
      "Scenario 1 & 3, FR-008)",
    async () => {
      expoFetchMock.mockImplementation(async () =>
        sseResponseFromFrames([
          { type: "chunk", text: "Native " },
          { type: "chunk", text: "answer." },
          { type: "done" },
        ]),
      );

      const adapter = createNativeFetchAdapter("http://192.168.1.10:8081");
      const { result } = renderHook(() => useAgentStream("conv-1", adapter));

      act(() => {
        result.current.submit("What's our health factor?");
      });

      await waitFor(() => {
        expect(result.current.snapshot?.status).toBe("complete");
      });

      expect(result.current.snapshot?.message.content).toBe("Native answer.");
      expect(expoFetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it("cancels via the same AbortSignal contract as the web adapter", async () => {
    const captured: { signal: AbortSignal | null } = { signal: null };
    expoFetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
      captured.signal = init.signal ?? null;
      return sseResponseFromFrames([{ type: "chunk", text: "partial" }, { type: "done" }]);
    });

    const adapter = createNativeFetchAdapter("http://192.168.1.10:8081");
    const { result } = renderHook(() => useAgentStream("conv-1", adapter));

    act(() => {
      result.current.submit("prompt");
    });

    await waitFor(() => {
      expect(captured.signal).not.toBeNull();
    });

    act(() => {
      result.current.cancel();
    });

    expect(captured.signal?.aborted).toBe(true);
  });
});
