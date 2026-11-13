import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

/**
 * The brand mark is a simple architectural arch — a deliberate, civic glyph for
 * a housing society rather than the generic "sparkle" used by AI products.
 */
export function BrandMark({ size = 44 }: { size?: number }) {
  const { colors, radius } = useAppTheme();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.min(radius.md, size * 0.28),
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.primary + "55",
      }}
    >
      <Svg width={size * 0.58} height={size * 0.58} viewBox="0 0 48 48">
        <Path
          d="M12 22.5 24 12l12 10.5"
          stroke={colors.primaryForeground}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M16 20.5V36h16V20.5"
          stroke={colors.primaryForeground}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M21.5 36v-8h5v8"
          stroke={colors.primaryForeground}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

export function BrandLockup({
  subtitle,
  size = 38,
}: {
  subtitle?: string;
  size?: number;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <BrandMark size={size} />
      <View style={{ gap: 1 }}>
        <AppText
          variant="label"
          weight="700"
          style={{ letterSpacing: -0.3, fontSize: 13 }}
        >
          SocietyAI
        </AppText>
        {subtitle ? (
          <AppText
            variant="micro"
            color={colors.mutedForeground}
            style={{ letterSpacing: 0.4, textTransform: "uppercase" }}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
