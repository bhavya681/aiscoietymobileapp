import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

type SectionHeaderProps = {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
  right?: React.ReactNode;
};

export function SectionHeader({
  title,
  caption,
  actionLabel,
  onAction,
  right,
}: SectionHeaderProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { marginBottom: spacing.sm + 2, marginTop: spacing.xxl },
      ]}
    >
      <View style={{ flex: 1, gap: 1 }}>
        <AppText
          weight="600"
          style={{ fontSize: 16, lineHeight: 21, letterSpacing: -0.25 }}
        >
          {title}
        </AppText>
        {caption ? (
          <AppText variant="caption" color={colors.mutedForeground}>
            {caption}
          </AppText>
        ) : null}
      </View>
      {right}
      {!right && actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
        >
          <AppText variant="caption" weight="600" color={colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
});
