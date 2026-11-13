import Constants from "expo-constants";
import { useRouter } from "expo-router";
import {
  Info,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  UserPen,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, View } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { ListRow } from "@/components/common/list-row";
import { ScrollScreen } from "@/components/common/screen";
import { ScreenHeader } from "@/components/common/screen-header";
import { SectionHeader } from "@/components/common/section-header";
import { SegmentedControl } from "@/components/common/segmented-control";
import { ChangePasswordSheet } from "@/components/profile/change-password-sheet";
import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import { ProfileCard } from "@/components/profile/profile-card";
import { APP_NAME } from "@/constants/config";
import { SOCIETY } from "@/constants/society";
import type { ThemeMode } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { errorMessage } from "@/utils/errors";

const THEME_OPTIONS = [
  { key: "system" as const, label: "System" },
  { key: "light" as const, label: "Light" },
  { key: "dark" as const, label: "Dark" },
];

const THEME_NOTES: Record<ThemeMode, string> = {
  system: "Follows your device appearance setting.",
  light: "Always use the light palette.",
  dark: "Always use the dark palette.",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) {
    return null;
  }

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut();
      router.replace("/(auth)/login");
    } finally {
      setSigningOut(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete account permanently?",
      "Your profile, maintenance records and payment history will be removed. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setDeleting(true);

              try {
                await deleteAccount();
                router.replace("/(auth)/login");
              } catch (error) {
                Alert.alert("Could not delete account", errorMessage(error));
              } finally {
                setDeleting(false);
              }
            })();
          },
        },
      ]
    );
  };

  return (
    <ScrollScreen>
      <ScreenHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your details, security and app preferences."
      />

      {notice ? (
        <View style={{ marginBottom: spacing.lg }}>
          <AlertBanner
            tone="success"
            message={notice}
            onDismiss={() => setNotice(null)}
          />
        </View>
      ) : null}

      <ProfileCard user={user} onEdit={() => setEditing(true)} />

      <SectionHeader title="Account" />
      <Card style={{ paddingVertical: 0 }}>
        <ListRow
          title="Edit profile"
          subtitle="Name, phone and address"
          icon={UserPen}
          onPress={() => setEditing(true)}
        />
        <ListRow
          title="Change password"
          subtitle="Update your sign-in password"
          icon={KeyRound}
          onPress={() => setChangingPassword(true)}
          last
        />
      </Card>

      <SectionHeader title="Appearance" />
      <Card style={{ gap: spacing.md }}>
        <SegmentedControl
          options={THEME_OPTIONS}
          value={mode}
          onChange={setMode}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {mode === "system" ? (
            <Monitor size={14} color={colors.mutedForeground} />
          ) : mode === "light" ? (
            <Sun size={14} color={colors.mutedForeground} />
          ) : (
            <Moon size={14} color={colors.mutedForeground} />
          )}
          <AppText variant="caption" color={colors.mutedForeground}>
            {THEME_NOTES[mode]}
          </AppText>
        </View>
      </Card>

      {user.role === "admin" ? (
        <>
          <SectionHeader title="Administration" />
          <Card style={{ paddingVertical: 0 }}>
            <ListRow
              title="Admin panel"
              subtitle="Residents, ledger and maintenance"
              icon={ShieldCheck}
              onPress={() => router.push("/admin")}
              last
            />
          </Card>
        </>
      ) : null}

      <SectionHeader title="About" />
      <Card style={{ gap: spacing.md }}>
        <View style={{ gap: 2 }}>
          <AppText variant="body" weight="600">
            {SOCIETY.name}
          </AppText>
          <AppText variant="caption" color={colors.mutedForeground}>
            {SOCIETY.legalName}
          </AppText>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
          }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Info size={14} color={colors.mutedForeground} />
          <AppText
            variant="caption"
            color={colors.mutedForeground}
            style={{ flex: 1, lineHeight: 18 }}
          >
            {SOCIETY.supportNote}
          </AppText>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AppText variant="caption" color={colors.mutedForeground}>
            {APP_NAME} for mobile
          </AppText>
          <AppText variant="caption" color={colors.mutedForeground}>
            v{version}
          </AppText>
        </View>
      </Card>

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <Button
          label="Sign out"
          icon={LogOut}
          variant="outline"
          onPress={handleSignOut}
          loading={signingOut}
        />

        <Card style={{ paddingVertical: 0, marginTop: spacing.sm }}>
          <ListRow
            title="Delete account"
            subtitle="Permanently remove your account and records"
            icon={Trash2}
            destructive
            onPress={deleting ? undefined : handleDelete}
            right={
              deleting ? (
                <AppText variant="caption" color={colors.destructive}>
                  Deleting…
                </AppText>
              ) : undefined
            }
            last
          />
        </Card>
      </View>

      {editing ? (
        <EditProfileSheet
          visible
          user={user}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            setNotice("Your profile has been updated.");
          }}
        />
      ) : null}

      {changingPassword ? (
        <ChangePasswordSheet
          visible
          onClose={() => setChangingPassword(false)}
        />
      ) : null}
    </ScrollScreen>
  );
}
