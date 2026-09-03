import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAgentStream } from "../useAgentStream";
import { sseResponseFromFrames } from "./testStream";

describe("useAgentStream render batching (verifies FR-006, SC-003)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("flushes on a fixed 50ms interval, decoupling render count from token count", async () => {
    const tokenCount = 40;
    const frames = [
      ...Array.from({ length: tokenCount }, (_, i) => ({ type: "chunk", text: `t${i}` })),
      { type: "done" },
    ];
    const fetchImpl = vi.fn(async () => sseResponseFromFrames(frames));

    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useAgentStream("conv-1", fetchImpl);
    });
    const rendersBeforeSubmit = renderCount;

    act(() => {
      result.current.submit("What's our health factor?");
    });

    // Advance in 50ms steps (flushing microtasks between each) until the
    // session reaches a terminal state, or we give up after 1s.
    for (let i = 0; i < 20 && result.current.snapshot?.status === "streaming"; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
    }

    expect(result.current.snapshot?.status).toBe("complete");
    const finalContent = result.current.snapshot?.message.content ?? "";
    expect(finalContent).toBe(Array.from({ length: tokenCount }, (_, i) => `t${i}`).join(""));

    const rendersDuringStream = renderCount - rendersBeforeSubmit;
    // 40 tokens arrived essentially at once, but flushing is timer-driven:
    // far fewer renders than tokens proves render count is decoupled from
    // token count, not one render per token.
    expect(rendersDuringStream).toBeGreaterThan(0);
    expect(rendersDuringStream).toBeLessThan(tokenCount / 2);
  });
});
