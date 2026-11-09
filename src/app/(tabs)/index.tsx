import { useRouter } from "expo-router";
import {
  ArrowRight,
  History,
  ReceiptText,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { Avatar } from "@/components/common/avatar";
import { BrandLockup } from "@/components/common/brand-mark";
import { ErrorState } from "@/components/common/error-state";
import { ScrollScreen } from "@/components/common/screen";
import { SectionHeader } from "@/components/common/section-header";
import { Skeleton } from "@/components/common/skeleton";
import { AdminBanner } from "@/components/dashboard/admin-banner";
import { AiEntryCard } from "@/components/dashboard/ai-entry-card";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { QuickActions, type QuickAction } from "@/components/dashboard/quick-actions";
import { SocietyCard } from "@/components/dashboard/society-card";
import { TransactionRow } from "@/components/dashboard/transaction-row";
import { SOCIETY } from "@/constants/society";
import {
  useMaintenanceHistory,
  usePendingMaintenance,
} from "@/features/maintenance/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import type { MaintenanceRecord } from "@/types/api";
import { errorMessage } from "@/utils/errors";
import { formatCurrency, pluralize } from "@/utils/format";

function greeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function firstName(name?: string): string {
  return name?.trim().split(/\s+/)[0] ?? "resident";
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const offline = useAuthStore((state) => state.offline);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const pendingQuery = usePendingMaintenance();
  const historyQuery = useMaintenanceHistory();

  const pending = pendingQuery.data;
  const history = historyQuery.data?.history ?? [];

  const isLoading =
    (pendingQuery.isLoading && !pending) ||
    (historyQuery.isLoading && history.length === 0);

  const hasError = pendingQuery.isError || historyQuery.isError;
  const error = pendingQuery.error ?? historyQuery.error;

  const refreshing =
    pendingQuery.isRefetching || historyQuery.isRefetching;

  const onRefresh = () => {
    void Promise.allSettled([
      pendingQuery.refetch(),
      historyQuery.refetch(),
      refreshProfile(),
    ]);
  };

  const paidRecords = history.filter((record) => record.status === "paid");
  const totalPaid = paidRecords.reduce(
    (total, record) => total + record.monthlyAmount,
    0
  );
  const openBills = pending?.maintenance.length ?? 0;
  const overdueCount =
    pending?.maintenance.filter((record) => record.status === "overdue").length ??
    0;
  const monthlyAmount =
    pending?.monthlyAmount ||
    history[0]?.monthlyAmount ||
    0;
  const recent = history.slice(0, 4);

  const isOverdue = (pending?.maintenance ?? []).some(
    (record) =>
      record.status === "overdue" ||
      new Date(record.dueDate).getTime() <
        new Date(new Date().toDateString()).getTime()
  );

  const actions: QuickAction[] = [
    {
      key: "pay",
      label: "Pay maintenance",
      icon: Wallet,
      tone: "primary",
      onPress: () => router.push("/(tabs)/maintenance"),
    },
    {
      key: "history",
      label: "Payment history",
      icon: History,
      tone: "success",
      onPress: () => router.push("/(tabs)/payments"),
    },
    {
      key: "assistant",
      label: "Ask the assistant",
      icon: Sparkles,
      tone: "inverse",
      onPress: () => router.push("/(tabs)/assistant"),
    },
    {
      key: "profile",
      label: "Profile & settings",
      icon: UserRound,
      tone: "warning",
      onPress: () => router.push("/(tabs)/profile"),
    },
  ];

  const openInvoice = (record: MaintenanceRecord) => {
    router.push(`/invoice/${record._id}`);
  };

  return (
    <ScrollScreen refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.topRow}>
        <BrandLockup subtitle={SOCIETY.name} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push("/(tabs)/profile")}
          style={({ pressed }) => [
            styles.avatarButton,
            {
              borderColor: colors.border,
              borderRadius: radius.pill,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Avatar name={user?.name} size={38} tone="primary" />
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg, gap: 3 }}>
        <AppText variant="caption" color={colors.mutedForeground}>
          {greeting()},
        </AppText>
        <AppText variant="title" numberOfLines={1}>
          {firstName(user?.name)}
        </AppText>
        <AppText variant="bodySmall" color={colors.mutedForeground}>
          Here is your society snapshot for today.
        </AppText>
      </View>

      {offline ? (
        <View style={{ marginBottom: spacing.md }}>
          <AlertBanner
            tone="warning"
            title="Showing saved profile"
            message="You are offline or the server is unreachable. Some figures may be out of date."
          />
        </View>
      ) : null}

      {user?.role === "admin" ? (
        <View style={{ marginBottom: spacing.md }}>
          <AdminBanner onPress={() => router.push("/admin")} />
        </View>
      ) : null}

      {isLoading ? (
        <HomeSkeleton />
      ) : hasError && !pending && history.length === 0 ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            marginBottom: spacing.lg,
          }}
        >
          <ErrorState
            message={errorMessage(error)}
            onRetry={() => {
              void pendingQuery.refetch();
              void historyQuery.refetch();
            }}
          />
        </View>
      ) : (
        <>
          {hasError ? (
            <View style={{ marginBottom: spacing.md }}>
              <AlertBanner
                tone="danger"
                message={errorMessage(error)}
                actionLabel="Retry"
                onAction={() => {
                  void pendingQuery.refetch();
                  void historyQuery.refetch();
                }}
              />
            </View>
          ) : null}

          {pending ? (
            <BalanceCard
              totalPending={pending.totalPending}
              monthlyAmount={monthlyAmount}
              nextDueDate={pending.nextDueDate}
              overdue={isOverdue}
              onPress={() => router.push("/(tabs)/maintenance")}
            />
          ) : null}

          <View style={{ flexDirection: "row", gap: 10, marginTop: spacing.md }}>
            <MetricTile
              icon={ReceiptText}
              label="Monthly"
              value={monthlyAmount ? formatCurrency(monthlyAmount) : "—"}
              hint={monthlyAmount ? "Standard tariff" : "Not raised yet"}
              tone="primary"
            />
            <MetricTile
              icon={History}
              label="Open bills"
              value={String(openBills)}
              hint={
                overdueCount > 0
                  ? `${overdueCount} overdue`
                  : openBills === 0
                    ? "All clear"
                    : "Upcoming"
              }
              tone={overdueCount > 0 ? "danger" : openBills > 0 ? "warning" : "success"}
            />
            <MetricTile
              icon={Wallet}
              label="Paid to date"
              value={formatCurrency(totalPaid)}
              hint={pluralize(paidRecords.length, "receipt")}
              tone="success"
            />
          </View>

          <SectionHeader title="Quick actions" />
          <QuickActions actions={actions} />

          <View style={{ marginTop: spacing.md }}>
            <AiEntryCard
              onPress={() => router.push("/(tabs)/assistant")}
              suggestion={
                isOverdue
                  ? "Your account has an overdue balance. Ask me what to do next."
                  : "Ask about dues, invoices, receipts or society rules."
              }
            />
          </View>

          <SectionHeader
            title="Recent activity"
            actionLabel="View all"
            onAction={() => router.push("/(tabs)/payments")}
          />

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              paddingHorizontal: spacing.lg,
            }}
          >
            {recent.length > 0 ? (
              recent.map((record, index) => (
                <TransactionRow
                  key={record._id}
                  record={record}
                  last={index === recent.length - 1}
                  onPress={() => openInvoice(record)}
                />
              ))
            ) : (
              <View style={{ paddingVertical: spacing.xl, gap: 4 }}>
                <AppText variant="bodySmall" weight="600">
                  No maintenance records yet
                </AppText>
                <AppText variant="caption" color={colors.mutedForeground}>
                  Your society will raise your first maintenance bill here.
                </AppText>
              </View>
            )}
          </View>

          <SectionHeader title="Society information" />
          <SocietyCard />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: spacing.xxl }}>
            <AppText variant="micro" color={colors.mutedForeground}>
              SocietyAI · {SOCIETY.name}
            </AppText>
            <ArrowRight size={10} color={colors.mutedForeground} />
          </View>
        </>
      )}
    </ScrollScreen>
  );
}

function HomeSkeleton() {
  const { colors, spacing, radius } = useAppTheme();

  return (
    <View style={{ gap: spacing.md }}>
      <Skeleton height={178} radius={radius.xl} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Skeleton height={112} radius={radius.md} style={{ flex: 1 }} />
        <Skeleton height={112} radius={radius.md} style={{ flex: 1 }} />
        <Skeleton height={112} radius={radius.md} style={{ flex: 1 }} />
      </View>
      <Skeleton height={80} radius={radius.md} />
      <Skeleton height={80} radius={radius.md} />
      <Skeleton height={70} radius={radius.lg} />
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        <Skeleton width="50%" height={13} />
        <Skeleton height={12} />
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  avatarButton: {
    borderWidth: 2,
    padding: 2,
  },
});
