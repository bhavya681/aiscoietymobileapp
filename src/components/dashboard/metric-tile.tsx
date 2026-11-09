import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Card } from "@/components/common/card";
import { useAppTheme } from "@/hooks/use-app-theme";

type MetricTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
  onPress?: () => void;
};

export function MetricTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
  onPress,
}: MetricTileProps) {
  const { colors, radius, spacing } = useAppTheme();
  const palette = getTone(tone, colors);

  return (
    <Card
      padded={false}
      onPress={onPress}
      style={[styles.card, { padding: spacing.md }]}
      accessibilityLabel={`${label}: ${value}`}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: radius.sm,
          backgroundColor: palette.background,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.sm,
        }}
      >
        <Icon size={16} color={palette.foreground} strokeWidth={2} />
      </View>
      <AppText variant="caption" color={colors.mutedForeground} numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="heading" numberOfLines={1} style={{ marginTop: 1 }}>
        {value}
      </AppText>
      {hint ? (
        <AppText
          variant="micro"
          color={colors.mutedForeground}
          numberOfLines={1}
          style={{ marginTop: 2 }}
        >
          {hint}
        </AppText>
      ) : null}
    </Card>
  );
}

function getTone(
  tone: "primary" | "success" | "warning" | "danger" | "muted",
  colors: ReturnType<typeof useAppTheme>["colors"]
) {
  switch (tone) {
    case "success":
      return { background: colors.successSoft, foreground: colors.success };
    case "warning":
      return { background: colors.warningSoft, foreground: colors.warning };
    case "danger":
      return { background: colors.destructiveSoft, foreground: colors.destructive };
    case "muted":
      return { background: colors.muted, foreground: colors.mutedForeground };
    case "primary":
    default:
      return { background: colors.primarySoft, foreground: colors.primary };
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
  },
});
