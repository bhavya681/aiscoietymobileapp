import { View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import { initials } from "@/utils/format";

type AvatarProps = {
  name?: string | null;
  size?: number;
  tone?: "primary" | "muted" | "inverse";
};

export function Avatar({ name, size = 42, tone = "primary" }: AvatarProps) {
  const { colors, radius } = useAppTheme();

  const background =
    tone === "inverse"
      ? colors.inverse
      : tone === "muted"
        ? colors.muted
        : colors.primarySoft;

  const foreground =
    tone === "inverse"
      ? colors.inverseForeground
      : tone === "muted"
        ? colors.mutedForeground
        : colors.primary;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.min(radius.md, size / 2),
        backgroundColor: background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText
        variant="label"
        weight="700"
        style={{ color: foreground, fontSize: Math.round(size * 0.32) }}
      >
        {initials(name)}
      </AppText>
    </View>
  );
}
