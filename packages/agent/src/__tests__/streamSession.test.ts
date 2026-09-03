import { describe, expect, it } from "vitest";
import { createStreamSession } from "../streamSession";

describe("streamSession", () => {
  it("starts in the streaming state with empty content", () => {
    const session = createStreamSession("conv-1");
    const snapshot = session.getSnapshot();
    expect(snapshot.status).toBe("streaming");
    expect(snapshot.message).toEqual({ content: "", isFinal: false, terminalReason: null });
  });

  it("accumulates chunk frames into partial content while streaming", () => {
    const session = createStreamSession("conv-1");
    session.handleFrame({ type: "chunk", text: "Hel" });
    session.handleFrame({ type: "chunk", text: "lo" });
    expect(session.getSnapshot().message.content).toBe("Hello");
    expect(session.getSnapshot().status).toBe("streaming");
  });

  it("transitions streaming -> complete on a done frame (verifies FR-001)", () => {
    const session = createStreamSession("conv-1");
    session.handleFrame({ type: "chunk", text: "Hello" });
    session.handleFrame({ type: "done" });
    const snapshot = session.getSnapshot();
    expect(snapshot.status).toBe("complete");
    expect(snapshot.message).toEqual({
      content: "Hello",
      isFinal: true,
      terminalReason: "complete",
    });
  });

  it("transitions streaming -> errored on an error frame, preserving partial content (verifies FR-007)", () => {
    const session = createStreamSession("conv-1");
    session.handleFrame({ type: "chunk", text: "Hel" });
    session.handleFrame({ type: "error", message: "boom" });
    const snapshot = session.getSnapshot();
    expect(snapshot.status).toBe("errored");
    expect(snapshot.message).toEqual({
      content: "Hel",
      isFinal: true,
      terminalReason: "errored",
    });
  });

  it("transitions streaming -> cancelled on cancel(), preserving partial content (verifies FR-004, FR-005)", () => {
    const session = createStreamSession("conv-1");
    session.handleFrame({ type: "chunk", text: "Par" });
    session.cancel();
    const snapshot = session.getSnapshot();
    expect(snapshot.status).toBe("cancelled");
    expect(snapshot.message).toEqual({
      content: "Par",
      isFinal: true,
      terminalReason: "cancelled",
    });
  });

  it("ignores frames and further cancellation once a terminal state is reached (data-model.md: no transition leaves a terminal state)", () => {
    const session = createStreamSession("conv-1");
    session.handleFrame({ type: "chunk", text: "Hello" });
    session.handleFrame({ type: "done" });
    session.handleFrame({ type: "chunk", text: " ignored" });
    session.cancel();
    const snapshot = session.getSnapshot();
    expect(snapshot.status).toBe("complete");
    expect(snapshot.message.content).toBe("Hello");
  });
});
