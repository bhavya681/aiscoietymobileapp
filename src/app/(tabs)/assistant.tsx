import {
  BookOpen,
  CheckCircle2,
  MessageSquareText,
  Trash2,
  TrendingUp,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { IconButton } from "@/components/common/misc";
import { Screen } from "@/components/common/screen";
import { ChatComposer } from "@/components/assistant/chat-composer";
import { MessageBubble } from "@/components/assistant/message-bubble";
import { SuggestionChips } from "@/components/assistant/suggestion-chips";
import { TypingIndicator } from "@/components/assistant/typing-indicator";
import { QUICK_PROMPTS } from "@/constants/society";
import { useAssistant } from "@/features/assistant/use-assistant";
import { useAppTheme } from "@/hooks/use-app-theme";
import { formatCurrency } from "@/utils/format";

export default function AssistantScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const {
    messages,
    pending,
    lastPayment,
    send,
    confirm,
    cancelConfirmation,
    reset,
    clearLastPayment,
  } = useAssistant();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [input, setInput] = useState("");

  const hasConversation = messages.length > 0;

  useEffect(() => {
    if (!hasConversation && !pending) {
      return;
    }

    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 60);

    return () => clearTimeout(timer);
  }, [messages.length, pending, hasConversation]);

  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim();

    if (!value || pending) {
      return;
    }

    if (!text) {
      setInput("");
    }

    await send(value);
  };

  const handleReset = () => {
    Alert.alert(
      "Clear conversation?",
      "This removes the chat from this device. Your payments and records are not affected.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: reset },
      ]
    );
  };

  return (
    <Screen edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.sm,
            paddingBottom: spacing.md,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.md,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageSquareText size={19} color={colors.primary} strokeWidth={1.9} />
          </View>

          <View style={{ flex: 1, gap: 1 }}>
            <AppText weight="600" style={{ fontSize: 17, letterSpacing: -0.3 }}>
              Assistant
            </AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: colors.success,
                }}
              />
              <AppText variant="micro" color={colors.mutedForeground}>
                Answers from your society records
              </AppText>
            </View>
          </View>

          <IconButton
            icon={Trash2}
            accessibilityLabel="Clear conversation"
            onPress={handleReset}
            disabled={!hasConversation || pending}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.lg,
            paddingBottom: spacing.xl,
            gap: spacing.lg,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (hasConversation) {
              scrollRef.current?.scrollToEnd({ animated: false });
            }
          }}
        >
          {lastPayment ? (
            <AlertBanner
              tone="success"
              title="Payment recorded"
              message={`${formatCurrency(lastPayment.amount)} was recorded successfully${
                lastPayment.transactionId
                  ? ` · ${lastPayment.transactionId}`
                  : ""
              }.`}
              onDismiss={clearLastPayment}
            />
          ) : null}

          {!hasConversation ? (
            <View style={{ gap: spacing.lg }}>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.xl,
                  gap: spacing.md,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: radius.md,
                      backgroundColor: colors.primarySoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MessageSquareText
                      size={21}
                      color={colors.primary}
                      strokeWidth={1.9}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText
                      variant="micro"
                      color={colors.mutedForeground}
                      style={{ letterSpacing: 0.7, textTransform: "uppercase" }}
                    >
                      Society help
                    </AppText>
                    <AppText
                      style={{
                        fontSize: 21,
                        lineHeight: 27,
                        fontWeight: "700",
                        letterSpacing: -0.6,
                        color: colors.foreground,
                      }}
                    >
                      Ask about your account
                    </AppText>
                  </View>
                </View>

                <AppText
                  variant="bodySmall"
                  color={colors.mutedForeground}
                  style={{ lineHeight: 20 }}
                >
                  Get clear answers about pending dues, invoices, receipts and
                  society policies. Every answer is grounded in your records.
                </AppText>

                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colors.border,
                  }}
                />

                <View style={{ gap: 10 }}>
                  <Capability
                    icon={TrendingUp}
                    text="Live balance and upcoming due dates"
                  />
                  <Capability
                    icon={CheckCircle2}
                    text="Payment history with invoice details"
                  />
                  <Capability
                    icon={BookOpen}
                    text="Society policies, timings and late fees"
                  />
                </View>
              </View>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="label" color={colors.mutedForeground}>
                  Try asking
                </AppText>
                <SuggestionChips
                  suggestions={QUICK_PROMPTS}
                  onSelect={(suggestion) => {
                    void handleSend(suggestion);
                  }}
                  disabled={pending}
                />
              </View>

              <AppText
                variant="micro"
                color={colors.mutedForeground}
                align="center"
                style={{ lineHeight: 17, paddingHorizontal: spacing.lg }}
              >
                The assistant can prepare a payment, but nothing is recorded until
                you confirm. It never moves money on its own.
              </AppText>
            </View>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  pending={pending}
                  onConfirm={confirm}
                  onCancelConfirmation={cancelConfirmation}
                />
              ))}
              {pending ? <TypingIndicator /> : null}
            </>
          )}
        </ScrollView>

        <ChatComposer
          value={input}
          onChangeText={setInput}
          onSend={() => {
            void handleSend();
          }}
          pending={pending}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Capability({
  icon: Icon,
  text,
}: {
  icon: typeof TrendingUp;
  text: string;
}) {
  const { colors, radius } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: radius.pill,
          backgroundColor: colors.successSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={13} color={colors.success} strokeWidth={2.1} />
      </View>
      <AppText
        variant="caption"
        color={colors.mutedForeground}
        style={{ flex: 1 }}
      >
        {text}
      </AppText>
    </View>
  );
}
