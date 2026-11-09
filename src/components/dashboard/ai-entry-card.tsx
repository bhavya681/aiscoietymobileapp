import { LinearGradient } from "expo-linear-gradient";
import { ArrowUpRight, Sparkles } from "lucide-react-native";
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
  const { radius, spacing } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open the SocietyAI assistant"
      onPress={onPress}
      style={({ pressed }) => [
        { borderRadius: radius.lg, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <LinearGradient
        colors={["#101c16", "#18392b", "#1f4a37"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          { borderRadius: radius.lg, padding: spacing.lg },
        ]}
      >
        <View style={styles.sparkleBox}>
          <Sparkles size={18} color="#9fdec2" strokeWidth={2} />
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="label" weight="700" style={{ color: "#f2f7f3" }}>
            Ask SocietyAI
          </AppText>
          <AppText
            variant="caption"
            style={{ color: "#a9c8b7" }}
            numberOfLines={2}
          >
            {suggestion}
          </AppText>
        </View>

        <View
          style={[
            styles.arrow,
            { backgroundColor: "#ffffff14", borderRadius: radius.pill },
          ]}
        >
          <ArrowUpRight size={16} color="#d7f3e7" strokeWidth={2.2} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  sparkleBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff12",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
