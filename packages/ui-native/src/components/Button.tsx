import { color, radius } from "@treasury/ui-tokens";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "icon";

export function Button({
  variant = "secondary",
  onPress,
  disabled,
  block,
  children,
  label,
  style,
}: {
  variant?: Variant;
  onPress?: () => void;
  disabled?: boolean;
  block?: boolean;
  children?: ReactNode;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const textColor = variant === "primary" || variant === "ghost" ? color.accent : color.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "icon" && styles.icon,
        block && styles.block,
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.7 },
        style,
      ]}
    >
      {children}
      {label ? <Text style={[styles.label, { color: textColor }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  primary: { borderColor: color.accent },
  secondary: { borderColor: color.divider },
  ghost: { borderColor: "transparent", paddingHorizontal: 3 },
  icon: { width: 36, height: 36, padding: 0 },
  block: { width: "100%" },
  disabled: { opacity: 0.45 },
  label: { fontSize: 12.5, fontWeight: "500" },
});
