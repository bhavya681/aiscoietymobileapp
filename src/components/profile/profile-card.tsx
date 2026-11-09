import { Mail, MapPin, Phone, PencilLine, ShieldCheck } from "lucide-react-native";
import { View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { Avatar } from "@/components/common/avatar";
import { Badge } from "@/components/common/badge";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Profile } from "@/types/api";
import { roleLabel } from "@/utils/format";

type ProfileCardProps = {
  user: Profile;
  onEdit: () => void;
};

export function ProfileCard({ user, onEdit }: ProfileCardProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <Avatar name={user.name} size={60} />
        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="heading" numberOfLines={1}>
            {user.name}
          </AppText>
          <AppText variant="caption" color={colors.mutedForeground} numberOfLines={1}>
            {user.email}
          </AppText>
          <View style={{ flexDirection: "row", marginTop: 2 }}>
            <Badge
              label={roleLabel(user.role)}
              tone={user.role === "admin" ? "info" : "neutral"}
            />
          </View>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.muted,
          borderRadius: 10,
          padding: spacing.md,
          gap: spacing.sm,
        }}
      >
        <DetailRow icon={Mail} value={user.email || "No email on file"} />
        <DetailRow icon={Phone} value={user.phone || "No phone on file"} />
        <DetailRow
          icon={MapPin}
          value={user.address || "No address on file"}
        />
      </View>

      {user.role === "admin" ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={13} color={colors.primary} />
          <AppText variant="micro" color={colors.primary}>
            You have administrator access to the society ledger.
          </AppText>
        </View>
      ) : null}

      <Button
        label="Edit profile"
        icon={PencilLine}
        variant="outline"
        size="sm"
        onPress={onEdit}
      />
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon size={14} color={colors.mutedForeground} strokeWidth={2} />
      <AppText
        variant="caption"
        color={colors.mutedForeground}
        numberOfLines={2}
        style={{ flex: 1 }}
      >
        {value}
      </AppText>
    </View>
  );
}
