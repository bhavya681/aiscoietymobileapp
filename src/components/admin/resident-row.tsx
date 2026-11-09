import { ShieldCheck, Trash2, UserRound } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Avatar } from "@/components/common/avatar";
import { Badge } from "@/components/common/badge";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { AdminUser } from "@/types/api";

type ResidentRowProps = {
  user: AdminUser;
  isSelf: boolean;
  onToggleRole: () => void;
  onDelete: () => void;
  last?: boolean;
};

export function ResidentRow({
  user,
  isSelf,
  onToggleRole,
  onDelete,
  last = false,
}: ResidentRowProps) {
  const { colors, radius, spacing } = useAppTheme();
  const isAdmin = user.role === "admin";

  return (
    <View
      style={[
        styles.row,
        {
          paddingVertical: spacing.md,
          gap: spacing.md,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Avatar name={user.name} size={40} tone={isAdmin ? "primary" : "muted"} />

      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AppText variant="bodySmall" weight="600" numberOfLines={1} style={{ flexShrink: 1 }}>
            {user.name}
          </AppText>
          {isSelf ? (
            <Badge label="You" tone="neutral" dot={false} size="sm" />
          ) : null}
        </View>
        <AppText variant="micro" color={colors.mutedForeground} numberOfLines={1}>
          {user.email}
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              backgroundColor: isAdmin ? colors.primarySoft : colors.muted,
              borderRadius: radius.pill,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            {isAdmin ? (
              <ShieldCheck size={9} color={colors.primary} strokeWidth={2.4} />
            ) : (
              <UserRound size={9} color={colors.mutedForeground} strokeWidth={2.4} />
            )}
            <AppText
              variant="micro"
              weight="600"
              color={isAdmin ? colors.primary : colors.mutedForeground}
            >
              {isAdmin ? "Admin" : "Resident"}
            </AppText>
          </View>
          {user.address ? (
            <AppText variant="micro" color={colors.mutedForeground} numberOfLines={1} style={{ flex: 1 }}>
              {user.address}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 2 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isAdmin ? "Make resident" : "Make admin"}
          disabled={isSelf}
          onPress={onToggleRole}
          hitSlop={6}
          style={({ pressed }) => [
            styles.action,
            {
              borderRadius: radius.sm,
              opacity: isSelf ? 0.35 : pressed ? 0.55 : 1,
            },
          ]}
        >
          <ShieldCheck
            size={16}
            color={isAdmin ? colors.mutedForeground : colors.primary}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete resident"
          disabled={isSelf}
          onPress={onDelete}
          hitSlop={6}
          style={({ pressed }) => [
            styles.action,
            {
              borderRadius: radius.sm,
              opacity: isSelf ? 0.35 : pressed ? 0.55 : 1,
            },
          ]}
        >
          <Trash2 size={16} color={colors.destructive} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  action: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
