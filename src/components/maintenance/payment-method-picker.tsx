import {
  Banknote,
  Landmark,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { PaymentMethod } from "@/types/api";
import { paymentMethodDescription, paymentMethodLabel } from "@/utils/format";

const METHODS: { key: PaymentMethod; icon: LucideIcon }[] = [
  { key: "upi", icon: Smartphone },
  { key: "bank_transfer", icon: Landmark },
  { key: "cash", icon: Banknote },
  { key: "other", icon: Wallet },
];

type PaymentMethodPickerProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View style={{ gap: 8 }}>
      {METHODS.map((method) => {
        const active = method.key === value;

        return (
          <Pressable
            key={method.key}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={paymentMethodLabel(method.key)}
            onPress={() => onChange(method.key)}
            style={[
              styles.row,
              {
                backgroundColor: active ? colors.primarySoft : colors.card,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                gap: spacing.md,
              },
            ]}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.sm,
                backgroundColor: active ? colors.card : colors.muted,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <method.icon
                size={17}
                color={active ? colors.primary : colors.mutedForeground}
                strokeWidth={2}
              />
            </View>

            <View style={{ flex: 1, gap: 1 }}>
              <AppText variant="bodySmall" weight="600">
                {paymentMethodLabel(method.key)}
              </AppText>
              <AppText variant="micro" color={colors.mutedForeground}>
                {paymentMethodDescription(method.key)}
              </AppText>
            </View>

            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: active ? 6 : 1.5,
                borderColor: active ? colors.primary : colors.borderStrong,
                backgroundColor: colors.card,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
