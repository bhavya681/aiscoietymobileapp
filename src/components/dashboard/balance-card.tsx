import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { numeric } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { dueLabel, formatCurrency, formatDate } from "@/utils/format";

type BalanceCardProps = {
  totalPending: number;
  monthlyAmount: number;
  nextDueDate?: string | null;
  onPress: () => void;
  overdue?: boolean;
};

export function BalanceCard({
  totalPending,
  monthlyAmount,
  nextDueDate,
  onPress,
  overdue = false,
}: BalanceCardProps) {
  const { radius, spacing } = useAppTheme();
  const settled = totalPending <= 0;

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: radius.xl,
          padding: spacing.xl,
          backgroundColor: settled ? "#123a2c" : "#0f4331",
          borderColor: "#ffffff1f",
        },
      ]}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          {settled ? (
            <CheckCircle2 size={14} color="#a9e3c8" strokeWidth={2.2} />
          ) : (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#7fd6b0",
              }}
            />
          )}
          <AppText
            variant="monoLabel"
            style={{ color: "#b6ddca", textTransform: "uppercase" }}
          >
            {settled ? "Account settled" : "Amount outstanding"}
          </AppText>
        </View>

        <View
          style={[
            styles.dueChip,
            {
              backgroundColor: overdue ? "#f07a7224" : "#ffffff14",
              borderColor: overdue ? "#f07a7244" : "#ffffff1f",
            },
          ]}
        >
          <Clock3
            size={11}
            color={overdue ? "#ffd3cf" : "#cfe9dc"}
            strokeWidth={2.2}
          />
          <AppText
            variant="micro"
            weight="600"
            style={{ color: overdue ? "#ffd3cf" : "#cfe9dc" }}
          >
            {settled ? "No action needed" : dueLabel(nextDueDate)}
          </AppText>
        </View>
      </View>

      <AppText
        style={{
          color: "#f6fbf8",
          fontSize: 38,
          lineHeight: 44,
          letterSpacing: -1.4,
          fontWeight: "700",
          marginTop: spacing.md,
          ...numeric,
        }}
      >
        {formatCurrency(totalPending)}
      </AppText>

      <AppText variant="bodySmall" style={{ color: "#b6ddca", marginTop: 2 }}>
        {settled
          ? "You are up to date with your society maintenance."
          : `Next due ${formatDate(nextDueDate)} · Monthly ${
              monthlyAmount ? formatCurrency(monthlyAmount) : "—"
            }`}
      </AppText>

      <View style={styles.rule} />

      <View style={styles.footer}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText
            variant="micro"
            weight="600"
            style={{
              color: "#8fc7ad",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Monthly maintenance
          </AppText>
          <AppText
            variant="bodySmall"
            weight="600"
            style={{ color: "#f6fbf8", ...numeric }}
          >
            {monthlyAmount ? formatCurrency(monthlyAmount) : "Not raised yet"}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            settled ? "View maintenance history" : "Review and pay maintenance"
          }
          onPress={onPress}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: "#f4faf6",
              borderRadius: radius.sm,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <AppText variant="label" weight="700" style={{ color: "#10402f" }}>
            {settled ? "View history" : "Pay now"}
          </AppText>
          <ArrowRight size={14} color="#10402f" strokeWidth={2.4} />
        </Pressable>
      </View>

      {overdue ? (
        <AppText
          variant="caption"
          style={{ color: "#ffcbc6", marginTop: spacing.md }}
        >
          A late fee of ₹200 may apply after the 10th.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  dueChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ffffff1f",
    marginTop: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
