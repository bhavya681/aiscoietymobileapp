import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  fullWidth = true,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const { colors, radius, spacing } = useAppTheme();
  const isDisabled = Boolean(disabled || loading);

  const palette = getPalette(variant, colors);

  const heights = { sm: 38, md: 48, lg: 54 };
  const fontSizes = { sm: 13, md: 15, lg: 16 };
  const horizontalPadding = { sm: spacing.md, md: spacing.lg, lg: spacing.xl };

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={(event) => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => undefined
        );
        onPress?.(event);
      }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: heights[size],
          paddingHorizontal: horizontalPadding[size],
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: variant === "outline" ? 1 : 0,
          borderRadius: radius.md,
          opacity: isDisabled ? 0.5 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.995 : 1 }],
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.foreground} />
      ) : (
        <View style={styles.content}>
          {Icon && iconPosition === "left" ? (
            <Icon size={17} color={palette.foreground} strokeWidth={2.2} />
          ) : null}
          <AppText
            variant="label"
            weight="600"
            style={{ fontSize: fontSizes[size], letterSpacing: 0 }}
            color={palette.foreground}
          >
            {label}
          </AppText>
          {Icon && iconPosition === "right" ? (
            <Icon size={17} color={palette.foreground} strokeWidth={2.2} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function getPalette(variant: ButtonVariant, colors: ReturnType<typeof useAppTheme>["colors"]) {
  switch (variant) {
    case "secondary":
      return {
        background: colors.secondary,
        foreground: colors.secondaryForeground,
        border: colors.border,
      };
    case "outline":
      return {
        background: "transparent",
        foreground: colors.foreground,
        border: colors.borderStrong,
      };
    case "ghost":
      return {
        background: "transparent",
        foreground: colors.primary,
        border: "transparent",
      };
    case "destructive":
      return {
        background: colors.destructive,
        foreground: colors.destructiveForeground,
        border: colors.destructive,
      };
    case "primary":
    default:
      return {
        background: colors.primary,
        foreground: colors.primaryForeground,
        border: colors.primary,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
