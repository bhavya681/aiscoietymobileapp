import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/api/query-client";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { colors, isDark } = useAppTheme();
  const status = useAuthStore((state) => state.status);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const themeHydrated = useThemeStore((state) => state.hydrated);
  const hydrateTheme = useThemeStore((state) => state.hydrate);

  const ready = hydrated && themeHydrated;
  const authenticated = status === "authenticated";

  useEffect(() => {
    void hydrate();
    void hydrateTheme();
  }, [hydrate, hydrateTheme]);

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Protected guard={!authenticated} redirectTo="/(tabs)">
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
        </Stack.Protected>

        <Stack.Protected guard={authenticated} redirectTo="/(auth)/login">
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen name="invoice/[id]" />
          <Stack.Screen name="admin/index" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
