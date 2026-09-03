"use client";

import { useAgentStream } from "@treasury/data";
import { createWebFetchAdapter } from "@treasury/data/webFetchAdapter";
import { useState } from "react";

// Non-Goal (spec.md): no UI polish. A minimal, unstyled view is sufficient
// to prove the transport mechanism.
const fetchImpl = createWebFetchAdapter();
const CONVERSATION_ID = "demo-conversation";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const { snapshot, submit, cancel } = useAgentStream(CONVERSATION_ID, fetchImpl);
  const isStreaming = snapshot?.status === "streaming";

  return (
    <main>
      <h1>Treasury Analyst (transport prototype)</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (prompt.trim().length === 0) return;
          submit(prompt);
        }}
      >
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask about the Safe's treasury position"
          aria-label="prompt"
        />
        <button type="submit">Send</button>
        <button type="button" onClick={cancel} disabled={!isStreaming}>
          Cancel
        </button>
      </form>
      {snapshot && (
        <p data-testid="assistant-message" data-status={snapshot.status}>
          {snapshot.message.content}
          {snapshot.status === "errored" && (
            <span data-testid="error-marker"> [response incomplete — an error occurred]</span>
          )}
          {snapshot.status === "cancelled" && (
            <span data-testid="cancelled-marker"> [cancelled — response incomplete]</span>
          )}
        </p>
      )}
    </main>
  );
}
