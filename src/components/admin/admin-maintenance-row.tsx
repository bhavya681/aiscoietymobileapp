import { CalendarDays, ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Badge } from "@/components/common/badge";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { AdminMaintenanceRecord } from "@/types/api";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  maintenanceStatusMeta,
} from "@/utils/format";

type AdminMaintenanceRowProps = {
  record: AdminMaintenanceRecord;
  onPress?: () => void;
  last?: boolean;
};

function residentName(record: AdminMaintenanceRecord): string {
  if (typeof record.userId === "string") {
    return "Resident";
  }

  return record.userId.name || record.userId.email || "Resident";
}

export function AdminMaintenanceRow({
  record,
  onPress,
  last = false,
}: AdminMaintenanceRowProps) {
  const { colors, radius, spacing } = useAppTheme();
  const status = maintenanceStatusMeta(record.status);

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${residentName(record)}, ${formatMonth(
        record.dueDate
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
          backgroundColor: colors.muted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CalendarDays size={17} color={colors.mutedForeground} strokeWidth={1.9} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodySmall" weight="600" numberOfLines={1}>
          {residentName(record)}
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Badge label={status.label} tone={status.tone} />
          <AppText variant="micro" color={colors.mutedForeground}>
            {formatMonth(record.dueDate)} · due {formatDate(record.dueDate)}
          </AppText>
        </View>
      </View>

      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <AppText variant="bodySmall" weight="700">
          {formatCurrency(record.monthlyAmount)}
        </AppText>
        <AppText variant="micro" color={colors.mutedForeground}>
          {record.status === "paid"
            ? "Settled"
            : `${formatCurrency(record.pendingAmount)} open`}
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
