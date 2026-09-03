import type { AgentStreamFetch } from "@treasury/data";
import { safeMeta } from "@treasury/data";
import { color } from "@treasury/ui-tokens";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tag } from "./components/Tag";
import { type MobileTab, TabBar } from "./components/TabBar";
import { GearSix, Triangle } from "./icons";
import { ActivityScreen } from "./screens/ActivityScreen";
import { AlertsScreen } from "./screens/AlertsScreen";
import { AskScreen } from "./screens/AskScreen";
import { PositionsScreen } from "./screens/PositionsScreen";
import { SafeOverviewScreen } from "./screens/SafeOverviewScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

export function AppShell({ fetchImpl }: { fetchImpl: AgentStreamFetch }) {
  const [tab, setTab] = useState<MobileTab | "settings">("ask");
  const goAsk = () => setTab("ask");
  const goActivity = () => setTab("activity");

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Triangle size={14} color={color.accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.safeName}>{safeMeta.name}</Text>
          <Text style={styles.safeSub}>
            {safeMeta.address} · {safeMeta.signers} · {safeMeta.network}
          </Text>
        </View>
        <Tag>Read-only</Tag>
        <Pressable onPress={() => setTab("settings")} hitSlop={8} style={styles.settingsBtn}>
          <GearSix size={17} color="rgba(233,233,237,.55)" />
        </Pressable>
      </View>

      {tab === "ask" && <AskScreen fetchImpl={fetchImpl} />}
      {tab === "overview" && <SafeOverviewScreen onAskRunway={goAsk} onGoActivity={goActivity} />}
      {tab === "positions" && <PositionsScreen onAskStables={goAsk} />}
      {tab === "activity" && <ActivityScreen />}
      {tab === "alerts" && <AlertsScreen onAskRunway={goAsk} />}
      {tab === "settings" && <SettingsScreen onBack={goAsk} />}

      {tab !== "settings" && <TabBar tab={tab} onChange={setTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  safeName: { fontSize: 14, fontWeight: "500", color: color.text },
  safeSub: { fontSize: 11, color: "rgba(233,233,237,.5)" },
  settingsBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
});
