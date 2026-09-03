import { color, radius } from "@treasury/ui-tokens";
import { StyleSheet, Text, View } from "react-native";

export function Tag({ children }: { children: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    backgroundColor: color.neutral800,
    borderRadius: radius.md * 0.75,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  text: { fontSize: 10, color: color.neutral100, letterSpacing: 0.2 },
});
