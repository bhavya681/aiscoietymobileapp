import { CalendarDays, FileText, ReceiptText } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Badge } from "@/components/common/badge";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { MaintenanceRecord } from "@/types/api";
import {
  daysFromToday,
  dueLabel,
  formatCurrency,
  formatDate,
  formatMonth,
  maintenanceStatusMeta,
} from "@/utils/format";

type PendingBillCardProps = {
  record: MaintenanceRecord;
  onPay: () => void;
  onInvoice: () => void;
};

export function PendingBillCard({ record, onPay, onInvoice }: PendingBillCardProps) {
  const { colors, radius, spacing } = useAppTheme();
  const status = maintenanceStatusMeta(record.status);
  const days = daysFromToday(record.dueDate);
  const overdue = (days ?? 0) < 0 || record.status === "overdue";

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={styles.header}>
        <View style={{ gap: 3, flex: 1 }}>
          <AppText variant="bodySmall" weight="600">
            {formatMonth(record.dueDate)}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <CalendarDays size={12} color={colors.mutedForeground} />
            <AppText variant="caption" color={colors.mutedForeground}>
              {overdue ? dueLabel(record.dueDate) : `Due ${formatDate(record.dueDate)}`}
            </AppText>
          </View>
        </View>
        <Badge label={status.label} tone={status.tone} />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          backgroundColor: colors.muted,
          borderRadius: radius.md,
          padding: spacing.md,
        }}
      >
        <View style={{ gap: 2 }}>
          <AppText variant="micro" color={colors.mutedForeground}>
            Amount due
          </AppText>
          <AppText variant="title" style={{ fontSize: 26, lineHeight: 32 }}>
            {formatCurrency(record.pendingAmount)}
          </AppText>
        </View>
        <View style={{ alignItems: "flex-end", gap: 2 }}>
          <AppText variant="micro" color={colors.mutedForeground}>
            Billed amount
          </AppText>
          <AppText variant="bodySmall" weight="600">
            {formatCurrency(record.monthlyAmount)}
          </AppText>
        </View>
      </View>

      {overdue ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: colors.destructiveSoft,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.sm,
          }}
        >
          <ReceiptText size={14} color={colors.destructive} />
          <AppText
            variant="micro"
            weight="500"
            color={colors.destructive}
            style={{ flex: 1 }}
          >
            A ₹200 late fee may be applied to overdue maintenance.
          </AppText>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button label="Pay now" onPress={onPay} />
        </View>
        <Button
          label="Invoice"
          icon={FileText}
          variant="outline"
          onPress={onInvoice}
          fullWidth={false}
          style={{ paddingHorizontal: 16 }}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
});
