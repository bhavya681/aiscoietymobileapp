import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

export type BannerTone = "info" | "success" | "warning" | "danger";

type AlertBannerProps = {
  tone?: BannerTone;
  title?: string;
  message: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
};

export function AlertBanner({
  tone = "info",
  title,
  message,
  onDismiss,
  actionLabel,
  onAction,
  icon,
}: AlertBannerProps) {
  const { colors, radius, spacing } = useAppTheme();
  const palette = getPalette(tone, colors);
  const Icon =
    icon ??
    (tone === "danger"
      ? AlertTriangle
      : tone === "success"
        ? CheckCircle2
        : tone === "warning"
          ? AlertTriangle
          : Info);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderRadius: radius.md,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Icon size={18} color={palette.foreground} strokeWidth={2} />

      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <AppText variant="label" weight="600" color={palette.foreground}>
            {title}
          </AppText>
        ) : null}
        <AppText variant="caption" color={palette.foreground} style={{ opacity: 0.92 }}>
          {message}
        </AppText>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8} style={{ marginTop: 4 }}>
            <AppText variant="label" weight="700" color={palette.foreground}>
              {actionLabel}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
          hitSlop={10}
        >
          <X size={16} color={palette.foreground} />
        </Pressable>
      ) : null}
    </View>
  );
}

function getPalette(
  tone: BannerTone,
  colors: ReturnType<typeof useAppTheme>["colors"]
) {
  switch (tone) {
    case "success":
      return {
        background: colors.successSoft,
        foreground: colors.success,
        border: colors.success + "33",
      };
    case "warning":
      return {
        background: colors.warningSoft,
        foreground: colors.warning,
        border: colors.warning + "33",
      };
    case "danger":
      return {
        background: colors.destructiveSoft,
        foreground: colors.destructive,
        border: colors.destructive + "33",
      };
    case "info":
    default:
      return {
        background: colors.primarySoft,
        foreground: colors.primary,
        border: colors.primary + "33",
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
