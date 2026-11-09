import { LinearGradient } from "expo-linear-gradient";
import { Building2 } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

export function BrandMark({ size = 44 }: { size?: number }) {
  const { radius } = useAppTheme();

  return (
    <LinearGradient
      colors={["#2a7f61", "#1f6b52", "#154c3b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: Math.min(radius.md, size * 0.3),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Building2 size={size * 0.46} color="#eaf7f0" strokeWidth={2} />
    </LinearGradient>
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
        <AppText variant="label" weight="700" style={{ letterSpacing: -0.2 }}>
          SocietyAI
        </AppText>
        {subtitle ? (
          <AppText variant="micro" color={colors.mutedForeground}>
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
