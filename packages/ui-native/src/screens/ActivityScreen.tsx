import { activity } from "@treasury/data";
import { color } from "@treasury/ui-tokens";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { ArrowDownLeft, ArrowUpRight, ArrowsLeftRight, Signature } from "../icons";

const ICONS = { swap: ArrowsLeftRight, in: ArrowDownLeft, out: ArrowUpRight, config: Signature } as const;

export function ActivityScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Last 30 days · 47 txs</Text>
      </View>
      {activity.map((group) => (
        <View key={group.group}>
          <Text style={styles.groupLabel}>{group.group}</Text>
          {group.items.map((item) => {
            const Icon = ICONS[item.icon];
            const tint = item.icon === "swap" ? color.accent : item.icon === "in" ? "#b5abfc" : "rgba(233,233,237,.6)";
            return (
              <View key={item.tx} style={styles.row}>
                <Icon size={15} color={tint} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.meta}>
                    {item.time} · {item.signers === "auto" ? "automated" : `executed ${item.signers}`} · {item.tx}
                  </Text>
                </View>
                <Text style={[styles.amount, item.amount === "config" && styles.amountMuted]}>{item.amount}</Text>
              </View>
            );
          })}
        </View>
      ))}
      <Button variant="ghost" style={{ marginTop: 14 }}>
        <Text style={{ fontSize: 12, color: color.accent }}>Load earlier activity</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4 },
  header: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "500", color: color.text },
  subtitle: { fontSize: 11, color: "rgba(233,233,237,.45)" },
  groupLabel: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(233,233,237,.45)",
    marginTop: 14,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(233,233,237,.08)",
  },
  label: { fontSize: 13, color: color.text },
  meta: { fontSize: 10.5, color: "rgba(233,233,237,.45)", marginTop: 1 },
  amount: { fontSize: 12.5, fontWeight: "500", color: color.text },
  amountMuted: { fontWeight: "400", color: "rgba(233,233,237,.45)" },
});
