import { useRouter } from "expo-router";
import { History, ReceiptText, RefreshCw, Wallet } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Card } from "@/components/common/card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { IconButton } from "@/components/common/misc";
import { ScrollScreen } from "@/components/common/screen";
import { ScreenHeader } from "@/components/common/screen-header";
import { SegmentedControl } from "@/components/common/segmented-control";
import { Skeleton } from "@/components/common/skeleton";
import { PaymentRow } from "@/components/payments/payment-row";
import { PaymentSummaryCard } from "@/components/payments/payment-summary-card";
import { usePendingMaintenance } from "@/features/maintenance/queries";
import { usePaymentHistory } from "@/features/payments/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { MaintenanceRecord } from "@/types/api";
import { errorMessage } from "@/utils/errors";
import { formatCurrency, formatMonth } from "@/utils/format";

type FilterKey = "all" | "year" | "quarter";

const FILTERS = [
  { key: "all" as const, label: "All" },
  { key: "year" as const, label: "This year" },
  { key: "quarter" as const, label: "90 days" },
];

function isWithin(record: MaintenanceRecord, filter: FilterKey): boolean {
  if (filter === "all") {
    return true;
  }

  const date = new Date(record.paidAt ?? record.createdAt ?? 0);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (filter === "year") {
    return date.getFullYear() === new Date().getFullYear();
  }

  return Date.now() - date.getTime() <= 90 * 86_400_000;
}

export default function PaymentsScreen() {
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const [filter, setFilter] = useState<FilterKey>("all");

  const paymentQuery = usePaymentHistory();
  const pendingQuery = usePendingMaintenance();

  const payments = useMemo(() => paymentQuery.data ?? [], [paymentQuery.data]);
  const pending = pendingQuery.data;
  const totalPaid = payments.reduce(
    (total, record) => total + record.monthlyAmount,
    0
  );

  const filtered = useMemo(
    () => payments.filter((record) => isWithin(record, filter)),
    [payments, filter]
  );

  const groups = useMemo(() => {
    const map = new Map<string, MaintenanceRecord[]>();

    for (const record of filtered) {
      const key = formatMonth(record.paidAt ?? record.createdAt);
      const current = map.get(key) ?? [];
      current.push(record);
      map.set(key, current);
    }

    return Array.from(map.entries());
  }, [filtered]);

  const refreshing = paymentQuery.isRefetching || pendingQuery.isRefetching;

  const onRefresh = () => {
    void Promise.allSettled([
      paymentQuery.refetch(),
      pendingQuery.refetch(),
    ]);
  };

  const loading = paymentQuery.isLoading && !paymentQuery.data;

  return (
    <ScrollScreen refreshing={refreshing} onRefresh={onRefresh}>
      <ScreenHeader
        eyebrow="Ledger"
        title="Payments"
        subtitle="Every maintenance payment recorded on your account."
        right={
          <IconButton
            icon={RefreshCw}
            accessibilityLabel="Refresh payments"
            onPress={onRefresh}
            filled
          />
        }
      />

      {loading ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton height={140} radius={14} />
          <Skeleton height={44} radius={10} />
          <Skeleton height={200} radius={14} />
        </View>
      ) : paymentQuery.isError && !paymentQuery.data ? (
        <Card>
          <ErrorState
            message={errorMessage(paymentQuery.error)}
            onRetry={() => {
              void paymentQuery.refetch();
            }}
          />
        </Card>
      ) : (
        <>
          <PaymentSummaryCard
            totalPaid={totalPaid}
            totalOutstanding={pending?.totalPending ?? 0}
            paidCount={payments.length}
            pendingCount={pending?.maintenance.length ?? 0}
          />

          {(pending?.totalPending ?? 0) > 0 ? (
            <Card
              style={{ marginTop: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md }}
              onPress={() => router.push("/(tabs)/maintenance")}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: colors.warningSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wallet size={17} color={colors.warning} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <AppText variant="bodySmall" weight="600">
                  {formatCurrency(pending?.totalPending ?? 0)} still outstanding
                </AppText>
                <AppText variant="micro" color={colors.mutedForeground}>
                  Settle your open bills from the maintenance tab.
                </AppText>
              </View>
              <ReceiptText size={16} color={colors.mutedForeground} />
            </Card>
          ) : null}

          <View style={{ marginTop: spacing.lg }}>
            <SegmentedControl
              options={FILTERS}
              value={filter}
              onChange={setFilter}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: spacing.lg,
              marginBottom: spacing.sm,
            }}
          >
            <AppText variant="label" color={colors.mutedForeground}>
              {filtered.length} {filtered.length === 1 ? "receipt" : "receipts"}
            </AppText>
            <AppText variant="label" weight="600">
              {formatCurrency(
                filtered.reduce((total, record) => total + record.monthlyAmount, 0)
              )}
            </AppText>
          </View>

          {groups.length === 0 ? (
            <Card>
              <EmptyState
                icon={History}
                title={
                  filter === "all" ? "No payments yet" : "Nothing in this period"
                }
                description={
                  filter === "all"
                    ? "Once you pay maintenance, the receipt appears here with its invoice."
                    : "Try a different period to see older receipts."
                }
                actionLabel={
                  (pending?.totalPending ?? 0) > 0 ? "View maintenance" : undefined
                }
                onAction={
                  (pending?.totalPending ?? 0) > 0
                    ? () => router.push("/(tabs)/maintenance")
                    : undefined
                }
              />
            </Card>
          ) : (
            <View style={{ gap: spacing.md }}>
              {groups.map(([month, records]) => (
                <View key={month}>
                  <AppText
                    variant="micro"
                    weight="600"
                    color={colors.mutedForeground}
                    style={{ marginBottom: 6, textTransform: "uppercase" }}
                  >
                    {month}
                  </AppText>
                  <View
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: spacing.lg,
                    }}
                  >
                    {records.map((record, index) => (
                      <PaymentRow
                        key={record._id}
                        record={record}
                        last={index === records.length - 1}
                        onPress={() => router.push(`/invoice/${record._id}`)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollScreen>
  );
}
