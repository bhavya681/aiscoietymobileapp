import { CloudOff, RefreshCw } from "lucide-react-native";
import { View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Button } from "@/components/common/button";
import { useAppTheme } from "@/hooks/use-app-theme";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
};

export function ErrorState({
  title = "Could not load this",
  message,
  onRetry,
  retryLabel = "Try again",
  compact = false,
}: ErrorStateProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: compact ? spacing.xl : spacing.huge,
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radius.lg,
          backgroundColor: colors.destructiveSoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.xs,
        }}
      >
        <CloudOff size={22} color={colors.destructive} strokeWidth={1.8} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText
        variant="bodySmall"
        color={colors.mutedForeground}
        align="center"
        style={{ maxWidth: 320 }}
      >
        {message}
      </AppText>
      {onRetry ? (
        <View style={{ marginTop: spacing.md, minWidth: 160 }}>
          <Button
            label={retryLabel}
            icon={RefreshCw}
            onPress={onRetry}
            variant="secondary"
            size="sm"
          />
        </View>
      ) : null}
    </View>
  );
}
