import { activity, nav, overviewStats, runwayAlert } from "@treasury/data";
import { color } from "@treasury/ui-tokens";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { Sparkline } from "../components/Sparkline";
import { ArrowDownLeft, ArrowsLeftRight, WarningDiamond } from "../icons";

export function SafeOverviewScreen({ onAskRunway, onGoActivity }: { onAskRunway: () => void; onGoActivity: () => void }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Net asset value</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
        <Text style={styles.navValue}>{nav.value}</Text>
        <Text style={styles.navChange}>{nav.change30d}</Text>
      </View>
      <Sparkline height={64} />
      <View style={styles.sparklineLabels}>
        <Text style={styles.axisLabel}>Oct 2025</Text>
        <Text style={styles.axisLabel}>12 months</Text>
        <Text style={styles.axisLabel}>Sep 3</Text>
      </View>

      <View style={styles.statGrid}>
        {overviewStats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statSub}>{s.sub}</Text>
          </View>
        ))}
      </View>

      <View style={styles.alertCard}>
        <WarningDiamond size={15} color="#b5abfc" weight="fill" />
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>{runwayAlert.title}</Text>
          <Text style={styles.alertBody}>{runwayAlert.detail}</Text>
          <Button variant="primary" onPress={onAskRunway} style={{ marginTop: 9, alignSelf: "flex-start" }}>
            <Text style={{ fontSize: 11.5, color: color.accent }}>Ask the analyst</Text>
          </Button>
        </View>
      </View>

      <Text style={[styles.kicker, { marginTop: 22, marginBottom: 2 }]}>Latest activity</Text>
      {activity[0]!.items.map((item) => (
        <View key={item.tx} style={styles.activityRow}>
          {item.icon === "swap" ? (
            <ArrowsLeftRight size={15} color={color.accent} />
          ) : (
            <ArrowDownLeft size={15} color="#b5abfc" />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.activityLabel}>{item.label}</Text>
            <Text style={styles.activityMeta}>
              today {item.time} · {item.signers === "auto" ? "automated" : `executed ${item.signers}`}
            </Text>
          </View>
        </View>
      ))}
      <Button variant="ghost" onPress={onGoActivity}>
        <Text style={{ fontSize: 12, color: color.accent }}>All 47 transactions</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4, gap: 0 },
  kicker: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(233,233,237,.5)",
    marginBottom: 6,
  },
  navValue: { fontSize: 32, fontWeight: "500", color: color.text, letterSpacing: -0.6 },
  navChange: { fontSize: 13, fontWeight: "500", color: "#b5abfc" },
  sparklineLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  axisLabel: { fontSize: 10, color: "rgba(233,233,237,.4)" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 },
  statCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "rgba(233,233,237,.14)",
    borderRadius: 8,
    padding: 12,
  },
  statLabel: { fontSize: 10.5, color: "rgba(233,233,237,.5)" },
  statValue: { fontSize: 17, fontWeight: "500", color: color.text, marginTop: 2 },
  statSub: { fontSize: 10.5, color: "rgba(233,233,237,.45)", marginTop: 1 },
  alertCard: {
    marginTop: 18,
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
  activityRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(233,233,237,.08)",
  },
  activityLabel: { fontSize: 13, color: color.text },
  activityMeta: { fontSize: 10.5, color: "rgba(233,233,237,.45)", marginTop: 1 },
});
