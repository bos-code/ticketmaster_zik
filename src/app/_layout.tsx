import '@/global.css';

import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { PremiumStartupScreen } from '@/components/premium-startup-screen';
import { ticketColors, ticketNavigationTheme } from '@/constants/ticket-theme';
import { clerkPublishableKey } from '@/lib/clerk';
import { QueryProvider } from '@/providers/query-provider';
import { useAppStore } from '@/store/use-app-store';

if (Constants.expoGoConfig === null) {
  SplashScreen.setOptions({ duration: 450, fade: true });
}
void SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: ticketColors.background },
        animation: 'fade',
      }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const hasFinishedStartup = useAppStore((state) => state.hasFinishedStartup);
  const finishStartup = useAppStore((state) => state.finishStartup);
  const hasHiddenNativeSplash = useRef(false);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(ticketColors.background).catch(() => {});
  }, []);

  const handleRootLayout = useCallback(() => {
    if (hasHiddenNativeSplash.current) {
      return;
    }

    hasHiddenNativeSplash.current = true;
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleStartupFinish = useCallback(() => {
    finishStartup();
  }, [finishStartup]);

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <QueryProvider>
        <ThemeProvider value={ticketNavigationTheme}>
          <View style={{ flex: 1, backgroundColor: ticketColors.background }} onLayout={handleRootLayout}>
            <StatusBar style="dark" backgroundColor={ticketColors.background} />
            <RootStack />
            {!hasFinishedStartup ? <PremiumStartupScreen onFinish={handleStartupFinish} /> : null}
          </View>
        </ThemeProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
