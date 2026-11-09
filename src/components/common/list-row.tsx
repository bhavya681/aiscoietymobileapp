import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconTone?: "primary" | "danger" | "muted" | "success" | "warning";
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
  last?: boolean;
};

export function ListRow({
  title,
  subtitle,
  icon: Icon,
  iconTone = "primary",
  value,
  onPress,
  right,
  showChevron = Boolean(onPress),
  destructive = false,
  last = false,
}: ListRowProps) {
  const { colors, radius, spacing } = useAppTheme();

  const tone = destructive ? "danger" : iconTone;
  const iconPalette = getIconPalette(tone, colors);

  const content = (
    <View
      style={[
        styles.container,
        {
          paddingVertical: spacing.md,
          gap: spacing.md,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {Icon ? (
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.sm,
            backgroundColor: iconPalette.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color={iconPalette.foreground} strokeWidth={1.9} />
        </View>
      ) : null}

      <View style={{ flex: 1, gap: 2 }}>
        <AppText
          variant="body"
          weight="500"
          color={destructive ? colors.destructive : colors.foreground}
          numberOfLines={1}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.mutedForeground} numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {right ??
        (value ? (
          <AppText variant="bodySmall" color={colors.mutedForeground}>
            {value}
          </AppText>
        ) : null)}

      {showChevron ? (
        <ChevronRight size={17} color={colors.mutedForeground} strokeWidth={2} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      {content}
    </Pressable>
  );
}

function getIconPalette(
  tone: "primary" | "danger" | "muted" | "success" | "warning",
  colors: ReturnType<typeof useAppTheme>["colors"]
) {
  switch (tone) {
    case "danger":
      return { background: colors.destructiveSoft, foreground: colors.destructive };
    case "muted":
      return { background: colors.muted, foreground: colors.mutedForeground };
    case "success":
      return { background: colors.successSoft, foreground: colors.success };
    case "warning":
      return { background: colors.warningSoft, foreground: colors.warning };
    case "primary":
    default:
      return { background: colors.primarySoft, foreground: colors.primary };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});
