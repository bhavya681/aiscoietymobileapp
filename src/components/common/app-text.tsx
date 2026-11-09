import { Text, type TextProps, type TextStyle } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

export type TextVariant =
  | "display"
  | "title"
  | "heading"
  | "body"
  | "bodySmall"
  | "label"
  | "caption"
  | "micro"
  | "monoLabel";

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  weight?: TextStyle["fontWeight"];
  align?: TextStyle["textAlign"];
};

const DEFAULT_WEIGHTS: Partial<Record<TextVariant, TextStyle["fontWeight"]>> = {
  display: "700",
  title: "700",
  heading: "600",
  label: "600",
  monoLabel: "500",
};

export function AppText({
  variant = "body",
  color,
  weight,
  align,
  style,
  children,
  ...rest
}: AppTextProps) {
  const { colors, type } = useAppTheme();
  const typography = type[variant];

  return (
    <Text
      {...rest}
      style={[
        typography,
        {
          color: color ?? colors.foreground,
          fontWeight: weight ?? DEFAULT_WEIGHTS[variant],
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
