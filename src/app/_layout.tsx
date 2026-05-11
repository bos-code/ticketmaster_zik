import "../../global.css";
import "@/lib/firebase";

import { ThemeProvider } from "@react-navigation/native";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useCallback, useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PremiumStartupScreen } from "@/components/premium-startup-screen";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { StatusBar } from "expo-status-bar";
import {
  APP_STATUS_BAR_BLACK,
  SPLASH_STATUS_BAR_COLOR,
} from "@/constants/theme";
import { ticketColors, ticketNavigationTheme } from "@/constants/ticket-theme";
import { useFirebaseDataSync } from "@/hooks/use-firebase-data-sync";
import { QueryProvider } from "@/providers/query-provider";
import { useAppStore } from "@/store/use-app-store";
import { fonts } from "../../theme/fonts";

if (Constants.expoGoConfig === null) {
  SplashScreen.setOptions({ duration: 450, fade: true });
}
void SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: ticketColors.background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="admin/index"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="admin/preview"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="tickets/index"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="tickets/[orderId]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="events/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="event-directions/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="nativewind-test" options={{ animation: "none" }} />
      <Stack.Screen
        name="settings/index"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="settings/app"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useFirebaseDataSync();
  const [fontsLoaded, fontError] = useFonts({
    [fonts.regular]: require("../../assets/fonts/Inter-Regular.ttf"),
    [fonts.medium]: require("../../assets/fonts/Inter-Medium.ttf"),
    [fonts.semiBold]: require("../../assets/fonts/Inter-SemiBold.ttf"),
    [fonts.bold]: require("../../assets/fonts/Inter-Bold.ttf"),
    [fonts.extraBold]: require("../../assets/fonts/Inter-ExtraBold.ttf"),
    [fonts.black]: require("../../assets/fonts/Inter-Black.ttf"),
    [fonts.displayRegular]: require("../../assets/fonts/SpaceGrotesk-Regular.ttf"),
    [fonts.displayMedium]: require("../../assets/fonts/SpaceGrotesk-Medium.ttf"),
    [fonts.displaySemiBold]: require("../../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    [fonts.displayBold]: require("../../assets/fonts/SpaceGrotesk-Bold.ttf"),
    [fonts.monoRegular]: require("../../assets/fonts/JetBrainsMono-Regular.ttf"),
    [fonts.monoBold]: require("../../assets/fonts/JetBrainsMono-Bold.ttf"),
    [fonts.monoExtraBold]: require("../../assets/fonts/JetBrainsMono-ExtraBold.ttf"),
  });
  const hasFinishedStartup = useAppStore((state) => state.hasFinishedStartup);
  const finishStartup = useAppStore((state) => state.finishStartup);
  const hasHiddenNativeSplash = useRef(false);
  const startupStatusBarColor = SPLASH_STATUS_BAR_COLOR;
  const startupBackgroundColor = SPLASH_STATUS_BAR_COLOR;
  const statusBarBackgroundColor = hasFinishedStartup
    ? APP_STATUS_BAR_BLACK
    : startupStatusBarColor;
  // Use splash blue during startup to ensure no seams, transition to app background after
  const appBackgroundColor = hasFinishedStartup
    ? ticketColors.background
    : startupBackgroundColor;
  const statusBarStyle = "light";
  const isReady = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(appBackgroundColor).catch(
      () => {},
    );

    if (Platform.OS === "web" && typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {
        // Ignore registration errors
      });
    }
  }, [appBackgroundColor]);

  const handleRootLayout = useCallback(() => {
    if (!isReady) {
      return;
    }

    if (hasHiddenNativeSplash.current) {
      return;
    }

    hasHiddenNativeSplash.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, [isReady]);

  const handleStartupFinish = useCallback(() => {
    finishStartup();
  }, [finishStartup]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <ThemeProvider value={ticketNavigationTheme}>
          <View
            style={{ flex: 1, backgroundColor: appBackgroundColor }}
            onLayout={handleRootLayout}
          >
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
              />
              <link rel="manifest" href="/manifest.json" />
              <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
              <meta name="theme-color" content={APP_STATUS_BAR_BLACK} />
              <meta name="color-scheme" content="dark" />
            </Head>
            <StatusBar backgroundColor={APP_STATUS_BAR_BLACK} style="light" />
            <RootStack />
            <PwaInstallPrompt isStartupFinished={hasFinishedStartup} />
            {!hasFinishedStartup ? (
              <PremiumStartupScreen onFinish={handleStartupFinish} />
            ) : null}
          </View>
        </ThemeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
