import { color } from "@treasury/ui-tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BellSimple, ChartDonut, ChatTeardropDots, ListDashes, Vault } from "../icons";

export type MobileTab = "ask" | "overview" | "positions" | "activity" | "alerts";

const TABS: { key: MobileTab; label: string; Icon: typeof Vault }[] = [
  { key: "ask", label: "Ask", Icon: ChatTeardropDots },
  { key: "overview", label: "Safe", Icon: Vault },
  { key: "positions", label: "Positions", Icon: ChartDonut },
  { key: "activity", label: "Activity", Icon: ListDashes },
  { key: "alerts", label: "Alerts", Icon: BellSimple },
];

export function TabBar({ tab, onChange }: { tab: MobileTab; onChange: (tab: MobileTab) => void }) {
  return (
    <View style={styles.bar}>
      {TABS.map(({ key, label, Icon }) => {
        const active = tab === key;
        const tint = active ? color.accent : "rgba(233,233,237,0.45)";
        return (
          <Pressable key={key} onPress={() => onChange(key)} style={styles.item}>
            <Icon size={19} color={tint} />
            <Text style={[styles.label, { color: tint }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: "rgba(233,233,237,0.1)",
    backgroundColor: "#191b29",
  },
  item: { flex: 1, height: 46, alignItems: "center", justifyContent: "center", gap: 3 },
  label: { fontSize: 10, fontWeight: "500" },
});
