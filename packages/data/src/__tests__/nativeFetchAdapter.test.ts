import { afterEach, describe, expect, it, vi } from "vitest";

const { expoFetchMock } = vi.hoisted(() => ({
  expoFetchMock: vi.fn(async () => new Response(null, { status: 200 })),
}));
vi.mock("expo/fetch", () => ({ fetch: expoFetchMock }));

import { createNativeFetchAdapter } from "../nativeFetchAdapter";

describe("nativeFetchAdapter", () => {
  afterEach(() => {
    expoFetchMock.mockClear();
    vi.restoreAllMocks();
  });

  it("always calls expo/fetch and never the global fetch (verifies FR-003, SC-004)", async () => {
    const globalFetchSpy = vi.spyOn(globalThis, "fetch");
    const adapter = createNativeFetchAdapter("http://192.168.1.10:8081");
    const controller = new AbortController();

    await adapter({ conversationId: "conv-1", prompt: "What's our health factor?" }, controller.signal);

    expect(expoFetchMock).toHaveBeenCalledTimes(1);
    expect(expoFetchMock).toHaveBeenCalledWith(
      "http://192.168.1.10:8081/api/agent/stream",
      expect.objectContaining({
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({ conversationId: "conv-1", prompt: "What's our health factor?" }),
      }),
    );
    expect(globalFetchSpy).not.toHaveBeenCalled();
  });
});
