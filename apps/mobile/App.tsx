import { createNativeFetchAdapter } from "@treasury/data/nativeFetchAdapter";
import { AppShell, useInterFonts } from "@treasury/ui-native";
import { color } from "@treasury/ui-tokens";
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";

// Point this at the machine running `pnpm dev:web` (the Next.js dev server
// hosts the API route both surfaces call). Android's emulator runs the app
// inside a NAT'd VM, so "localhost" there means the VM itself, not the host
// machine — 10.0.2.2 is its documented alias for the host loopback. iOS
// Simulator shares the host's network directly, so plain "localhost" reaches
// `pnpm dev:web`.
const DEFAULT_API_BASE_URL = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const fetchImpl = createNativeFetchAdapter(API_BASE_URL);

export default function App() {
  const fontsLoaded = useInterFonts();
  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <AppShell fetchImpl={fetchImpl} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: color.bg },
  loading: { flex: 1, backgroundColor: color.bg },
});
