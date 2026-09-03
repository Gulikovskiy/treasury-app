import { useAgentStream } from "@treasury/data";
import { createNativeFetchAdapter } from "@treasury/data/nativeFetchAdapter";
import { useState } from "react";
import { Button, Platform, SafeAreaView, ScrollView, Text, TextInput } from "react-native";

// Point this at the machine running `pnpm dev:web` (the Next.js dev server
// hosts the API route both surfaces call). Non-Goal (spec.md): no UI polish
// — a minimal scrolling text view is sufficient to prove the transport.
// Android's emulator runs the app inside a NAT'd VM, so "localhost" there
// means the VM itself, not the host machine — 10.0.2.2 is its documented
// alias for the host loopback. iOS Simulator and web share the host's
// network directly, so plain "localhost" already reaches `pnpm dev:web`.
const DEFAULT_API_BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const CONVERSATION_ID = "demo-conversation";

const fetchImpl = createNativeFetchAdapter(API_BASE_URL);

export default function App() {
  const [prompt, setPrompt] = useState("");
  const { snapshot, submit, cancel } = useAgentStream(CONVERSATION_ID, fetchImpl);
  const isStreaming = snapshot?.status === "streaming";

  return (
    <SafeAreaView>
      <ScrollView>
        <Text>Treasury Analyst (transport prototype)</Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Ask about the Safe's treasury position"
        />
        <Button
          title="Send"
          onPress={() => {
            if (prompt.trim().length === 0) return;
            submit(prompt);
          }}
        />
        <Button title="Cancel" onPress={cancel} disabled={!isStreaming} />
        {snapshot && (
          <Text testID="assistant-message">
            {snapshot.message.content}
            {snapshot.status === "errored" && " [response incomplete — an error occurred]"}
            {snapshot.status === "cancelled" && " [cancelled — response incomplete]"}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
