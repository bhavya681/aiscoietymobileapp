import { ArrowUpRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

type SuggestionChipsProps = {
  suggestions: readonly string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
};

export function SuggestionChips({
  suggestions,
  onSelect,
  disabled = false,
}: SuggestionChipsProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {suggestions.map((suggestion) => (
        <Pressable
          key={suggestion}
          accessibilityRole="button"
          accessibilityLabel={suggestion}
          disabled={disabled}
          onPress={() => onSelect(suggestion)}
          style={({ pressed }) => [
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.md,
              paddingVertical: 8,
              opacity: disabled ? 0.5 : pressed ? 0.65 : 1,
            },
          ]}
        >
          <AppText variant="caption" weight="500">
            {suggestion}
          </AppText>
          <ArrowUpRight size={12} color={colors.mutedForeground} />
        </Pressable>
      ))}
    </View>
  );
}
