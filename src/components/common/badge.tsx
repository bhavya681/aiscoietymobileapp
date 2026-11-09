import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { StatusTone } from "@/utils/format";

type BadgeProps = {
  label: string;
  tone?: StatusTone;
  size?: "sm" | "md";
  dot?: boolean;
};

export function Badge({ label, tone = "neutral", size = "sm", dot = true }: BadgeProps) {
  const { colors, radius } = useAppTheme();
  const palette = getBadgePalette(tone, colors);

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.background,
          borderRadius: radius.pill,
          paddingHorizontal: size === "sm" ? 8 : 10,
          paddingVertical: size === "sm" ? 3 : 5,
          gap: dot ? 5 : 0,
        },
      ]}
    >
      {dot ? (
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: palette.foreground,
          }}
        />
      ) : null}
      <AppText
        variant="micro"
        weight="600"
        style={{ color: palette.foreground, letterSpacing: 0.2 }}
      >
        {label}
      </AppText>
    </View>
  );
}

function getBadgePalette(
  tone: StatusTone,
  colors: ReturnType<typeof useAppTheme>["colors"]
) {
  switch (tone) {
    case "success":
      return { background: colors.successSoft, foreground: colors.success };
    case "warning":
      return { background: colors.warningSoft, foreground: colors.warning };
    case "danger":
      return { background: colors.destructiveSoft, foreground: colors.destructive };
    case "info":
      return { background: colors.primarySoft, foreground: colors.primary };
    case "neutral":
    default:
      return { background: colors.muted, foreground: colors.mutedForeground };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
});
