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
    background: "#f4f3ee",
    foreground: "#151a17",
    card: "#ffffff",
    cardElevated: "#ffffff",
    muted: "#ecece5",
    mutedForeground: "#646e68",
    border: "#e2e3da",
    borderStrong: "#cfd3c8",
    input: "#d8dbd1",
    primary: "#1c6b50",
    primaryForeground: "#f7fbf9",
    primarySoft: "#e6efe9",
    secondary: "#ebece5",
    secondaryForeground: "#202721",
    accent: "#e6efe9",
    accentForeground: "#134e3b",
    destructive: "#bd443c",
    destructiveSoft: "#faecea",
    destructiveForeground: "#ffffff",
    success: "#0f7d58",
    successSoft: "#e5f3ed",
    warning: "#97621a",
    warningSoft: "#f9efe0",
    info: "#1c6b50",
    infoSoft: "#e6efe9",
    overlay: "rgba(16, 22, 19, 0.46)",
    skeleton: "#e6e7e0",
    inverse: "#111814",
    inverseForeground: "#f2f6f3",
  },
  dark: {
    background: "#0a0d0b",
    foreground: "#f1f5f2",
    card: "#121613",
    cardElevated: "#171c18",
    muted: "#191e1a",
    mutedForeground: "#98a39c",
    border: "#242b26",
    borderStrong: "#333b35",
    input: "#2d352f",
    primary: "#7cc9a5",
    primaryForeground: "#08130f",
    primarySoft: "#162a21",
    secondary: "#1a201b",
    secondaryForeground: "#eef3ef",
    accent: "#162a21",
    accentForeground: "#9fdec2",
    destructive: "#ef7a72",
    destructiveSoft: "#291614",
    destructiveForeground: "#1a0b0a",
    success: "#57cf95",
    successSoft: "#11251a",
    warning: "#f0b64b",
    warningSoft: "#281f10",
    info: "#7cc9a5",
    infoSoft: "#162a21",
    overlay: "rgba(0, 0, 0, 0.62)",
    skeleton: "#1d231f",
    inverse: "#f2f6f3",
    inverseForeground: "#111814",
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
  sm: 9,
  md: 12,
  lg: 16,
  xl: 20,
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

/** Aligns financial figures so amounts don't jitter between screens. */
export const numeric = {
  fontVariant: ["tabular-nums"] as ("tabular-nums" | "small-caps" | "oldstyle-nums" | "lining-nums" | "proportional-nums")[],
};

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
