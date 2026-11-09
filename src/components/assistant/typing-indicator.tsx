import { Sparkles } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

export function TypingIndicator() {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: radius.sm,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sparkles size={14} color={colors.primary} strokeWidth={2} />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          borderTopLeftRadius: radius.xs,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Dot delay={0} />
          <Dot delay={140} />
          <Dot delay={280} />
        </View>
        <AppText variant="micro" color={colors.mutedForeground}>
          Checking society records…
        </AppText>
      </View>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const { colors } = useAppTheme();
  const progress = useSharedValue(0.35);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -2 }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.primary,
        },
        style,
      ]}
    />
  );
}
