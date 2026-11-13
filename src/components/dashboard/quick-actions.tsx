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
  const { colors, radius } = useAppTheme();

  return (
    <View style={styles.row}>
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
              { opacity: pressed ? 0.55 : 1 },
            ]}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: radius.md,
                backgroundColor: palette.background,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <action.icon
                size={19}
                color={palette.foreground}
                strokeWidth={1.9}
              />
            </View>
            <AppText
              variant="caption"
              weight="500"
              align="center"
              numberOfLines={2}
              style={{ lineHeight: 15 }}
            >
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
      return { background: colors.muted, foreground: colors.foreground };
    case "primary":
    default:
      return { background: colors.primarySoft, foreground: colors.primary };
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 7,
    paddingVertical: 4,
  },
});
