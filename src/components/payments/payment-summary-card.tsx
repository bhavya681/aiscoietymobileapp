import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Card } from "@/components/common/card";
import { useAppTheme } from "@/hooks/use-app-theme";
import { formatCurrency, pluralize } from "@/utils/format";

type PaymentSummaryCardProps = {
  totalPaid: number;
  totalOutstanding: number;
  paidCount: number;
  pendingCount: number;
};

export function PaymentSummaryCard({
  totalPaid,
  totalOutstanding,
  paidCount,
  pendingCount,
}: PaymentSummaryCardProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <StatBlock
          icon={ArrowDownLeft}
          label="Total paid"
          value={formatCurrency(totalPaid)}
          caption={pluralize(paidCount, "payment")}
          tone={colors.success}
          background={colors.successSoft}
        />
        <StatBlock
          icon={ArrowUpRight}
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          caption={pluralize(pendingCount, "open bill")}
          tone={totalOutstanding > 0 ? colors.warning : colors.mutedForeground}
          background={
            totalOutstanding > 0 ? colors.warningSoft : colors.muted
          }
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          backgroundColor: colors.muted,
          borderRadius: radius.sm,
          padding: spacing.sm,
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.primary,
          }}
        />
        <AppText variant="micro" color={colors.mutedForeground} style={{ flex: 1 }}>
          Payments are recorded in the society ledger. Open a receipt to view its
          invoice.
        </AppText>
      </View>
    </Card>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  caption,
  tone,
  background,
}: {
  icon: typeof ArrowDownLeft;
  label: string;
  value: string;
  caption: string;
  tone: string;
  background: string;
}) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.muted,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: 2,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: radius.xs,
          backgroundColor: background,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Icon size={15} color={tone} strokeWidth={2.2} />
      </View>
      <AppText variant="micro" color={colors.mutedForeground}>
        {label}
      </AppText>
      <AppText variant="heading" style={{ fontSize: 17 }} numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="micro" color={colors.mutedForeground}>
        {caption}
      </AppText>
    </View>
  );
}
