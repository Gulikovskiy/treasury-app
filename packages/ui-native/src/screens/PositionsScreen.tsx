import { holdings, nav, venueExposure } from "@treasury/data";
import { color } from "@treasury/ui-tokens";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../components/Button";
import { CompositionBar } from "../components/CompositionBar";

export function PositionsScreen({ onAskStables }: { onAskStables: () => void }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Net asset value</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
        <Text style={styles.navValue}>{nav.value}</Text>
        <Text style={styles.navChange}>{nav.change30d}</Text>
      </View>

      <CompositionBar style={{ marginTop: 16, marginBottom: 8 }} />
      <View style={styles.legend}>
        <Text style={styles.legendItem}>Stables 60.4%</Text>
        <Text style={styles.legendItem}>AAVE 18.7%</Text>
        <Text style={styles.legendItem}>ETH-correlated 13.2%</Text>
        <Text style={styles.legendItem}>Other 7.7%</Text>
      </View>

      <Text style={[styles.kicker, { marginTop: 22, marginBottom: 4 }]}>Holdings</Text>
      {holdings.map((h) => (
        <View key={h.label} style={styles.holdingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.holdingLabel}>{h.label}</Text>
            <Text style={styles.holdingSub}>{h.caption}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.holdingValue}>{h.value}</Text>
            <Text style={styles.holdingSub}>
              {h.share} · {h.change}
            </Text>
          </View>
        </View>
      ))}

      <Text style={[styles.kicker, { marginTop: 24, marginBottom: 6 }]}>Venue exposure</Text>
      <View style={{ gap: 9 }}>
        {venueExposure.map((v, i) => (
          <View key={v.label}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.venueLabel}>{v.label}</Text>
              <Text style={styles.venueLabel}>{v.share}%</Text>
            </View>
            <View style={styles.venueTrack}>
              <View
                style={{
                  width: `${v.share}%`,
                  height: "100%",
                  borderRadius: 3,
                  backgroundColor: ["#9184d9", "#75798c", "#595d6c"][i],
                }}
              />
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.footnote}>Single-venue band ≤ 85%. Aave V3 sits 16.7pts inside it.</Text>

      <Button variant="secondary" block onPress={onAskStables} style={{ marginTop: 18 }}>
        <Text style={{ fontSize: 12.5, color: color.text }}>Ask about this book</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 4 },
  kicker: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(233,233,237,.5)",
  },
  navValue: { fontSize: 32, fontWeight: "500", color: color.text, letterSpacing: -0.6 },
  navChange: { fontSize: 13, fontWeight: "500", color: "#b5abfc" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 4, columnGap: 12 },
  legendItem: { fontSize: 10.5, color: "rgba(233,233,237,.5)" },
  holdingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(233,233,237,.08)",
  },
  holdingLabel: { fontSize: 13, color: color.text },
  holdingValue: { fontSize: 13, fontWeight: "500", color: color.text },
  holdingSub: { fontSize: 10.5, color: "rgba(233,233,237,.45)", marginTop: 1 },
  venueLabel: { fontSize: 12, color: color.text },
  venueTrack: { height: 5, borderRadius: 3, backgroundColor: "#292b31", marginTop: 4 },
  footnote: { fontSize: 10.5, color: "rgba(233,233,237,.45)", marginTop: 8 },
});
