import { ShieldCheck, X } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Button } from "@/components/common/button";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { ChatConfirmation } from "@/types/api";
import { formatCurrency } from "@/utils/format";

type ConfirmationCardProps = {
  confirmation: ChatConfirmation;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmationCard({
  confirmation,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationCardProps) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={{
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.warning + "55",
        backgroundColor: colors.warningSoft,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <ShieldCheck size={18} color={colors.warning} strokeWidth={2} />
        <View style={{ flex: 1, gap: 1 }}>
          <AppText variant="label" weight="700" color={colors.warning}>
            Confirm this payment
          </AppText>
          <AppText variant="micro" color={colors.warning} style={{ opacity: 0.85 }}>
            Nothing is recorded until you confirm.
          </AppText>
        </View>
        <AppText
          style={{
            fontSize: 20,
            lineHeight: 26,
            fontWeight: "700",
            letterSpacing: -0.4,
            color: colors.warning,
          }}
        >
          {formatCurrency(confirmation.amount)}
        </AppText>
      </View>

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            label="Confirm payment"
            onPress={onConfirm}
            loading={loading}
            size="sm"
          />
        </View>
        <Button
          label="Not now"
          icon={X}
          variant="outline"
          onPress={onCancel}
          disabled={loading}
          size="sm"
          fullWidth={false}
        />
      </View>
    </View>
  );
}
