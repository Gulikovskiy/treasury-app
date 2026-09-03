import { quickPrompts, useAgentStream, type AgentStreamFetch } from "@treasury/data";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";

interface Turn {
  id: number;
  prompt: string;
  content: string;
  status: "streaming" | "complete" | "cancelled" | "errored";
}

export function AskPanel({
  fetchImpl,
  conversationId = "demo-conversation",
}: {
  fetchImpl: AgentStreamFetch;
  conversationId?: string;
}) {
  const { snapshot, submit, cancel } = useAgentStream(conversationId, fetchImpl);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isStreaming = snapshot?.status === "streaming";

  function ask(promptText: string) {
    const text = promptText.trim();
    if (!text || isStreaming) return;
    setTurns((prev) => {
      const finalized =
        snapshot && prev.length > 0
          ? [...prev.slice(0, -1), { ...prev[prev.length - 1]!, content: snapshot.message.content, status: snapshot.status }]
          : prev;
      return [...finalized, { id: nextId.current++, prompt: text, content: "", status: "streaming" as const }];
    });
    setInput("");
    submit(text);
  }

  function rerun(prompt: string) {
    ask(prompt);
  }

  useEffect(() => {
    if (!snapshot) return;
    setTurns((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1]!;
      if (last.content === snapshot.message.content && last.status === snapshot.status) return prev;
      return [...prev.slice(0, -1), { ...last, content: snapshot.message.content, status: snapshot.status }];
    });
  }, [snapshot]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, minWidth: 0 }}>
      {turns.length === 0 && (
        <div style={{ color: "rgba(233,233,237,.5)", font: "400 13.5px/1.55 Inter" }}>
          Ask about the Safe&rsquo;s balances, exposure, or recent activity.
        </div>
      )}
      {turns.map((turn) => (
        <div key={turn.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "62%",
              background: "#2b2741",
              border: "1px solid #423a6a",
              borderRadius: "14px 14px 4px 14px",
              padding: "9px 13px",
              font: "400 13.5px/1.5 Inter",
            }}
          >
            {turn.prompt}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                font: "500 10px/1 Inter",
                letterSpacing: ".09em",
                textTransform: "uppercase",
                color: "#b5abfc",
              }}
            >
              <i className="ph ph-sparkle" style={{ fontSize: 12 }} />
              Analyst
            </div>
            <div style={{ font: "400 14px/1.6 Inter" }}>
              {turn.content}
              {turn.status === "streaming" && <span className="cursor-blink" />}
              {turn.status === "cancelled" && (
                <span style={{ color: "rgba(233,233,237,.4)" }}> ▌ cancelled — response incomplete</span>
              )}
              {turn.status === "errored" && (
                <span style={{ color: "rgba(233,233,237,.4)" }}> ▌ response incomplete — an error occurred</span>
              )}
            </div>
            {turn.status === "streaming" && (
              <Button variant="secondary" onClick={cancel} style={{ alignSelf: "flex-start", fontSize: 12 }}>
                <i className="ph ph-stop-circle" style={{ fontSize: 13 }} />
                Stop
              </Button>
            )}
            {turn.status === "cancelled" && (
              <Button
                variant="primary"
                onClick={() => rerun(turn.prompt)}
                style={{ alignSelf: "flex-start", fontSize: 12 }}
              >
                <i className="ph ph-arrow-clockwise" style={{ fontSize: 13 }} />
                Rerun
              </Button>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, overflow: "auto" }}>
          {quickPrompts.map((q) => (
            <Button
              key={q.key}
              variant="secondary"
              onClick={() => ask(q.prompt)}
              disabled={isStreaming}
              style={{ fontSize: 12, whiteSpace: "nowrap", flex: "none" }}
            >
              {q.label}
            </Button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask(input);
            }}
            placeholder='Ask a follow-up — try "split the stable book by counterparty"'
            style={{ borderRadius: 20, padding: "10px 15px" }}
          />
          <Button variant="primary" onClick={() => ask(input)} disabled={isStreaming} style={{ flex: "none" }}>
            Ask
          </Button>
        </div>
      </div>
    </div>
  );
}
