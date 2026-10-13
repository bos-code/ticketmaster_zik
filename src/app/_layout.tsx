import '@/lib/firebase';
import '../../global.css';

import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import React, { useCallback, useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PremiumStartupScreen } from '@/components/premium-startup-screen';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { SPLASH_STATUS_BAR_COLOR } from '@/constants/theme';
import { ticketColors, ticketNavigationTheme } from '@/constants/ticket-theme';
import { useFirebaseDataSync } from '@/hooks/use-firebase-data-sync';
import { QueryProvider } from '@/providers/query-provider';
import { useAppStore } from '@/store/use-app-store';
import { StatusBar } from 'expo-status-bar';
import { fonts } from '../../theme/fonts';

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
        animation: 'fade',
      }}
    >
      <Stack.Screen name='index' options={{ animation: 'none' }} />
      <Stack.Screen name='(tabs)' />
      <Stack.Screen
        name='account/[section]'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name='browse/[id]'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name='admin/index'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name='admin/preview'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name='tickets/index'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name='tickets/[orderId]'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name='events/[id]'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name='event-directions/[id]'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name='nativewind-test' options={{ animation: 'none' }} />
      <Stack.Screen
        name='settings/index'
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name='settings/app'
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useFirebaseDataSync();
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    [fonts.regular]: require('../../assets/fonts/Averta-Regular.ttf'),
    [fonts.semiBold]: require('../../assets/fonts/Averta-SemiBold.ttf'),
    [fonts.bold]: require('../../assets/fonts/Averta-Bold.otf'),
    [fonts.extraBold]: require('../../assets/fonts/Averta-ExtraBold.ttf'),
    [fonts.black]: require('../../assets/fonts/Averta-Black.otf'),
    [fonts.monoRegular]: require('../../assets/fonts/JetBrainsMono-Regular.ttf'),
    [fonts.monoBold]: require('../../assets/fonts/JetBrainsMono-Bold.ttf'),
    [fonts.monoExtraBold]: require('../../assets/fonts/JetBrainsMono-ExtraBold.ttf'),
  });
  const hasFinishedStartup = useAppStore((state) => state.hasFinishedStartup);
  const finishStartup = useAppStore((state) => state.finishStartup);
  const hasHiddenNativeSplash = useRef(false);
  const startupBackgroundColor = SPLASH_STATUS_BAR_COLOR;
  // Keep the splash color during startup, then transition to the app background.
  const appBackgroundColor = hasFinishedStartup
    ? ticketColors.background
    : startupBackgroundColor;
  const shellBackgroundColor = Platform.OS === 'web'
    ? '#000000'
    : appBackgroundColor;
  // Web text uses the local CSS font faces and can render while Expo loads fonts.
  const isReady = Platform.OS === 'web' || fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--app-shell-background',
        shellBackgroundColor,
      );
    }

    void SystemUI.setBackgroundColorAsync(shellBackgroundColor).catch(() => {});

    if (
      !__DEV__ &&
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/service-worker.js', { updateViaCache: 'none' })
        .catch(() => {
          // Ignore registration errors
        });
    }
  }, [appBackgroundColor, shellBackgroundColor]);

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
      <SafeAreaProvider>
        <QueryProvider>
          <ThemeProvider value={ticketNavigationTheme}>
            <View
              style={{ flex: 1, backgroundColor: shellBackgroundColor }}
              onLayout={handleRootLayout}
            >
              <StatusBar translucent backgroundColor='#FFFFFF' style='dark' />
              {!hasFinishedStartup ? (
                <PremiumStartupScreen onFinish={handleStartupFinish} />
              ) : (
                <>
                  <RootStack />
                  <PwaInstallPrompt isStartupFinished={hasFinishedStartup} />
                </>
              )}
            </View>
          </ThemeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
