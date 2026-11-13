import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Card } from "@/components/common/card";
import { numeric } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type AccountSummaryProps = {
  monthlyAmount: number;
  openBills: number;
  overdueCount: number;
  totalPaid: number;
  paidCount: number;
};

export function AccountSummary({
  monthlyAmount,
  openBills,
  overdueCount,
  totalPaid,
  paidCount,
}: AccountSummaryProps) {
  const { colors, spacing } = useAppTheme();

  const billHint =
    overdueCount > 0
      ? `${overdueCount} overdue`
      : openBills === 0
        ? "All clear"
        : "Upcoming";

  return (
    <Card padded={false} style={styles.row}>
      <Stat
        label="Monthly"
        value={monthlyAmount ? `₹${monthlyAmount.toLocaleString("en-IN")}` : "—"}
        hint={monthlyAmount ? "Standard tariff" : "Not raised"}
      />
      <Divider color={colors.border} />
      <Stat
        label="Open bills"
        value={String(openBills)}
        hint={billHint}
        hintColor={
          overdueCount > 0
            ? colors.destructive
            : openBills > 0
              ? colors.warning
              : colors.success
        }
      />
      <Divider color={colors.border} />
      <Stat
        label="Paid to date"
        value={`₹${totalPaid.toLocaleString("en-IN")}`}
        hint={`${paidCount} ${paidCount === 1 ? "receipt" : "receipts"}`}
      />
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  hintColor,
}: {
  label: string;
  value: string;
  hint: string;
  hintColor?: string;
}) {
  const { colors, spacing } = useAppTheme();

  return (
    <View style={{ flex: 1, paddingVertical: spacing.md, paddingHorizontal: 10 }}>
      <AppText
        variant="micro"
        color={colors.mutedForeground}
        numberOfLines={1}
        style={{ letterSpacing: 0.5, textTransform: "uppercase" }}
      >
        {label}
      </AppText>
      <AppText
        weight="700"
        numberOfLines={1}
        style={{
          fontSize: 17,
          lineHeight: 23,
          letterSpacing: -0.4,
          marginTop: 3,
          ...numeric,
        }}
      >
        {value}
      </AppText>
      <AppText
        variant="micro"
        color={hintColor ?? colors.mutedForeground}
        numberOfLines={1}
        style={{ marginTop: 1 }}
      >
        {hint}
      </AppText>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <View
      style={{
        width: StyleSheet.hairlineWidth,
        backgroundColor: color,
        marginVertical: 14,
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
});
