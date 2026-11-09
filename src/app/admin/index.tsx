import { useRouter } from "expo-router";
import {
  IndianRupee,
  Plus,
  Search,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

import { AdminMaintenanceRow } from "@/components/admin/admin-maintenance-row";
import { RaiseMaintenanceSheet } from "@/components/admin/raise-maintenance-sheet";
import { ResidentRow } from "@/components/admin/resident-row";
import { AlertBanner } from "@/components/common/alert-banner";
import { Card } from "@/components/common/card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { IconButton } from "@/components/common/misc";
import { Screen } from "@/components/common/screen";
import { ScreenHeader } from "@/components/common/screen-header";
import { SectionHeader } from "@/components/common/section-header";
import { SegmentedControl } from "@/components/common/segmented-control";
import { Skeleton } from "@/components/common/skeleton";
import { TextField } from "@/components/common/text-field";
import { MetricTile } from "@/components/dashboard/metric-tile";
import {
  useAdminMaintenance,
  useAdminUsers,
  useCreateMaintenance,
  useDeleteUser,
  useUpdateUserRole,
} from "@/features/admin/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import type { AdminMaintenanceRecord, AdminUser } from "@/types/api";
import { errorMessage } from "@/utils/errors";
import {
  formatCurrency,
  formatMonth,
  maintenanceStatusMeta,
} from "@/utils/format";

type TabKey = "ledger" | "residents";
type StatusFilter = "all" | "open" | "paid";
type Row =
  | { kind: "maintenance"; record: AdminMaintenanceRecord }
  | { kind: "user"; user: AdminUser };

const TABS = [
  { key: "ledger" as const, label: "Ledger" },
  { key: "residents" as const, label: "Residents" },
];

const STATUS_FILTERS = [
  { key: "all" as const, label: "All" },
  { key: "open" as const, label: "Open" },
  { key: "paid" as const, label: "Paid" },
];

function recordResidentName(record: AdminMaintenanceRecord): string {
  if (typeof record.userId === "string") {
    return "Resident";
  }

  return record.userId.name || record.userId.email || "Resident";
}

function compactCurrency(value: number): string {
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`;
  }

  if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(1)}k`;
  }

  return formatCurrency(value, { compactZero: true });
}

export default function AdminScreen() {
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const me = useAuthStore((state) => state.user);

  const usersQuery = useAdminUsers();
  const maintenanceQuery = useAdminMaintenance();
  const createMutation = useCreateMaintenance();
  const roleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  const [tab, setTab] = useState<TabKey>("ledger");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [raising, setRaising] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const query = search.trim().toLowerCase();

  const usersById = useMemo(
    () => new Map(users.map((user) => [user._id, user])),
    [users]
  );

  /**
   * `GET /admin/maintenance` returns raw `userId` strings, so join them with
   * the user list here. Without this the ledger cannot show whose bill it is.
   */
  const records = useMemo(() => {
    return (maintenanceQuery.data ?? []).map((record) => {
      if (typeof record.userId !== "string") {
        return record;
      }

      const resident = usersById.get(record.userId);

      if (!resident) {
        return record;
      }

      return {
        ...record,
        userId: {
          _id: resident._id,
          name: resident.name,
          email: resident.email,
          address: resident.address,
        },
      };
    });
  }, [maintenanceQuery.data, usersById]);

  const residents = useMemo(
    () => users.filter((user) => user.role !== "admin"),
    [users]
  );

  const stats = useMemo(() => {
    let outstanding = 0;
    let collected = 0;
    let overdue = 0;

    for (const record of records) {
      if (record.status === "paid") {
        collected += record.monthlyAmount;
        continue;
      }

      outstanding += record.pendingAmount;

      if (record.status === "overdue") {
        overdue += 1;
      }
    }

    return {
      residents: residents.length,
      admins: users.length - residents.length,
      outstanding,
      collected,
      overdue,
    };
  }, [records, residents.length, users.length]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (status === "open" && record.status === "paid") {
        return false;
      }

      if (status === "paid" && record.status !== "paid") {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        recordResidentName(record),
        typeof record.userId === "string"
          ? ""
          : record.userId.email,
        formatMonth(record.dueDate),
        maintenanceStatusMeta(record.status).label,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, status, query]);

  const filteredUsers = useMemo(() => {
    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.address, user.phone]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [users, query]);

  const data: Row[] = useMemo(() => {
    if (tab === "ledger") {
      return filteredRecords.map((record) => ({
        kind: "maintenance" as const,
        record,
      }));
    }

    return filteredUsers.map((user) => ({ kind: "user" as const, user }));
  }, [tab, filteredRecords, filteredUsers]);

  const refreshing = usersQuery.isRefetching || maintenanceQuery.isRefetching;
  const loading =
    (usersQuery.isLoading && !usersQuery.data) ||
    (maintenanceQuery.isLoading && !maintenanceQuery.data);

  const onRefresh = () => {
    void Promise.allSettled([
      usersQuery.refetch(),
      maintenanceQuery.refetch(),
    ]);
  };

  const openRaise = () => {
    createMutation.reset();
    setRaising(true);
  };

  const toggleRole = (user: AdminUser) => {
    const nextRole = user.role === "admin" ? "resident" : "admin";

    Alert.alert(
      nextRole === "admin" ? "Grant admin access?" : "Remove admin access?",
      nextRole === "admin"
        ? `${user.name} will be able to manage residents, roles and the maintenance ledger.`
        : `${user.name} will lose access to the admin panel immediately.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: nextRole === "admin" ? "Make admin" : "Make resident",
          style: nextRole === "admin" ? "default" : "destructive",
          onPress: () => {
            roleMutation.mutate(
              { id: user._id, role: nextRole },
              {
                onSuccess: () => {
                  setNotice(
                    nextRole === "admin"
                      ? `${user.name} is now an administrator.`
                      : `${user.name} is now a resident.`
                  );
                },
                onError: (error) => {
                  Alert.alert("Could not update role", errorMessage(error));
                },
              }
            );
          },
        },
      ]
    );
  };

  const confirmDelete = (user: AdminUser) => {
    Alert.alert(
      `Delete ${user.name}?`,
      "This removes the resident and all of their maintenance and payment records. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(user._id, {
              onSuccess: () => {
                setNotice(`${user.name} was deleted.`);
              },
              onError: (error) => {
                Alert.alert("Could not delete resident", errorMessage(error));
              },
            });
          },
        },
      ]
    );
  };

  if (me?.role !== "admin") {
    return (
      <Screen>
        <ScreenHeader
          showBack
          title="Admin"
          subtitle="Society operations"
        />
        <Card style={{ margin: spacing.xl }}>
          <EmptyState
            icon={ShieldAlert}
            title="Admin access only"
            description="This area is limited to society administrators."
            actionLabel="Go back"
            onAction={() => router.back()}
          />
        </Card>
      </Screen>
    );
  }

  const activeError = tab === "ledger" ? maintenanceQuery.error : usersQuery.error;
  const activeRefetch =
    tab === "ledger" ? maintenanceQuery.refetch : usersQuery.refetch;

  const renderItem: ListRenderItem<Row> = ({ item }) => {
    if (item.kind === "maintenance") {
      return (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            paddingHorizontal: spacing.lg,
          }}
        >
          <AdminMaintenanceRow
            record={item.record}
            last
            onPress={() => router.push(`/invoice/${item.record._id}`)}
          />
        </View>
      );
    }

    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          paddingHorizontal: spacing.lg,
        }}
      >
        <ResidentRow
          user={item.user}
          isSelf={item.user._id === me?._id}
          onToggleRole={() => toggleRole(item.user)}
          onDelete={() => confirmDelete(item.user)}
          last
        />
      </View>
    );
  };

  return (
    <Screen>
      <FlatList
        data={data}
        keyExtractor={(item) =>
          item.kind === "maintenance" ? item.record._id : item.user._id
        }
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.sm,
          paddingBottom: spacing.huge,
          gap: 8,
        }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.card}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <ScreenHeader
              showBack
              compact
              eyebrow="Administration"
              title="Society operations"
              subtitle="Bills, residents and access in one place."
              right={
                <IconButton
                  icon={Plus}
                  accessibilityLabel="Raise maintenance"
                  onPress={openRaise}
                  filled
                  disabled={residents.length === 0}
                />
              }
            />

            {notice ? (
              <AlertBanner
                tone="success"
                message={notice}
                onDismiss={() => setNotice(null)}
              />
            ) : null}

            {usersQuery.isError && maintenanceQuery.isError ? (
              <AlertBanner
                tone="danger"
                message={errorMessage(maintenanceQuery.error)}
                actionLabel="Retry"
                onAction={onRefresh}
              />
            ) : null}

            {loading ? (
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <Skeleton height={112} radius={14} />
                  <Skeleton height={112} radius={14} />
                </View>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <Skeleton height={112} radius={14} />
                  <Skeleton height={112} radius={14} />
                </View>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <MetricTile
                    icon={Users}
                    label="Residents"
                    value={String(stats.residents)}
                    hint={`${stats.admins} admin${stats.admins === 1 ? "" : "s"}`}
                    tone="primary"
                  />
                  <MetricTile
                    icon={ShieldAlert}
                    label="Overdue bills"
                    value={String(stats.overdue)}
                    hint={stats.overdue === 0 ? "All clear" : "Need follow-up"}
                    tone={stats.overdue === 0 ? "success" : "danger"}
                  />
                </View>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <MetricTile
                    icon={Wallet}
                    label="Outstanding"
                    value={compactCurrency(stats.outstanding)}
                    hint="Across open bills"
                    tone={stats.outstanding === 0 ? "success" : "warning"}
                  />
                  <MetricTile
                    icon={IndianRupee}
                    label="Collected"
                    value={compactCurrency(stats.collected)}
                    hint="All settled bills"
                    tone="success"
                  />
                </View>
              </View>
            )}

            <SegmentedControl
              options={TABS}
              value={tab}
              onChange={(next) => {
                setTab(next);
                setSearch("");
              }}
            />

            <TextField
              icon={Search}
              value={search}
              onChangeText={setSearch}
              placeholder={
                tab === "ledger"
                  ? "Search bills by resident or month"
                  : "Search residents by name or email"
              }
              autoCapitalize="none"
              autoCorrect={false}
            />

            {tab === "ledger" ? (
              <SegmentedControl
                options={STATUS_FILTERS}
                value={status}
                onChange={setStatus}
              />
            ) : null}

            <SectionHeader
              title={tab === "ledger" ? "Maintenance ledger" : "Residents"}
              caption={`${data.length} ${
                tab === "ledger"
                  ? data.length === 1
                    ? "bill"
                    : "bills"
                  : data.length === 1
                    ? "person"
                    : "people"
              }`}
            />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 8 }}>
              <Skeleton height={72} radius={14} />
              <Skeleton height={72} radius={14} />
              <Skeleton height={72} radius={14} />
            </View>
          ) : activeError ? (
            <Card>
              <ErrorState
                message={errorMessage(activeError)}
                onRetry={() => {
                  void activeRefetch();
                }}
              />
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon={tab === "ledger" ? Wallet : Users}
                title={
                  query
                    ? "No matches"
                    : tab === "ledger"
                      ? "No bills yet"
                      : "No residents yet"
                }
                description={
                  query
                    ? "Try a different name, email or billing month."
                    : tab === "ledger"
                      ? "Raise the first maintenance bill for a resident."
                      : "Residents appear here after creating an account."
                }
                actionLabel={
                  tab === "ledger" && residents.length > 0
                    ? "Raise maintenance"
                    : undefined
                }
                onAction={
                  tab === "ledger" && residents.length > 0
                    ? openRaise
                    : undefined
                }
              />
            </Card>
          )
        }
      />

      {raising ? (
        <RaiseMaintenanceSheet
          visible
          users={users}
          loading={createMutation.isPending}
          error={
            createMutation.isError
              ? errorMessage(createMutation.error)
              : undefined
          }
          onClose={() => {
            setRaising(false);
            createMutation.reset();
          }}
          onSubmit={(input) => {
            createMutation.mutate(input, {
              onSuccess: (record) => {
                const resident = users.find((user) => user._id === input.userId);
                setRaising(false);
                setNotice(
                  `${formatCurrency(record.monthlyAmount)} bill created for ${
                    resident?.name ?? "the resident"
                  }.`
                );
              },
            });
          }}
        />
      ) : null}
    </Screen>
  );
}
