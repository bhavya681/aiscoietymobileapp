import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Check, Copy, FileText } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Button } from "@/components/common/button";
import { Divider, KeyValue } from "@/components/common/misc";
import { Sheet } from "@/components/common/sheet";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { PaymentMethod } from "@/types/api";
import {
  formatCurrency,
  formatDateTime,
  paymentMethodLabel,
} from "@/utils/format";

export type PaymentReceipt = {
  amount: number;
  transactionId: string;
  method: PaymentMethod | string;
  maintenanceId: string;
  paidAt: string;
  periodLabel?: string;
};

type PaymentReceiptSheetProps = {
  visible: boolean;
  receipt: PaymentReceipt | null;
  onClose: () => void;
  onViewInvoice: (maintenanceId: string) => void;
};

export function PaymentReceiptSheet({
  visible,
  receipt,
  onClose,
  onViewInvoice,
}: PaymentReceiptSheetProps) {
  const { colors, radius, spacing } = useAppTheme();

  const copyTransaction = async () => {
    if (!receipt) {
      return;
    }

    await Clipboard.setStringAsync(receipt.transactionId);
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    ).catch(() => undefined);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Payment recorded"
      footer={
        receipt ? (
          <>
            <Button
              label="View invoice"
              icon={FileText}
              onPress={() => onViewInvoice(receipt.maintenanceId)}
            />
            <Button label="Done" variant="ghost" onPress={onClose} />
          </>
        ) : null
      }
    >
      {receipt ? (
        <>
          <View style={{ alignItems: "center", gap: spacing.sm, paddingTop: spacing.sm }}>
            <View
              style={{
                width: 66,
                height: 66,
                borderRadius: 33,
                backgroundColor: colors.successSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  backgroundColor: colors.success,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={26} color="#ffffff" strokeWidth={3} />
              </View>
            </View>
            <AppText
              style={{
                fontSize: 30,
                lineHeight: 36,
                fontWeight: "700",
                letterSpacing: -1,
              }}
            >
              {formatCurrency(receipt.amount)}
            </AppText>
            <AppText variant="caption" color={colors.mutedForeground}>
              {receipt.periodLabel
                ? `${receipt.periodLabel} maintenance`
                : "Maintenance payment"}{" "}
              · {formatDateTime(receipt.paidAt)}
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
            <KeyValue
              label="Transaction ID"
              value={receipt.transactionId}
              strong
            />
            <Divider />
            <KeyValue
              label="Payment method"
              value={paymentMethodLabel(receipt.method)}
            />
            <Divider />
            <KeyValue label="Status" value="Success" valueColor={colors.success} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy transaction ID"
            onPress={copyTransaction}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: pressed ? 0.6 : 1,
              paddingVertical: spacing.xs,
            })}
          >
            <Copy size={14} color={colors.primary} />
            <AppText variant="label" weight="600" color={colors.primary}>
              Copy transaction ID
            </AppText>
          </Pressable>

          <AppText
            variant="micro"
            color={colors.mutedForeground}
            align="center"
            style={{ lineHeight: 17 }}
          >
            Keep this receipt for your records. It is also available from your
            payment history.
          </AppText>
        </>
      ) : null}
    </Sheet>
  );
}
