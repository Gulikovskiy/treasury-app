import { color } from "@treasury/ui-tokens";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { ArrowLeft } from "../icons";

const DETAIL_LEVELS = ["Terse", "Explanatory", "Memo"] as const;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {typeof value === "string" ? <Text style={styles.rowValue}>{value}</Text> : value}
    </View>
  );
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [detail, setDetail] = useState<(typeof DETAIL_LEVELS)[number]>("Terse");

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8}>
          <ArrowLeft size={17} color={color.text} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Text style={styles.kicker}>Safe</Text>
      <Row label="Address" value="0x4750…c74f" />
      <Row label="Network" value="Ethereum mainnet" />
      <Row label="Threshold" value="5 of 9 signers" />
      <Row label="Access" value={<Tag>Read-only</Tag>} />

      <Text style={styles.kicker}>Answer detail</Text>
      <View style={styles.seg}>
        {DETAIL_LEVELS.map((level, i) => (
          <Pressable
            key={level}
            onPress={() => setDetail(level)}
            style={[styles.segOpt, i > 0 && styles.segOptBorder, detail === level && styles.segOptActive]}
          >
            <Text style={[styles.segLabel, detail === level && { color: color.accent }]}>{level}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.kicker}>Streaming</Text>
      <Row label="Render batch" value="50 ms" />
      <Row label="Transport" value="SSE · expo/fetch" />
      <View style={styles.noteRow}>
        <Text style={styles.rowLabel}>New prompt cancels the one in flight</Text>
        <Text style={styles.note}>One active stream per conversation. Cancelled answers stay marked incomplete.</Text>
      </View>

      <Text style={styles.kicker}>Data sources</Text>
      <Row label="Safe balances" value="block 23,401,884" />
      <Row label="Aave V3 reserves" value="synced 2 min ago" />
      <Row label="Chainlink prices" value="synced 40 s ago" />

      <Text style={styles.kicker}>Session</Text>
      <Text style={styles.rowLabel}>
        Signed in as <Text style={styles.mono}>0x71ba…03fd</Text>
      </Text>
      <Button variant="secondary" block style={{ marginTop: 12 }}>
        <Text style={{ fontSize: 12.5, color: color.text }}>Sign out</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: "500", color: color.text },
  kicker: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(233,233,237,.45)",
    marginTop: 22,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(233,233,237,.08)",
  },
  rowLabel: { fontSize: 13, color: color.text },
  rowValue: { fontSize: 13, color: "rgba(233,233,237,.6)" },
  mono: { fontFamily: "Menlo", fontSize: 11.5, color: "rgba(233,233,237,.7)" },
  seg: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(233,233,237,.16)",
    borderRadius: 8,
    overflow: "hidden",
  },
  segOpt: { flex: 1, alignItems: "center", paddingVertical: 7 },
  segOptBorder: { borderLeftWidth: 1, borderLeftColor: "rgba(233,233,237,.16)" },
  segOptActive: {},
  segLabel: { fontSize: 13, color: color.text },
  noteRow: { paddingVertical: 11 },
  note: { fontSize: 10.5, color: "rgba(233,233,237,.45)", marginTop: 2 },
});
