import { CheckCircle2, ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { MaintenanceRecord } from "@/types/api";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  paymentMethodLabel,
} from "@/utils/format";

type PaymentRowProps = {
  record: MaintenanceRecord;
  onPress?: () => void;
  last?: boolean;
};

export function PaymentRow({ record, onPress, last = false }: PaymentRowProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${formatMonth(record.dueDate)} payment of ${formatCurrency(
        record.monthlyAmount
      )}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          paddingVertical: spacing.md,
          gap: spacing.md,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          opacity: pressed ? 0.65 : 1,
        },
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.sm,
          backgroundColor: colors.successSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckCircle2 size={18} color={colors.success} strokeWidth={2} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodySmall" weight="600">
          {formatMonth(record.dueDate)} maintenance
        </AppText>
        <AppText variant="micro" color={colors.mutedForeground}>
          {formatDate(record.paidAt)} · {paymentMethodLabel(record.paymentMethod)}
        </AppText>
      </View>

      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <AppText variant="bodySmall" weight="700" color={colors.success}>
          {formatCurrency(record.monthlyAmount)}
        </AppText>
        <AppText variant="micro" color={colors.mutedForeground}>
          Paid
        </AppText>
      </View>

      {onPress ? <ChevronRight size={16} color={colors.mutedForeground} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
