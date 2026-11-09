import { useColorScheme } from "react-native";

import {
  palettes,
  radius,
  shadow,
  spacing,
  type,
  type ColorScheme,
  type ThemeColors,
} from "@/constants/theme";
import { useThemeStore } from "@/store/theme-store";
import { useHydrated } from "@/hooks/use-hydrated";

export type AppTheme = {
  scheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof type;
  elevation: ReturnType<typeof shadow>;
};

export function useAppTheme(): AppTheme {
  const hydrated = useHydrated();
  const systemScheme = useColorScheme();
  const mode = useThemeStore((state) => state.mode);
  const scheme: ColorScheme =
    mode === "system" && hydrated
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : mode === "system"
      ? "light"
      : mode;

  return {
    scheme,
    isDark: scheme === "dark",
    colors: palettes[scheme],
    spacing,
    radius,
    type,
    elevation: shadow(scheme),
  };
}
