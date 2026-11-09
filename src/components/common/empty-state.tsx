import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Button } from "@/components/common/button";
import { useAppTheme } from "@/hooks/use-app-theme";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: compact ? spacing.xxl : spacing.huge,
        paddingHorizontal: spacing.xl,
        gap: spacing.sm,
      }}
    >
      {Icon ? (
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: radius.lg,
            backgroundColor: colors.muted,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xs,
          }}
        >
          <Icon size={24} color={colors.mutedForeground} strokeWidth={1.8} />
        </View>
      ) : null}
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {description ? (
        <AppText
          variant="bodySmall"
          color={colors.mutedForeground}
          align="center"
          style={{ maxWidth: 300 }}
        >
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing.md, alignSelf: "stretch" }}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}
