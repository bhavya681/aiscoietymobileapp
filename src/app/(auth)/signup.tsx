import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Lock,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { BrandLockup } from "@/components/common/brand-mark";
import { Button } from "@/components/common/button";
import { ScreenHeader } from "@/components/common/screen-header";
import { ScrollScreen, Spacer } from "@/components/common/screen";
import { TextField } from "@/components/common/text-field";
import {
  signupSchema,
  type SignupFormValues,
} from "@/features/profile/schemas";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import { errorMessage } from "@/utils/errors";

export default function SignupScreen() {
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const signUp = useAuthStore((state) => state.signUp);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await signUp({
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        password: values.password,
      });
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <ScrollScreen keyboard bottomInset={false} edges={["top"]}>
      <ScreenHeader
        showBack
        onBack={() => router.back()}
        eyebrow="Resident access"
        title="Create your account"
        subtitle="Register with the details your society has on file."
      />

      <View style={{ gap: spacing.md, paddingTop: spacing.sm }}>
        {formError ? (
          <AlertBanner
            tone="danger"
            title="Could not create account"
            message={formError}
            onDismiss={() => setFormError(null)}
          />
        ) : null}

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Full name"
              icon={UserRound}
              placeholder="Asha Rao"
              autoComplete="name"
              textContentType="name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />

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
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Phone"
              icon={Phone}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Flat / address"
              icon={MapPin}
              placeholder="Flat B-402, Palm Grove Residency"
              autoComplete="street-address"
              textContentType="fullStreetAddress"
              multiline
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.address?.message}
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
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Confirm password"
              icon={Lock}
              placeholder="Repeat your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              returnKeyType="go"
              onSubmitEditing={() => {
                void onSubmit();
              }}
            />
          )}
        />

        <Button
          label="Create account"
          icon={ArrowRight}
          iconPosition="right"
          onPress={() => {
            void onSubmit();
          }}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={{ marginTop: spacing.sm }}
        />

        <AppText variant="caption" color={colors.mutedForeground} align="center">
          New accounts are created as residents. A society admin can grant
          administrator access later.
        </AppText>

        <Spacer height={spacing.xl} />

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 5 }}>
          <AppText variant="bodySmall" color={colors.mutedForeground}>
            Already registered?
          </AppText>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Sign in"
            onPress={() => router.replace("/(auth)/login")}
            hitSlop={8}
          >
            <AppText variant="bodySmall" weight="600" color={colors.primary}>
              Sign in
            </AppText>
          </Pressable>
        </View>

        <View style={{ alignItems: "center", paddingTop: spacing.md }}>
          <BrandLockup subtitle="Resident portal" size={32} />
        </View>
      </View>
    </ScrollScreen>
  );
}
