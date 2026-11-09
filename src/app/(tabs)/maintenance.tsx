import { useRouter } from "expo-router";
import {
  CheckCircle2,
  RefreshCw,
  ReceiptText,
  ShieldCheck,
} from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { Card } from "@/components/common/card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { IconButton } from "@/components/common/misc";
import { ScrollScreen } from "@/components/common/screen";
import { ScreenHeader } from "@/components/common/screen-header";
import { Skeleton } from "@/components/common/skeleton";
import { PaymentConfirmSheet } from "@/components/maintenance/payment-confirm-sheet";
import {
  PaymentReceiptSheet,
  type PaymentReceipt,
} from "@/components/maintenance/payment-receipt-sheet";
import { PendingBillCard } from "@/components/maintenance/pending-bill-card";
import {
  usePayMaintenance,
  usePendingMaintenance,
} from "@/features/maintenance/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { MaintenanceRecord, PaymentMethod } from "@/types/api";
import { errorMessage } from "@/utils/errors";
import { formatCurrency, formatDate, formatMonth } from "@/utils/format";

export default function MaintenanceScreen() {
  const router = useRouter();
  const { colors, radius, spacing } = useAppTheme();
  const pendingQuery = usePendingMaintenance();
  const payMutation = usePayMaintenance();

  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);

  const pending = pendingQuery.data;
  const records = pending?.maintenance ?? [];
  const overdueCount = records.filter((record) => record.status === "overdue").length;

  const openPayment = (record: MaintenanceRecord) => {
    payMutation.reset();
    setPaymentError(null);
    setMethod("upi");
    setSelectedRecord(record);
    setConfirmVisible(true);
  };

  const closePayment = () => {
    if (payMutation.isPending) {
      return;
    }

    setConfirmVisible(false);
    setSelectedRecord(null);
    setPaymentError(null);
  };

  const confirmPayment = () => {
    if (!selectedRecord) {
      return;
    }

    const record = selectedRecord;

    setPaymentError(null);

    payMutation.mutate(
      { id: record._id, paymentMethod: method },
      {
        onSuccess: (result) => {
          setConfirmVisible(false);
          setSelectedRecord(null);
          setReceipt({
            amount: result.amount,
            transactionId: result.transactionId,
            method,
            maintenanceId: record._id,
            paidAt: new Date().toISOString(),
            periodLabel: formatMonth(record.dueDate),
          });
          setReceiptVisible(true);
          void pendingQuery.refetch();
        },
        onError: (error) => {
          setPaymentError(errorMessage(error));
          void pendingQuery.refetch();
        },
      }
    );
  };

  return (
    <>
      <ScrollScreen
        refreshing={pendingQuery.isRefetching}
        onRefresh={() => {
          void pendingQuery.refetch();
        }}
      >
        <ScreenHeader
          eyebrow="Billing"
          title="Maintenance"
          subtitle="Review and settle your society dues."
          right={
            <IconButton
              icon={RefreshCw}
              accessibilityLabel="Refresh maintenance"
              onPress={() => {
                void pendingQuery.refetch();
              }}
              filled
            />
          }
        />

        {pendingQuery.isLoading && !pending ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={120} radius={radius.lg} />
            <Skeleton height={230} radius={radius.lg} />
            <Skeleton height={230} radius={radius.lg} />
          </View>
        ) : pendingQuery.isError && !pending ? (
          <Card>
            <ErrorState
              message={errorMessage(pendingQuery.error)}
              onRetry={() => {
                void pendingQuery.refetch();
              }}
            />
          </Card>
        ) : pending ? (
          <>
            <Card
              tone={pending.totalPending > 0 ? "primary" : "default"}
              style={{ gap: spacing.sm, marginBottom: spacing.md }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <View style={{ gap: 2 }}>
                  <AppText variant="micro" color={colors.mutedForeground}>
                    {pending.totalPending > 0
                      ? "Total outstanding"
                      : "Maintenance status"}
                  </AppText>
                  <AppText
                    style={{
                      fontSize: 30,
                      lineHeight: 36,
                      fontWeight: "700",
                      letterSpacing: -1,
                      color:
                        pending.totalPending > 0
                          ? colors.primary
                          : colors.success,
                    }}
                  >
                    {pending.totalPending > 0
                      ? formatCurrency(pending.totalPending)
                      : "All settled"}
                  </AppText>
                  <AppText variant="caption" color={colors.mutedForeground}>
                    {pending.totalPending > 0
                      ? `Next due ${formatDate(pending.nextDueDate)} · ${
                          pending.monthlyAmount
                            ? formatCurrency(pending.monthlyAmount)
                            : "—"
                        } monthly`
                      : "You have no outstanding maintenance."}
                  </AppText>
                </View>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: radius.md,
                    backgroundColor:
                      pending.totalPending > 0
                        ? colors.card
                        : colors.successSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {pending.totalPending > 0 ? (
                    <ReceiptText size={20} color={colors.primary} />
                  ) : (
                    <CheckCircle2 size={20} color={colors.success} />
                  )}
                </View>
              </View>
            </Card>

            {overdueCount > 0 ? (
              <View style={{ marginBottom: spacing.md }}>
                <AlertBanner
                  tone="danger"
                  title="Overdue balance"
                  message={`${overdueCount} ${
                    overdueCount === 1 ? "bill is" : "bills are"
                  } past the due date. A ₹200 late fee may apply.`}
                />
              </View>
            ) : null}

            {records.length > 0 ? (
              <View style={{ gap: spacing.md }}>
                {records.map((record) => (
                  <PendingBillCard
                    key={record._id}
                    record={record}
                    onPay={() => openPayment(record)}
                    onInvoice={() => router.push(`/invoice/${record._id}`)}
                  />
                ))}
              </View>
            ) : (
              <Card>
                <EmptyState
                  icon={CheckCircle2}
                  title="Everything is paid"
                  description="There is no pending maintenance on your account right now."
                  actionLabel="View payment history"
                  onAction={() => router.push("/(tabs)/payments")}
                />
              </Card>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
                marginTop: spacing.lg,
                paddingHorizontal: spacing.xs,
              }}
            >
              <ShieldCheck size={14} color={colors.mutedForeground} />
              <AppText
                variant="micro"
                color={colors.mutedForeground}
                style={{ flex: 1, lineHeight: 17 }}
              >
                Payments are recorded against your maintenance ledger. Your
                society office verifies every entry before closing the billing
                cycle.
              </AppText>
            </View>
          </>
        ) : null}
      </ScrollScreen>

      <PaymentConfirmSheet
        visible={confirmVisible}
        record={selectedRecord}
        method={method}
        onChangeMethod={setMethod}
        onConfirm={confirmPayment}
        onClose={closePayment}
        loading={payMutation.isPending}
        error={paymentError ?? undefined}
      />

      <PaymentReceiptSheet
        visible={receiptVisible}
        receipt={receipt}
        onClose={() => setReceiptVisible(false)}
        onViewInvoice={(maintenanceId) => {
          setReceiptVisible(false);
          router.push(`/invoice/${maintenanceId}`);
        }}
      />
    </>
  );
}
