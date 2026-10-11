import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { TicketmasterWordmark, TicketmasterTMark } from "@/components/ticketmaster-wordmark";
import { SPLASH_STATUS_BAR_COLOR } from "@/constants/theme";

type PremiumStartupScreenProps = {
  onFinish?: () => void;
};

const STARTUP_STATUS_BAR_COLOR = SPLASH_STATUS_BAR_COLOR;
const STARTUP_BACKGROUND_COLOR = SPLASH_STATUS_BAR_COLOR;

export function PremiumStartupScreen({ onFinish }: PremiumStartupScreenProps) {
  const tOpacity = useRef(new Animated.Value(0)).current;
  const tScale = useRef(new Animated.Value(0.8)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslateX = useRef(new Animated.Value(44)).current;

  useEffect(() => {
    // Animation Sequence
    const animation = Animated.sequence([
      // 1. Animate the 't' icon in
      Animated.parallel([
        Animated.timing(tOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(tScale, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
      
      // 2. Short pause
      Animated.delay(200),

      // 3. Fade out 't' and fade in wordmark
      Animated.parallel([
        Animated.timing(tOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 480,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(wordmarkTranslateX, {
          toValue: 0,
          duration: 480,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    ]);
    animation.start();

    const timeout = setTimeout(() => {
      onFinish?.();
    }, 3200); // Slightly longer to accommodate both animations

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [onFinish, tOpacity, tScale, wordmarkOpacity, wordmarkTranslateX]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { zIndex: 1000, backgroundColor: STARTUP_BACKGROUND_COLOR }]}>
      <Head>
        <meta name="theme-color" content={STARTUP_STATUS_BAR_COLOR} />
        <meta name="color-scheme" content="dark" />
      </Head>
      <StatusBar backgroundColor={STARTUP_STATUS_BAR_COLOR} style="light" />
      {Platform.OS !== "web" && (
        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: STARTUP_STATUS_BAR_COLOR, marginBottom: -50 }}
        >
          <View style={{ height: 50 }} />
        </SafeAreaView>
      )}

      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, backgroundColor: STARTUP_BACKGROUND_COLOR }}
      >
        {/* Standalone 't' Icon */}
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: tOpacity,
            transform: [{ scale: tScale }],
            position: 'absolute',
          }}
        >
          <TicketmasterTMark fill="white" size={190} />
        </Animated.View>

        {/* Full Wordmark */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              alignItems: 'center',
              justifyContent: 'center',
              opacity: wordmarkOpacity,
              transform: [{ translateX: wordmarkTranslateX }],
            },
          ]}
        >
          <TicketmasterWordmark fill="#FFFFFF" size={300} />
        </Animated.View>
      </View>
    </View>
  );
}
