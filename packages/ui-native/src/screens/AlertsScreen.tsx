import { alertRules, runwayAlert } from "@treasury/data";
import { color } from "@treasury/ui-tokens";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { WarningDiamond } from "../icons";

export function AlertsScreen({ onAskRunway }: { onAskRunway: () => void }) {
  const [on, setOn] = useState(() => alertRules.map((r) => r.state !== "off"));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Alerts</Text>

      <View style={styles.alertCard}>
        <WarningDiamond size={15} color="#b5abfc" weight="fill" />
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>{runwayAlert.title}</Text>
          <Text style={styles.alertBody}>{runwayAlert.detail}</Text>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 9 }}>
            <Button variant="primary" onPress={onAskRunway}>
              <Text style={{ fontSize: 11.5, color: color.accent }}>Ask the analyst</Text>
            </Button>
            <Button variant="secondary">
              <Text style={{ fontSize: 11.5, color: color.text }}>Mute 7d</Text>
            </Button>
          </View>
        </View>
      </View>

      <Text style={styles.kicker}>Rules</Text>
      {alertRules.map((r, i) => (
        <View key={r.name} style={styles.ruleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ruleName}>{r.name}</Text>
            <Text style={styles.ruleDetail}>{r.detail}</Text>
          </View>
          <Pressable
            onPress={() => setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))}
            style={[styles.toggleTrack, on[i] && styles.toggleTrackOn]}
          >
            <View style={[styles.toggleThumb, on[i] && styles.toggleThumbOn]} />
          </Pressable>
        </View>
      ))}
      <Button variant="secondary" block style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 12.5, color: color.text }}>New rule</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4 },
  title: { fontSize: 20, fontWeight: "500", color: color.text, marginBottom: 12 },
  alertCard: {
    borderWidth: 1,
    borderColor: "#5d5294",
    borderRadius: 8,
    backgroundColor: "#2b2741",
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },
  alertTitle: { fontSize: 12.5, fontWeight: "500", color: color.text },
  alertBody: { fontSize: 11, color: "rgba(233,233,237,.6)", marginTop: 3, lineHeight: 16 },
  kicker: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(233,233,237,.45)",
    marginTop: 22,
    marginBottom: 6,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(233,233,237,.08)",
  },
  ruleName: { fontSize: 13, color: color.text },
  ruleDetail: { fontSize: 10.5, color: "rgba(233,233,237,.45)", marginTop: 1 },
  toggleTrack: {
    width: 46,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#292b31",
    padding: 3,
    justifyContent: "center",
  },
  toggleTrackOn: {},
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#595d6c" },
  toggleThumbOn: { backgroundColor: color.accent, alignSelf: "flex-end" },
});
