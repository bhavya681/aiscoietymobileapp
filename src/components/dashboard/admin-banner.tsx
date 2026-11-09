import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Shield } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

export function AdminBanner({ onPress }: { onPress: () => void }) {
  const { radius, spacing } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open the admin panel"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <LinearGradient
        colors={["#2a2315", "#3b2f1a", "#46371d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { borderRadius: radius.md, padding: spacing.md }]}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.sm,
            backgroundColor: "#fbbf241f",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Shield size={17} color="#fbbf24" strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <AppText variant="label" weight="700" style={{ color: "#ffe7b3" }}>
            Administrator access
          </AppText>
          <AppText variant="micro" style={{ color: "#d7b877" }}>
            Residents, maintenance records and society operations.
          </AppText>
        </View>
        <ChevronRight size={16} color="#d7b877" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fbbf2433",
  },
});
