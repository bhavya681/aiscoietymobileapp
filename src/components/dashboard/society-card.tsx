import { Building2, Clock3, ShieldCheck, Waves } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Card } from "@/components/common/card";
import { SOCIETY } from "@/constants/society";
import { useAppTheme } from "@/hooks/use-app-theme";

const FACTS = [
  {
    icon: Clock3,
    label: "Office hours",
    value: "Mon – Sat, 9:00 AM – 6:00 PM",
  },
  {
    icon: Waves,
    label: "Swimming pool",
    value: "6–10 AM · 4–8 PM",
  },
  {
    icon: ShieldCheck,
    label: "Visitors",
    value: "Register at the security desk",
  },
];

export function SocietyCard() {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.sm,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Building2 size={17} color={colors.primary} strokeWidth={1.9} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodySmall" weight="600">
            {SOCIETY.name}
          </AppText>
          <AppText variant="micro" color={colors.mutedForeground}>
            Society information & policies
          </AppText>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        {FACTS.map((fact, index) => (
          <View
            key={fact.label}
            style={[
              styles.row,
              {
                paddingTop: index === 0 ? 0 : spacing.sm,
                borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
                gap: spacing.md,
              },
            ]}
          >
            <fact.icon
              size={15}
              color={colors.mutedForeground}
              strokeWidth={1.9}
            />
            <AppText
              variant="caption"
              color={colors.mutedForeground}
              style={{ flex: 1 }}
            >
              {fact.label}
            </AppText>
            <AppText variant="caption" weight="500" style={{ textAlign: "right" }}>
              {fact.value}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="micro" color={colors.mutedForeground}>
        Maintenance is due before the 10th. A ₹200 late fee applies after that.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
