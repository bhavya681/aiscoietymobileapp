import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { FileDown, ReceiptText, Share2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Badge } from "@/components/common/badge";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { IconButton } from "@/components/common/misc";
import { ScrollScreen } from "@/components/common/screen";
import { ScreenHeader } from "@/components/common/screen-header";
import { SectionHeader } from "@/components/common/section-header";
import { Skeleton } from "@/components/common/skeleton";
import { SOCIETY } from "@/constants/society";
import { useAdminUsers } from "@/features/admin/queries";
import { useInvoice } from "@/features/maintenance/queries";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import type { Invoice, MaintenanceRecord } from "@/types/api";
import { errorMessage } from "@/utils/errors";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  invoiceStatusTone,
  maintenanceStatusMeta,
  paymentMethodLabel,
  titleCase,
} from "@/utils/format";

export default function InvoiceScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const query = useInvoice(id);
  const [sharing, setSharing] = useState(false);

  const invoice = query.data?.invoice ?? null;
  const record = query.data?.maintenance ?? null;

  // Admins can open a resident's invoice. Look the owner up so the receipt is
  // billed to the resident, not to the admin who is viewing it.
  const adminUsersQuery = useAdminUsers(user?.role === "admin");
  const billedTo =
    (user?.role === "admin"
      ? adminUsersQuery.data?.find(
          (resident) => resident._id === record?.userId
        )
      : user) ?? user;

  const share = async () => {
    if (!record) {
      return;
    }

    setSharing(true);

    try {
      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert("Sharing unavailable", "This device cannot share files.");
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html: buildReceiptHtml({ invoice, record, user: billedTo }),
      });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Share invoice",
      });
    } catch (error) {
      Alert.alert("Could not share invoice", errorMessage(error));
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollScreen>
      <ScreenHeader
        showBack
        compact
        eyebrow="Receipt"
        title={invoice?.invoiceNumber ?? "Invoice"}
        subtitle={record ? formatMonth(record.dueDate) : undefined}
        right={
          <IconButton
            icon={Share2}
            accessibilityLabel="Share invoice"
            onPress={() => {
              void share();
            }}
            disabled={!record || sharing}
            filled
          />
        }
      />

      {query.isLoading ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton height={170} radius={14} />
          <Skeleton height={140} radius={14} />
          <Skeleton height={180} radius={14} />
        </View>
      ) : query.isError ? (
        <Card>
          <ErrorState
            message={errorMessage(query.error)}
            onRetry={() => {
              void query.refetch();
            }}
          />
        </Card>
      ) : !record ? (
        <Card>
          <EmptyState
            icon={ReceiptText}
            title="Invoice not found"
            description="This maintenance record may have been removed from the ledger."
            actionLabel="Go back"
            onAction={() => router.back()}
          />
        </Card>
      ) : (
        <>
          <InvoiceHero invoice={invoice} record={record} />

          <SectionHeader title="Invoice details" />
          <Card style={{ gap: spacing.sm }}>
            <DetailRow label="Invoice number" value={invoice?.invoiceNumber ?? "—"} />
            <DetailRow label="Billing period" value={formatMonth(record.dueDate)} />
            <DetailRow label="Issue date" value={formatDate(invoice?.issueDate)} />
            <DetailRow label="Due date" value={formatDate(invoice?.dueDate ?? record.dueDate)} />
            <DetailRow
              label="Status"
              value={
                invoice
                  ? titleCase(invoice.status)
                  : maintenanceStatusMeta(record.status).label
              }
            />
          </Card>

          <SectionHeader title="Billed to" />
          <Card style={{ gap: spacing.xs }}>
            <AppText variant="body" weight="600">
              {billedTo?.name ?? "Resident"}
            </AppText>
            <AppText variant="caption" color={colors.mutedForeground}>
              {billedTo?.email ?? "—"}
            </AppText>
            <AppText variant="caption" color={colors.mutedForeground}>
              {billedTo?.address || "No address on file"}
            </AppText>
          </Card>

          <SectionHeader title={record.status === "paid" ? "Payment" : "Amount due"} />
          <Card style={{ gap: spacing.sm }}>
            {record.status === "paid" ? (
              <>
                <DetailRow label="Paid on" value={formatDate(record.paidAt)} />
                <DetailRow
                  label="Payment method"
                  value={paymentMethodLabel(record.paymentMethod)}
                />
                <DetailRow label="Amount paid" value={formatCurrency(record.monthlyAmount)} strong />
                <AppText
                  variant="micro"
                  color={colors.mutedForeground}
                  style={{ lineHeight: 17, marginTop: 4 }}
                >
                  The payment transaction ID was issued at the time of payment and is
                  shown on your payment confirmation.
                </AppText>
              </>
            ) : (
              <>
                <DetailRow label="Amount" value={formatCurrency(record.pendingAmount)} strong />
                <DetailRow label="Due" value={formatDate(record.dueDate)} />
                <Button
                  label="Pay this bill"
                  icon={ReceiptText}
                  onPress={() => router.push("/(tabs)/maintenance")}
                  style={{ marginTop: spacing.sm }}
                />
              </>
            )}
          </Card>

          <Card style={{ marginTop: spacing.lg, gap: 2 }}>
            <AppText variant="bodySmall" weight="600">
              {SOCIETY.name}
            </AppText>
            <AppText variant="micro" color={colors.mutedForeground}>
              {SOCIETY.legalName}
            </AppText>
            <AppText
              variant="micro"
              color={colors.mutedForeground}
              style={{ marginTop: 6 }}
            >
              This is a computer-generated invoice. Keep it for your records.
            </AppText>
          </Card>

          <Button
            label={sharing ? "Preparing…" : "Share as PDF"}
            icon={FileDown}
            variant="outline"
            onPress={() => {
              void share();
            }}
            loading={sharing}
            style={{ marginTop: spacing.lg }}
          />
        </>
      )}
    </ScrollScreen>
  );
}

function InvoiceHero({
  invoice,
  record,
}: {
  invoice: Invoice | null;
  record: MaintenanceRecord;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const status = invoice
    ? { label: titleCase(invoice.status), tone: invoiceStatusTone(invoice.status) }
    : maintenanceStatusMeta(record.status);

  return (
    <Card style={{ gap: spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="label" color={colors.mutedForeground}>
            {record.status === "paid" ? "Amount paid" : "Amount due"}
          </AppText>
          <AppText
            style={{
              fontSize: 34,
              lineHeight: 40,
              fontWeight: "700",
              letterSpacing: -1,
              color: colors.foreground,
            }}
          >
            {formatCurrency(
              record.status === "paid" ? record.monthlyAmount : record.pendingAmount
            )}
          </AppText>
        </View>
        <Badge label={status.label} tone={status.tone} size="md" />
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
        }}
      />

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ gap: 2 }}>
          <AppText variant="micro" color={colors.mutedForeground}>
            Billing period
          </AppText>
          <AppText variant="bodySmall" weight="600">
            {formatMonth(record.dueDate)}
          </AppText>
        </View>
        <View style={{ alignItems: "flex-end", gap: 2 }}>
          <AppText variant="micro" color={colors.mutedForeground}>
            {record.status === "paid" ? "Paid on" : "Due on"}
          </AppText>
          <AppText variant="bodySmall" weight="600">
            {formatDate(record.status === "paid" ? record.paidAt : record.dueDate)}
          </AppText>
        </View>
      </View>

      {record.status === "overdue" ? (
        <View
          style={{
            backgroundColor: colors.destructiveSoft,
            borderRadius: radius.sm,
            padding: spacing.sm,
          }}
        >
          <AppText variant="micro" color={colors.destructive} weight="600">
            This bill is overdue. Pay it to avoid further late fees.
          </AppText>
        </View>
      ) : null}
    </Card>
  );
}

function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 5,
      }}
    >
      <AppText variant="caption" color={colors.mutedForeground}>
        {label}
      </AppText>
      <AppText
        variant={strong ? "body" : "bodySmall"}
        weight={strong ? "700" : "500"}
        style={{ flexShrink: 1, textAlign: "right" }}
        numberOfLines={2}
      >
        {value}
      </AppText>
    </View>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReceiptHtml({
  invoice,
  record,
  user,
}: {
  invoice: Invoice | null;
  record: MaintenanceRecord;
  user: ReturnType<typeof useAuthStore.getState>["user"];
}): string {
  const paid = record.status === "paid";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #17211b; margin: 0; padding: 40px; }
    .brand { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1f6b52; padding-bottom: 20px; }
    .brand h1 { margin: 0; font-size: 22px; color: #1f6b52; }
    .brand p { margin: 4px 0 0; color: #5c6b62; font-size: 12px; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: ${paid ? "#e3f2ea" : "#fdf0d9"}; color: ${paid ? "#1f6b52" : "#8a5b12"}; }
    .amount { margin: 28px 0 8px; font-size: 34px; font-weight: 700; letter-spacing: -1px; }
    .caption { color: #5c6b62; font-size: 12px; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 28px; }
    td { padding: 9px 0; border-bottom: 1px solid #e2e6de; font-size: 13px; vertical-align: top; }
    td:first-child { color: #5c6b62; width: 44%; }
    td:last-child { text-align: right; font-weight: 600; }
    .footer { margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e6de; color: #7b877e; font-size: 11px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="brand">
    <div>
      <h1>${escapeHtml(SOCIETY.name)}</h1>
      <p>${escapeHtml(SOCIETY.legalName)}</p>
    </div>
    <span class="badge">${paid ? "Paid" : escapeHtml(record.status)}</span>
  </div>

  <p class="caption">${paid ? "Amount paid" : "Amount due"}</p>
  <div class="amount">${escapeHtml(
    formatCurrency(paid ? record.monthlyAmount : record.pendingAmount)
  )}</div>
  <p class="caption">Billing period: ${escapeHtml(formatMonth(record.dueDate))}</p>

  <table>
    <tr><td>Invoice number</td><td>${escapeHtml(invoice?.invoiceNumber ?? "—")}</td></tr>
    <tr><td>Billed to</td><td>${escapeHtml(user?.name ?? "Resident")}</td></tr>
    <tr><td>Email</td><td>${escapeHtml(user?.email ?? "—")}</td></tr>
    <tr><td>Address</td><td>${escapeHtml(user?.address || "—")}</td></tr>
    <tr><td>Issue date</td><td>${escapeHtml(formatDate(invoice?.issueDate))}</td></tr>
    <tr><td>Due date</td><td>${escapeHtml(formatDate(invoice?.dueDate ?? record.dueDate))}</td></tr>
    ${
      paid
        ? `<tr><td>Paid on</td><td>${escapeHtml(formatDate(record.paidAt))}</td></tr>
           <tr><td>Payment method</td><td>${escapeHtml(
             paymentMethodLabel(record.paymentMethod)
           )}</td></tr>`
        : ""
    }
  </table>

  <div class="footer">
    This is a computer-generated invoice. Keep it for your records.<br />
    ${escapeHtml(SOCIETY.supportNote)}
  </div>
</body>
</html>`;
}
