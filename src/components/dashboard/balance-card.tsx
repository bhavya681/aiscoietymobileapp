import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
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
    <LinearGradient
      colors={
        settled
          ? ["#174d3c", "#123a2d", "#0e2a21"]
          : ["#226b52", "#1a5541", "#123a2d"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: radius.xl, padding: spacing.xl }]}
    >
      <View style={[styles.orb, styles.orbLarge]} />
      <View style={[styles.orb, styles.orbSmall]} />

      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {settled ? (
            <CheckCircle2 size={14} color="#c9f0de" strokeWidth={2.2} />
          ) : (
            <Sparkles size={14} color="#c9f0de" strokeWidth={2.2} />
          )}
          <AppText
            variant="monoLabel"
            style={{ color: "#c9f0de", textTransform: "uppercase" }}
          >
            {settled ? "All dues cleared" : "Outstanding balance"}
          </AppText>
        </View>

        <View
          style={[
            styles.dueChip,
            {
              backgroundColor: overdue ? "#f07a7233" : "#ffffff1c",
              borderColor: overdue ? "#f07a7255" : "#ffffff26",
            },
          ]}
        >
          <Clock3
            size={11}
            color={overdue ? "#ffd3cf" : "#d7f3e7"}
            strokeWidth={2.2}
          />
          <AppText
            variant="micro"
            weight="600"
            style={{ color: overdue ? "#ffd3cf" : "#d7f3e7" }}
          >
            {settled ? "No action needed" : dueLabel(nextDueDate)}
          </AppText>
        </View>
      </View>

      <AppText
        style={{
          color: "#f7fbf8",
          fontSize: 40,
          lineHeight: 46,
          letterSpacing: -1.6,
          fontWeight: "700",
          marginTop: spacing.sm,
        }}
      >
        {formatCurrency(totalPending)}
      </AppText>

      <AppText variant="bodySmall" style={{ color: "#c9f0de", marginTop: 2 }}>
        {settled
          ? "You are up to date with your society maintenance."
          : `Next due ${formatDate(nextDueDate)} · Monthly ${
              monthlyAmount ? formatCurrency(monthlyAmount) : "—"
            }`}
      </AppText>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <AppText
            variant="micro"
            weight="600"
            style={{ color: "#9fdec2", textTransform: "uppercase", letterSpacing: 1 }}
          >
            Monthly maintenance
          </AppText>
          <AppText
            variant="bodySmall"
            weight="600"
            style={{ color: "#f7fbf8", marginTop: 2 }}
          >
            {monthlyAmount ? formatCurrency(monthlyAmount) : "Not raised yet"}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={settled ? "View maintenance history" : "Review and pay maintenance"}
          onPress={onPress}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: "#f7fbf8",
              borderRadius: radius.pill,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <AppText
            variant="label"
            weight="700"
            style={{ color: "#14523e" }}
          >
            {settled ? "View history" : "Pay now"}
          </AppText>
          <ArrowRight size={15} color="#14523e" strokeWidth={2.4} />
        </Pressable>
      </View>

      {overdue ? (
        <AppText
          variant="caption"
          style={{ color: "#ffd3cf", marginTop: spacing.sm }}
        >
          Late fee of ₹200 may apply after the 10th.
        </AppText>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    position: "relative",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#ffffff",
    opacity: 0.05,
  },
  orbLarge: {
    width: 220,
    height: 220,
    top: -110,
    right: -70,
  },
  orbSmall: {
    width: 130,
    height: 130,
    bottom: -70,
    left: -40,
    opacity: 0.04,
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
