import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

export type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
  elevated?: boolean;
  tone?: "default" | "muted" | "primary" | "transparent";
  accessibilityLabel?: string;
};

export function Card({
  children,
  style,
  onPress,
  padded = true,
  elevated = false,
  tone = "default",
  accessibilityLabel,
}: CardProps) {
  const { colors, radius, spacing, elevation } = useAppTheme();

  const background =
    tone === "muted"
      ? colors.muted
      : tone === "primary"
        ? colors.primarySoft
        : tone === "transparent"
          ? "transparent"
          : colors.card;

  const baseStyle: StyleProp<ViewStyle> = [
    styles.base,
    {
      backgroundColor: background,
      borderColor: tone === "primary" ? colors.primary + "30" : colors.border,
      borderRadius: radius.lg,
      padding: padded ? spacing.lg : 0,
    },
    elevated && tone !== "transparent" ? elevation : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          { opacity: pressed ? 0.86 : 1 },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
