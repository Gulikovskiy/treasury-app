import type { AssistantMessage, StreamFrame, StreamSessionSnapshot, StreamStatus } from "./types";

export interface StreamSession {
  readonly conversationId: string;
  getSnapshot(): StreamSessionSnapshot;
  /** Feed a parsed frame. Ignored once a terminal state has been reached. */
  handleFrame(frame: StreamFrame): void;
  /** Transition to cancelled. Ignored once a terminal state has been reached. */
  cancel(): void;
}

/**
 * The session lifecycle state machine (data-model.md). Every transition out
 * of "streaming" is terminal — nothing can leave complete/cancelled/errored.
 */
export function createStreamSession(conversationId: string): StreamSession {
  let status: StreamStatus = "streaming";
  let content = "";
  let terminalReason: AssistantMessage["terminalReason"] = null;

  function isTerminal(): boolean {
    return status !== "streaming";
  }

  return {
    conversationId,

    getSnapshot(): StreamSessionSnapshot {
      return {
        conversationId,
        status,
        message: {
          content,
          isFinal: status !== "streaming",
          terminalReason,
        },
      };
    },

    handleFrame(frame: StreamFrame): void {
      if (isTerminal()) {
        return;
      }
      switch (frame.type) {
        case "chunk":
          content += frame.text;
          return;
        case "done":
          status = "complete";
          terminalReason = "complete";
          return;
        case "error":
          status = "errored";
          terminalReason = "errored";
          return;
      }
    },

    cancel(): void {
      if (isTerminal()) {
        return;
      }
      status = "cancelled";
      terminalReason = "cancelled";
    },
  };
}
