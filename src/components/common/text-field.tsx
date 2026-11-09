import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import {
  forwardRef,
  useState,
  type ReactNode,
} from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
  icon?: LucideIcon;
  rightSlot?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps["style"];
};

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(
  function TextField(
    {
      label,
      error,
      helper,
      icon: Icon,
      rightSlot,
      containerStyle,
      inputStyle,
      secureTextEntry,
      multiline,
      onFocus,
      onBlur,
      editable = true,
      ...rest
    },
    ref
  ) {
    const { colors, radius, spacing } = useAppTheme();
    const [focused, setFocused] = useState(false);
    const [revealed, setRevealed] = useState(false);

    const isPassword = Boolean(secureTextEntry);
    const borderColor = error
      ? colors.destructive
      : focused
        ? colors.primary
        : colors.input;

    return (
      <View style={[{ gap: 6 }, containerStyle]}>
        {label ? (
          <AppText variant="label" color={colors.mutedForeground}>
            {label}
          </AppText>
        ) : null}

        <View
          style={[
            styles.field,
            {
              backgroundColor: colors.card,
              borderColor,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              minHeight: multiline ? 112 : 50,
              opacity: editable ? 1 : 0.6,
            },
            focused && !error
              ? {
                  borderWidth: 1.5,
                }
              : null,
          ]}
        >
          {Icon ? (
            <Icon
              size={18}
              color={focused ? colors.primary : colors.mutedForeground}
              strokeWidth={1.9}
            />
          ) : null}

          <TextInput
            {...rest}
            ref={ref}
            editable={editable}
            multiline={multiline}
            secureTextEntry={isPassword && !revealed}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            placeholderTextColor={colors.mutedForeground + "b0"}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            style={[
              styles.input,
              {
                color: colors.foreground,
                minHeight: multiline ? 104 : 46,
                paddingVertical: multiline ? spacing.md : 0,
                textAlignVertical: multiline ? "top" : "center",
              },
              inputStyle,
            ]}
          />

          {isPassword ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={revealed ? "Hide password" : "Show password"}
              onPress={() => setRevealed((current) => !current)}
              hitSlop={10}
            >
              {revealed ? (
                <EyeOff size={18} color={colors.mutedForeground} />
              ) : (
                <Eye size={18} color={colors.mutedForeground} />
              )}
            </Pressable>
          ) : (
            rightSlot
          )}
        </View>

        {error ? (
          <AppText variant="caption" color={colors.destructive}>
            {error}
          </AppText>
        ) : helper ? (
          <AppText variant="caption" color={colors.mutedForeground}>
            {helper}
          </AppText>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: undefined,
  },
});
