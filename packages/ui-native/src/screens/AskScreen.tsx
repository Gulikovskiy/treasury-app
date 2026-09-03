import { quickPrompts, useAgentStream, type AgentStreamFetch } from "@treasury/data";
import { color } from "@treasury/ui-tokens";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { ArrowClockwise, ArrowUp, Sparkle, StopCircle } from "../icons";

interface Turn {
  id: number;
  prompt: string;
  content: string;
  status: "streaming" | "complete" | "cancelled" | "errored";
}

export function AskScreen({
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
  const scrollRef = useRef<ScrollView | null>(null);
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

  useEffect(() => {
    if (!snapshot) return;
    setTurns((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1]!;
      if (last.content === snapshot.message.content && last.status === snapshot.status) return prev;
      return [...prev.slice(0, -1), { ...last, content: snapshot.message.content, status: snapshot.status }];
    });
  }, [snapshot]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {turns.length === 0 && (
          <Text style={styles.empty}>Ask about the Safe&rsquo;s balances, exposure, or recent activity.</Text>
        )}
        {turns.map((turn) => (
          <View key={turn.id} style={{ gap: 10 }}>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{turn.prompt}</Text>
            </View>
            <View style={{ gap: 8 }}>
              <View style={styles.analystRow}>
                <Sparkle size={12} color="#b5abfc" />
                <Text style={styles.analystLabel}>Analyst</Text>
              </View>
              <Text style={styles.agentText}>
                {turn.content}
                {turn.status === "cancelled" && (
                  <Text style={{ color: "rgba(233,233,237,.4)" }}> ▌ cancelled — response incomplete</Text>
                )}
                {turn.status === "errored" && (
                  <Text style={{ color: "rgba(233,233,237,.4)" }}> ▌ response incomplete — an error occurred</Text>
                )}
              </Text>
              {turn.status === "streaming" && (
                <Button variant="secondary" onPress={cancel} style={{ alignSelf: "flex-start" }}>
                  <StopCircle size={13} color={color.text} />
                  <Text style={styles.btnLabel}>Stop</Text>
                </Button>
              )}
              {turn.status === "cancelled" && (
                <Button variant="primary" onPress={() => ask(turn.prompt)} style={{ alignSelf: "flex-start" }}>
                  <ArrowClockwise size={13} color={color.accent} />
                  <Text style={[styles.btnLabel, { color: color.accent }]}>Rerun</Text>
                </Button>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ gap: 6 }}>
        {quickPrompts.map((q) => (
          <Button key={q.key} variant="secondary" onPress={() => ask(q.prompt)} disabled={isStreaming}>
            <Text style={styles.chipLabel}>{q.label}</Text>
          </Button>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => ask(input)}
          placeholder="Ask about the Safe…"
          placeholderTextColor="rgba(233,233,237,0.4)"
          style={styles.input}
        />
        <Button variant="primary" onPress={() => ask(input)} disabled={isStreaming} style={styles.sendBtn}>
          <ArrowUp size={16} color={color.accent} />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  thread: { padding: 16, paddingTop: 6, gap: 18 },
  empty: { color: "rgba(233,233,237,.5)", fontSize: 13.5, lineHeight: 21 },
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    backgroundColor: "#2b2741",
    borderWidth: 1,
    borderColor: "#423a6a",
    borderRadius: 14,
    borderBottomRightRadius: 4,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  userText: { color: color.text, fontSize: 13.5, lineHeight: 19.5 },
  analystRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  analystLabel: { fontSize: 10, fontWeight: "500", letterSpacing: 1, textTransform: "uppercase", color: "#b5abfc" },
  agentText: { color: color.text, fontSize: 13.5, lineHeight: 20.9 },
  btnLabel: { fontSize: 11.5, color: color.text },
  chips: { flexGrow: 0, paddingHorizontal: 16, paddingBottom: 10 },
  chipLabel: { fontSize: 11.5, color: color.text },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  input: {
    flex: 1,
    minHeight: 38,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: color.surface,
    color: color.text,
    fontSize: 13.5,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 19, flex: undefined },
});
