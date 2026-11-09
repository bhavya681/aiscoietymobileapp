import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MapPin, Phone, UserRound } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { Button } from "@/components/common/button";
import { Sheet } from "@/components/common/sheet";
import { TextField } from "@/components/common/text-field";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/features/profile/schemas";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import type { Profile } from "@/types/api";
import { errorMessage } from "@/utils/errors";

type EditProfileSheetProps = {
  visible: boolean;
  user: Profile;
  onClose: () => void;
  onSaved: () => void;
};

export function EditProfileSheet({
  visible,
  user,
  onClose,
  onSaved,
}: EditProfileSheetProps) {
  const { colors, spacing } = useAppTheme();
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      address: user.address,
    },
    mode: "onTouched",
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await updateProfile(values);
      onSaved();
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <Sheet
      visible={visible}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Edit profile"
      description="Keep your contact details current for society communication."
      footer={
        <Button
          label="Save changes"
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
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Full name"
            icon={UserRound}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            autoComplete="name"
          />
        )}
      />

      <TextField
        label="Email"
        icon={Mail}
        value={user.email}
        editable={false}
        helper="Email is your sign-in identity and cannot be changed here."
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Phone"
            icon={Phone}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phone?.message}
            keyboardType="phone-pad"
            autoComplete="tel"
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
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.address?.message}
            multiline
            autoComplete="street-address"
          />
        )}
      />

      <AppText variant="micro" color={colors.mutedForeground} style={{ lineHeight: 17 }}>
        Your role and account status are managed by the society administrator.
      </AppText>

      <View style={{ height: spacing.xs }} />
    </Sheet>
  );
}
