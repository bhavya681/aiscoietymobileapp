import { Check, Lock } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { Button } from "@/components/common/button";
import { Divider, KeyValue } from "@/components/common/misc";
import { Sheet } from "@/components/common/sheet";
import { PaymentMethodPicker } from "@/components/maintenance/payment-method-picker";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { MaintenanceRecord, PaymentMethod } from "@/types/api";
import {
  formatCurrency,
  formatMonth,
  paymentMethodLabel,
} from "@/utils/format";

type PaymentConfirmSheetProps = {
  visible: boolean;
  record: MaintenanceRecord | null;
  method: PaymentMethod;
  onChangeMethod: (method: PaymentMethod) => void;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
  error?: string;
};

export function PaymentConfirmSheet({
  visible,
  record,
  method,
  onChangeMethod,
  onConfirm,
  onClose,
  loading,
  error,
}: PaymentConfirmSheetProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <Sheet
      visible={visible}
      onClose={loading ? () => undefined : onClose}
      title="Confirm payment"
      description="Record this maintenance payment in the society ledger."
      footer={
        <>
          <Button
            label={
              record ? `Confirm ${formatCurrency(record.pendingAmount)} payment` : "Confirm"
            }
            icon={Check}
            onPress={onConfirm}
            loading={loading}
            disabled={!record}
          />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={onClose}
            disabled={loading}
          />
        </>
      }
    >
      {record ? (
        <>
          <View
            style={{
              backgroundColor: colors.muted,
              borderRadius: radius.md,
              padding: spacing.lg,
              alignItems: "center",
              gap: 4,
            }}
          >
            <AppText variant="micro" color={colors.mutedForeground}>
              Amount to record
            </AppText>
            <AppText
              style={{
                fontSize: 34,
                lineHeight: 40,
                fontWeight: "700",
                letterSpacing: -1.2,
                color: colors.foreground,
              }}
            >
              {formatCurrency(record.pendingAmount)}
            </AppText>
            <AppText variant="caption" color={colors.mutedForeground}>
              {formatMonth(record.dueDate)} maintenance
            </AppText>
          </View>

          <View
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
            }}
          >
            <KeyValue label="Billing period" value={formatMonth(record.dueDate)} />
            <Divider />
            <KeyValue
              label="Payment method"
              value={paymentMethodLabel(method)}
            />
            <Divider />
            <KeyValue
              label="Amount"
              value={formatCurrency(record.pendingAmount)}
              strong
            />
          </View>

          <View style={{ gap: spacing.sm }}>
            <AppText variant="label" color={colors.mutedForeground}>
              How did you pay?
            </AppText>
            <PaymentMethodPicker value={method} onChange={onChangeMethod} />
          </View>

          {error ? <AlertBanner tone="danger" message={error} /> : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8,
              backgroundColor: colors.muted,
              borderRadius: radius.sm,
              padding: spacing.md,
            }}
          >
            <Lock size={14} color={colors.mutedForeground} />
            <AppText
              variant="micro"
              color={colors.mutedForeground}
              style={{ flex: 1, lineHeight: 17 }}
            >
              SocietyAI records the payment details you provide. It does not move
              money from your bank account. The society office verifies every
              entry.
            </AppText>
          </View>
        </>
      ) : null}
    </Sheet>
  );
}
