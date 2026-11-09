import { ArrowUp } from "lucide-react-native";
import { useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";

type ChatComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  pending: boolean;
};

export function ChatComposer({ value, onChangeText, onSend, pending }: ChatComposerProps) {
  const { colors, radius, spacing } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const canSend = value.trim().length > 0 && !pending;

  const submit = () => {
    if (!canSend) {
      return;
    }

    Keyboard.dismiss();
    onSend();
  };

  return (
    <View
      style={{
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: spacing.sm,
          backgroundColor: colors.card,
          borderColor: focused ? colors.primary : colors.input,
          borderWidth: focused ? 1.5 : StyleSheet.hairlineWidth,
          borderRadius: radius.lg,
          paddingLeft: spacing.md,
          paddingRight: 6,
          paddingVertical: 6,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask about dues, invoices or society rules…"
          placeholderTextColor={colors.mutedForeground + "b0"}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          multiline
          maxLength={1000}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            color: colors.foreground,
            fontSize: 15,
            lineHeight: 21,
            maxHeight: 116,
            minHeight: 38,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend, busy: pending }}
          disabled={!canSend}
          onPress={submit}
          style={({ pressed }) => [
            styles.send,
            {
              width: 38,
              height: 38,
              borderRadius: radius.md,
              backgroundColor: canSend ? colors.primary : colors.muted,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ArrowUp
            size={19}
            color={canSend ? colors.primaryForeground : colors.mutedForeground}
            strokeWidth={2.6}
          />
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  send: {
    alignItems: "center",
    justifyContent: "center",
  },
});
