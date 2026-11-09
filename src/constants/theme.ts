import { Platform } from "react-native";

/**
 * SocietyAI design tokens.
 *
 * Colours mirror the existing web design system (warm paper / ink / moss in
 * light mode, near-black green / mint in dark mode) so the mobile app feels
 * like the same product rather than a separate template.
 */

export type ThemeMode = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardElevated: string;
  muted: string;
  mutedForeground: string;
  border: string;
  borderStrong: string;
  input: string;
  primary: string;
  primaryForeground: string;
  primarySoft: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveSoft: string;
  destructiveForeground: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  info: string;
  infoSoft: string;
  overlay: string;
  skeleton: string;
  inverse: string;
  inverseForeground: string;
};

export const palettes: Record<ColorScheme, ThemeColors> = {
  light: {
    background: "#f5f5f1",
    foreground: "#171b18",
    card: "#ffffff",
    cardElevated: "#ffffff",
    muted: "#eeefe9",
    mutedForeground: "#68736b",
    border: "#e1e3db",
    borderStrong: "#d3d7cb",
    input: "#d9dcd2",
    primary: "#1f6b52",
    primaryForeground: "#f7fbf8",
    primarySoft: "#e6f0ea",
    secondary: "#eceee7",
    secondaryForeground: "#222922",
    accent: "#e6f0ea",
    accentForeground: "#14523e",
    destructive: "#c4453d",
    destructiveSoft: "#fbeceb",
    destructiveForeground: "#ffffff",
    success: "#11835c",
    successSoft: "#e7f5ef",
    warning: "#a5691a",
    warningSoft: "#fbf1e2",
    info: "#1f6b52",
    infoSoft: "#e6f0ea",
    overlay: "rgba(17, 23, 19, 0.45)",
    skeleton: "#e7e8e2",
    inverse: "#101713",
    inverseForeground: "#f3f7f4",
  },
  dark: {
    background: "#0b0f0c",
    foreground: "#f2f5f1",
    card: "#121713",
    cardElevated: "#171d18",
    muted: "#191f1a",
    mutedForeground: "#9aa69e",
    border: "#28312a",
    borderStrong: "#344036",
    input: "#303a32",
    primary: "#79c9a6",
    primaryForeground: "#08130f",
    primarySoft: "#172b22",
    secondary: "#1a211b",
    secondaryForeground: "#eef3ef",
    accent: "#172b22",
    accentForeground: "#9fdec2",
    destructive: "#f07a72",
    destructiveSoft: "#2a1614",
    destructiveForeground: "#1a0b0a",
    success: "#4ade80",
    successSoft: "#12251a",
    warning: "#fbbf24",
    warningSoft: "#2a2010",
    info: "#79c9a6",
    infoSoft: "#172b22",
    overlay: "rgba(0, 0, 0, 0.6)",
    skeleton: "#1e2520",
    inverse: "#f3f7f4",
    inverseForeground: "#101713",
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const fonts = {
  regular: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
  medium: Platform.select({
    ios: "System",
    android: "sans-serif-medium",
    default: "System",
  }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
} as const;

export const type = {
  display: { fontSize: 30, lineHeight: 36, letterSpacing: -0.9 },
  title: { fontSize: 24, lineHeight: 30, letterSpacing: -0.6 },
  heading: { fontSize: 19, lineHeight: 25, letterSpacing: -0.3 },
  body: { fontSize: 15, lineHeight: 22, letterSpacing: -0.1 },
  bodySmall: { fontSize: 13, lineHeight: 19 },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
  caption: { fontSize: 11, lineHeight: 15 },
  micro: { fontSize: 10, lineHeight: 13, letterSpacing: 0.4 },
  monoLabel: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.2,
    fontFamily: fonts.mono,
  },
} as const;

export function shadow(scheme: ColorScheme) {
  return scheme === "dark"
    ? {
        shadowColor: "#000000",
        shadowOpacity: 0.4,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      }
    : {
        shadowColor: "#171b18",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      };
}
