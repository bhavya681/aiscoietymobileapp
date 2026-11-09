import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import {
  CheckCircle2,
  Copy,
  Sparkles,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/app-text";
import { AlertBanner } from "@/components/common/alert-banner";
import { ConfirmationCard } from "@/components/assistant/confirmation-card";
import { OpenUIRenderer } from "@/components/assistant/openui";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { AssistantMessage } from "@/store/assistant-store";
import type { ChatConfirmation } from "@/types/api";
import { titleCase } from "@/utils/format";

type MessageBubbleProps = {
  message: AssistantMessage;
  pending: boolean;
  onConfirm: (messageId: string, confirmation: ChatConfirmation) => void;
  onCancelConfirmation: (messageId: string) => void;
};

export function MessageBubble({
  message,
  pending,
  onConfirm,
  onCancelConfirmation,
}: MessageBubbleProps) {
  const { colors, radius, spacing } = useAppTheme();
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View style={{ alignItems: "flex-end" }}>
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius.lg,
            borderBottomRightRadius: radius.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2,
            maxWidth: "86%",
          }}
        >
          <AppText
            variant="bodySmall"
            color={colors.primaryForeground}
            style={{ lineHeight: 21 }}
          >
            {message.content}
          </AppText>
        </View>
      </View>
    );
  }

  const copy = async () => {
    const content = message.content || message.ui || "";

    if (!content) {
      return;
    }

    await Clipboard.setStringAsync(content);
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    ).catch(() => undefined);
  };

  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: radius.sm,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        }}
      >
        <Sparkles size={14} color={colors.primary} strokeWidth={2} />
      </View>

      <View style={{ flex: 1, gap: 8 }}>
        {message.isError ? (
          <AlertBanner
            tone="danger"
            title="Assistant unavailable"
            message={message.content}
          />
        ) : message.ui ? (
          <OpenUIRenderer source={message.ui} />
        ) : (
          <AppText variant="body" style={{ lineHeight: 22 }}>
            {message.content}
          </AppText>
        )}

        {message.toolCalls && message.toolCalls.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {message.toolCalls.map((call, index) => (
              <ToolChip key={`${call.name}-${index}`} name={call.name} status={call.status} />
            ))}
          </View>
        ) : null}

        {message.confirmation ? (
          <ConfirmationCard
            confirmation={message.confirmation}
            loading={pending}
            onConfirm={() => onConfirm(message.id, message.confirmation as ChatConfirmation)}
            onCancel={() => onCancelConfirmation(message.id)}
          />
        ) : null}

        {!message.isError ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy answer"
            onPress={copy}
            hitSlop={8}
            style={({ pressed }) => [
              styles.copy,
              { opacity: pressed ? 0.55 : 1 },
            ]}
          >
            <Copy size={12} color={colors.mutedForeground} />
            <AppText variant="micro" color={colors.mutedForeground}>
              Copy
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ToolChip({
  name,
  status,
}: {
  name: string;
  status: "success" | "error" | "unauthorized" | "unknown";
}) {
  const { colors, radius } = useAppTheme();

  const meta =
    status === "success"
      ? { icon: CheckCircle2, color: colors.success, bg: colors.successSoft }
      : status === "unauthorized"
        ? { icon: XCircle, color: colors.destructive, bg: colors.destructiveSoft }
        : status === "error"
          ? { icon: XCircle, color: colors.destructive, bg: colors.destructiveSoft }
          : { icon: Wrench, color: colors.mutedForeground, bg: colors.muted };

  const Icon: LucideIcon = meta.icon;
  const label = titleCase(name.replace(/_/g, " "));

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: meta.bg,
        borderRadius: radius.pill,
        paddingHorizontal: 7,
        paddingVertical: 3,
      }}
    >
      <Icon size={10} color={meta.color} strokeWidth={2.4} />
      <AppText variant="micro" weight="500" color={meta.color}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
});
