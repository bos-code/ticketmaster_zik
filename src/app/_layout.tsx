import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { PremiumStartupScreen } from '@/components/premium-startup-screen';
import { ticketColors, ticketNavigationTheme } from '@/constants/ticket-theme';

if (Constants.expoGoConfig === null) {
  SplashScreen.setOptions({ duration: 450, fade: true });
}
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [startupVisible, setStartupVisible] = useState(true);
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
    setStartupVisible(false);
  }, []);

  return (
    <ThemeProvider value={ticketNavigationTheme}>
      <View style={{ flex: 1, backgroundColor: ticketColors.background }} onLayout={handleRootLayout}>
        <StatusBar style="dark" backgroundColor={ticketColors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: ticketColors.background },
            animation: 'fade',
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" options={{ animation: 'none' }} />
        </Stack>
        {startupVisible ? <PremiumStartupScreen onFinish={handleStartupFinish} /> : null}
      </View>
    </ThemeProvider>
  );
}
