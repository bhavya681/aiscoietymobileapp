import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  compact?: boolean;
};

export function ScreenHeader({
  title,
  subtitle,
  eyebrow,
  showBack = false,
  onBack,
  right,
  compact = false,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: spacing.xl,
          paddingTop: compact ? spacing.sm : spacing.md,
          paddingBottom: spacing.md,
          gap: spacing.md,
        },
      ]}
    >
      {showBack ? (
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => (onBack ? onBack() : router.back())}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.pill,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <ChevronLeft size={20} color={colors.foreground} strokeWidth={2.2} />
          </Pressable>
          <View style={{ flex: 1 }} />
          {right}
        </View>
      ) : right ? (
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>{null}</View>
          {right}
        </View>
      ) : null}

      <View style={{ gap: 4 }}>
        {eyebrow ? (
          <AppText
            variant="monoLabel"
            color={colors.mutedForeground}
            style={{ textTransform: "uppercase" }}
          >
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant={compact ? "heading" : "title"} numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySmall" color={colors.mutedForeground}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 38,
    height: 38,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});
