import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/common/button";
import { ScrollScreen } from "@/components/common/screen";
import { TextField } from "@/components/common/text-field";
import { API_BASE_URL } from "@/constants/config";
import { SOCIETY } from "@/constants/society";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/profile/schemas";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import { errorMessage } from "@/utils/errors";

export default function LoginScreen() {
  const router = useRouter();
  const { colors, radius, spacing } = useAppTheme();
  const signIn = useAuthStore((state) => state.signIn);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const dismissSessionExpired = useAuthStore(
    (state) => state.dismissSessionExpired
  );
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await signIn(values.email, values.password);

      // Navigate explicitly once the session is confirmed instead of relying
      // only on the protected-route guard, which can leave the auth screen
      // visible on some web/native navigator states.
      router.replace("/(tabs)");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <ScrollScreen
      keyboard
      bottomInset={false}
      contentContainerStyle={{ flexGrow: 1, paddingTop: spacing.xxl }}
    >
      <View style={{ gap: spacing.xl }}>
        <View style={{ gap: spacing.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <BrandMark size={46} />
            <View>
              <AppText variant="label" weight="700">
                SocietyAI
              </AppText>
              <AppText variant="micro" color={colors.mutedForeground}>
                {SOCIETY.name}
              </AppText>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="title">Welcome back</AppText>
            <AppText variant="body" color={colors.mutedForeground}>
              Sign in to view your maintenance, receipts and society assistant.
            </AppText>
          </View>
        </View>

        {sessionExpired ? (
          <AlertBanner
            tone="warning"
            title="Session expired"
            message="Please sign in again to continue."
            onDismiss={dismissSessionExpired}
          />
        ) : null}

        {formError ? (
          <AlertBanner
            tone="danger"
            title="Could not sign in"
            message={formError}
            onDismiss={() => setFormError(null)}
          />
        ) : null}

        <View style={{ gap: spacing.md }}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email"
                icon={Mail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Password"
                icon={Lock}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                returnKeyType="go"
                onSubmitEditing={() => {
                  void onSubmit();
                }}
              />
            )}
          />

          <Button
            label="Sign in"
            icon={ArrowRight}
            iconPosition="right"
            onPress={() => {
              void onSubmit();
            }}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: spacing.xs }}
          />
        </View>

        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 5 }}>
            <AppText variant="bodySmall" color={colors.mutedForeground}>
              New to SocietyAI?
            </AppText>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Create an account"
              onPress={() => router.push("/(auth)/signup")}
              hitSlop={8}
            >
              <AppText variant="bodySmall" weight="600" color={colors.primary}>
                Create an account
              </AppText>
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingTop: spacing.md,
            }}
          >
            <ShieldCheck size={13} color={colors.mutedForeground} />
            <AppText variant="micro" color={colors.mutedForeground}>
              Secure, society-verified access
            </AppText>
          </View>

          {__DEV__ ? (
            <AppText
              variant="micro"
              color={colors.mutedForeground}
              align="center"
              style={{ opacity: 0.7 }}
            >
              API · {API_BASE_URL}
            </AppText>
          ) : null}
        </View>
      </View>

      <View
        style={{
          marginTop: "auto",
          paddingTop: spacing.xxl,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: radius.sm,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldCheck size={14} color={colors.primary} />
        </View>
        <AppText variant="micro" color={colors.mutedForeground} style={{ flex: 1 }}>
          {SOCIETY.supportNote}
        </AppText>
      </View>
    </ScrollScreen>
  );
}
