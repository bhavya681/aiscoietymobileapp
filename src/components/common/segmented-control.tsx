import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

type Option<T extends string> = {
  key: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.muted,
          borderRadius: radius.md,
          padding: 4,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const active = option.key === value;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) {
                return;
              }

              void Haptics.selectionAsync().catch(() => undefined);
              onChange(option.key);
            }}
            style={[
              styles.item,
              {
                backgroundColor: active ? colors.card : "transparent",
                borderRadius: radius.sm,
                paddingVertical: spacing.sm,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: active ? colors.border : "transparent",
              },
            ]}
          >
            <AppText
              variant="label"
              weight={active ? "600" : "500"}
              color={active ? colors.foreground : colors.mutedForeground}
              numberOfLines={1}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
