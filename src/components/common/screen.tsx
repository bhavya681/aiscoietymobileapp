import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/use-app-theme";

type ScreenProps = {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  keyboard?: boolean;
};

export function Screen({
  children,
  edges = ["top"],
  style,
  keyboard = false,
}: ScreenProps) {
  const { colors } = useAppTheme();

  const content = (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    >
      {children}
    </SafeAreaView>
  );

  if (!keyboard) {
    return content;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

type ScrollScreenProps = {
  children: React.ReactNode;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  bottomInset?: boolean;
  keyboard?: boolean;
};

export function ScrollScreen({
  children,
  edges = ["top"],
  contentContainerStyle,
  style,
  refreshing,
  onRefresh,
  bottomInset = true,
  keyboard = false,
}: ScrollScreenProps) {
  const { colors, spacing } = useAppTheme();

  return (
    <Screen edges={edges} style={style} keyboard={keyboard}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.sm,
            paddingBottom: bottomInset ? spacing.huge : spacing.lg,
          },
          contentContainerStyle,
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.card}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </Screen>
  );
}

export function Spacer({ height = 16 }: { height?: number }) {
  return <View style={{ height }} />;
}

export const screenStyles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center" },
});
