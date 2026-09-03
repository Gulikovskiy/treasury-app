import { View, type StyleProp, type ViewStyle } from "react-native";

export const COMPOSITION = [
  { share: 28, color: "#9184d9" },
  { share: 27.1, color: "#796cbf" },
  { share: 5.3, color: "#5d5294" },
  { share: 18.7, color: "#75798c" },
  { share: 13.2, color: "#595d6c" },
  { share: 7.6, color: "#3f424d" },
];

export function CompositionBar({ height = 8, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: "row", height, borderRadius: 4, overflow: "hidden", gap: 1 }, style]}>
      {COMPOSITION.map((seg, i) => (
        <View key={i} style={{ width: `${seg.share}%`, backgroundColor: seg.color, height: "100%" }} />
      ))}
    </View>
  );
}
