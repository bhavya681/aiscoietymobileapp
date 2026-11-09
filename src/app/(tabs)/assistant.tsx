import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
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
            <Sparkles size={19} color={colors.primary} strokeWidth={2} />
          </View>

          <View style={{ flex: 1, gap: 1 }}>
            <AppText variant="heading" style={{ fontSize: 17 }}>
              SocietyAI assistant
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
                Grounded in your society records
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
              <LinearGradient
                colors={["#10221a", "#184030", "#21523c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: radius.xl,
                  padding: spacing.xl,
                  gap: spacing.sm,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: "#ffffff14",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: spacing.xs,
                  }}
                >
                  <Sparkles size={22} color="#9fdec2" strokeWidth={2} />
                </View>
                <AppText
                  style={{
                    fontSize: 23,
                    lineHeight: 29,
                    fontWeight: "700",
                    letterSpacing: -0.6,
                    color: "#f4faf6",
                  }}
                >
                  Your society, answered.
                </AppText>
                <AppText
                  variant="bodySmall"
                  style={{ color: "#b3d2c1", lineHeight: 20 }}
                >
                  Ask about pending dues, invoices, receipts or society policies.
                  Answers use your real records — never guesses.
                </AppText>

                <View style={{ gap: 8, marginTop: spacing.sm }}>
                  <Capability
                    icon={TrendingUp}
                    text="Live pending balance and due dates"
                  />
                  <Capability
                    icon={CheckCircle2}
                    text="Payment history with invoice details"
                  />
                  <Capability
                    icon={BookOpen}
                    text="Society policy, timings and late fees"
                  />
                </View>
              </LinearGradient>

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
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon size={14} color="#8fd0b4" strokeWidth={2} />
      <AppText variant="caption" style={{ color: "#c7e3d4" }}>
        {text}
      </AppText>
    </View>
  );
}
