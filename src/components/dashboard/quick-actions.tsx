import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

export type QuickAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  tone?: "primary" | "warning" | "success" | "inverse";
};

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {actions.map((action) => {
        const palette = getTone(action.tone ?? "primary", colors);

        return (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.sm,
                backgroundColor: palette.background,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <action.icon
                size={16}
                color={palette.foreground}
                strokeWidth={2}
              />
            </View>
            <AppText variant="caption" weight="500" numberOfLines={2}>
              {action.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function getTone(
  tone: "primary" | "warning" | "success" | "inverse",
  colors: ReturnType<typeof useAppTheme>["colors"]
) {
  switch (tone) {
    case "warning":
      return { background: colors.warningSoft, foreground: colors.warning };
    case "success":
      return { background: colors.successSoft, foreground: colors.success };
    case "inverse":
      return { background: colors.inverse, foreground: colors.inverseForeground };
    case "primary":
    default:
      return { background: colors.primarySoft, foreground: colors.primary };
  }
}

const styles = StyleSheet.create({
  item: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    minHeight: 78,
    justifyContent: "space-between",
  },
});
