import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        style,
      ]}
    />
  );
}

type IconButtonProps = {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  tone?: "default" | "primary" | "danger";
  filled?: boolean;
  disabled?: boolean;
};

export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  size = 40,
  tone = "default",
  filled = false,
  disabled = false,
}: IconButtonProps) {
  const { colors, radius } = useAppTheme();

  const colorsForTone =
    tone === "primary"
      ? { fg: colors.primary, bg: colors.primarySoft }
      : tone === "danger"
        ? { fg: colors.destructive, bg: colors.destructiveSoft }
        : { fg: colors.foreground, bg: colors.card };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: filled ? colorsForTone.bg : "transparent",
          borderWidth: filled ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.35 : pressed ? 0.6 : 1,
        },
      ]}
    >
      <Icon size={19} color={colorsForTone.fg} strokeWidth={2} />
    </Pressable>
  );
}

export function KeyValue({
  label,
  value,
  valueColor,
  strong = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  strong?: boolean;
}) {
  const { colors, spacing } = useAppTheme();

  return (
    <View
      style={[
        styles.row,
        { paddingVertical: spacing.sm, gap: spacing.md },
      ]}
    >
      <AppText
        variant="bodySmall"
        color={colors.mutedForeground}
        style={{ flex: 1 }}
      >
        {label}
      </AppText>
      <AppText
        variant="bodySmall"
        weight={strong ? "600" : "500"}
        color={valueColor ?? colors.foreground}
        style={{ textAlign: "right", flexShrink: 1 }}
      >
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
});
