import { X } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/common/app-text";
import { useAppTheme } from "@/hooks/use-app-theme";

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  maxHeight?: `${number}%`;
};

export function Sheet({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  scrollable = true,
  maxHeight = "88%",
}: SheetProps) {
  const { colors, radius, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();

  const body = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.sm }}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ gap: spacing.lg }}>{children}</View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              maxHeight,
              paddingHorizontal: spacing.xl,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              paddingTop: spacing.sm,
            },
          ]}
        >
          <View
            style={{
              alignSelf: "center",
              width: 38,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.borderStrong,
              marginBottom: spacing.md,
            }}
          />

          {title ? (
            <View style={styles.header}>
              <View style={{ flex: 1, gap: 3 }}>
                <AppText variant="heading">{title}</AppText>
                {description ? (
                  <AppText variant="caption" color={colors.mutedForeground}>
                    {description}
                  </AppText>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.close,
                  {
                    backgroundColor: colors.muted,
                    borderRadius: radius.pill,
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}
              >
                <X size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ) : null}

          <View style={{ flexShrink: 1 }}>{body}</View>

          {footer ? (
            <View style={{ paddingTop: spacing.lg, gap: spacing.sm }}>{footer}</View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    marginTop: "auto",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  close: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
