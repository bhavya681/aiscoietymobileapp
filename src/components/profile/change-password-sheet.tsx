import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { Button } from "@/components/common/button";
import { Sheet } from "@/components/common/sheet";
import { TextField } from "@/components/common/text-field";
import {
  passwordSchema,
  type PasswordFormValues,
} from "@/features/profile/schemas";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import { errorMessage } from "@/utils/errors";

type ChangePasswordSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function ChangePasswordSheet({ visible, onClose }: ChangePasswordSheetProps) {
  const { colors } = useAppTheme();
  const changePassword = useAuthStore((state) => state.changePassword);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      onClose();
      Alert.alert("Password updated", "Use your new password the next time you sign in.");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <Sheet
      visible={visible}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Change password"
      description="Choose a strong password you have not used before."
      footer={
        <Button
          label="Update password"
          onPress={() => {
            void submit();
          }}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      }
    >
      {formError ? (
        <AlertBanner
          tone="danger"
          message={formError}
          onDismiss={() => setFormError(null)}
        />
      ) : null}

      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Current password"
            icon={Lock}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.currentPassword?.message}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
          />
        )}
      />

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="New password"
            icon={KeyRound}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.newPassword?.message}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            helper="At least 8 characters."
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm new password"
            icon={KeyRound}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={() => {
              void submit();
            }}
          />
        )}
      />

      <AppText variant="micro" color={colors.mutedForeground} style={{ lineHeight: 17 }}>
        SocietyAI has no email reset flow. If you have forgotten your password,
        contact your society office to verify your identity.
      </AppText>
    </Sheet>
  );
}
