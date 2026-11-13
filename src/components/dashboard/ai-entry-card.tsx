import { ArrowUpRight, MessageSquareText } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

type AiEntryCardProps = {
  onPress: () => void;
  suggestion?: string;
};

export function AiEntryCard({
  onPress,
  suggestion = "Ask about your dues, invoices or society rules.",
}: AiEntryCardProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open the society assistant"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.sm,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MessageSquareText size={19} color={colors.primary} strokeWidth={1.9} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodySmall" weight="600" style={{ fontSize: 14 }}>
          Ask the assistant
        </AppText>
        <AppText
          variant="caption"
          color={colors.mutedForeground}
          numberOfLines={2}
          style={{ lineHeight: 17 }}
        >
          {suggestion}
        </AppText>
      </View>

      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: radius.pill,
          backgroundColor: colors.muted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowUpRight size={15} color={colors.mutedForeground} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
