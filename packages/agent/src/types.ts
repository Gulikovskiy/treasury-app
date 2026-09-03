export type StreamFrame =
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export type StreamStatus = "streaming" | "complete" | "cancelled" | "errored";

export type TerminalReason = "complete" | "cancelled" | "errored" | null;

export interface AssistantMessage {
  content: string;
  isFinal: boolean;
  terminalReason: TerminalReason;
}

export interface StreamSessionSnapshot {
  conversationId: string;
  status: StreamStatus;
  message: AssistantMessage;
}
