import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Receipt,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Badge } from "@/components/common/badge";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { MaintenanceRecord } from "@/types/api";
import {
  formatCurrency,
  formatDate,
  formatMonthShort,
  maintenanceStatusMeta,
} from "@/utils/format";

type TransactionRowProps = {
  record: MaintenanceRecord;
  onPress?: () => void;
  last?: boolean;
};

export function TransactionRow({ record, onPress, last = false }: TransactionRowProps) {
  const { colors, radius, spacing } = useAppTheme();
  const paid = record.status === "paid";
  const status = maintenanceStatusMeta(record.status);

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${formatMonthShort(record.dueDate)} maintenance, ${formatCurrency(
        paid ? record.monthlyAmount : record.pendingAmount
      )}, ${status.label}`}
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
          backgroundColor: paid ? colors.successSoft : colors.warningSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {paid ? (
          <ArrowDownLeft size={18} color={colors.success} strokeWidth={2} />
        ) : (
          <ArrowUpRight size={18} color={colors.warning} strokeWidth={2} />
        )}
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AppText variant="bodySmall" weight="600" numberOfLines={1}>
            {formatMonthShort(record.dueDate)} maintenance
          </AppText>
          <Receipt size={11} color={colors.mutedForeground} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Badge label={status.label} tone={status.tone} size="sm" />
          <AppText variant="micro" color={colors.mutedForeground}>
            {paid
              ? `Paid ${formatDate(record.paidAt)}`
              : `Due ${formatDate(record.dueDate)}`}
          </AppText>
        </View>
      </View>

      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <AppText
          variant="bodySmall"
          weight="700"
          color={paid ? colors.foreground : colors.warning}
        >
          {formatCurrency(paid ? record.monthlyAmount : record.pendingAmount)}
        </AppText>
        <AppText variant="micro" color={colors.mutedForeground}>
          {paid ? "Paid" : "Due"}
        </AppText>
      </View>

      {onPress ? (
        <ChevronRight size={16} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
