import {
  TicketmasterTMark,
  TicketmasterWordmark,
} from "@/components/ticketmaster-wordmark";
import { SPLASH_STATUS_BAR_COLOR } from "@/constants/theme";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    // Diagnostic logging
    console.log("[PremiumStartupScreen] Component mounted");

    // Animation Sequence
    Animated.sequence([
      // 1. Animate the 't' icon in
      Animated.parallel([
        Animated.timing(tOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(tScale, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
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
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 480,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkTranslateX, {
          toValue: 0,
          duration: 480,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timeout = setTimeout(() => {
      console.log("[PremiumStartupScreen] Calling onFinish");
      onFinish?.();
    }, 3200); // Slightly longer to accommodate both animations

    return () => {
      clearTimeout(timeout);
    };
  }, [onFinish, tOpacity, tScale, wordmarkOpacity, wordmarkTranslateX]);

  return (
    <View pointerEvents="none" className="absolute inset-0 z-[1000]">
      <Head>
        <meta name="theme-color" content={STARTUP_STATUS_BAR_COLOR} />
        <meta name="color-scheme" content="dark" />
      </Head>
      <StatusBar backgroundColor={STARTUP_STATUS_BAR_COLOR} style="light" />
      {Platform.OS !== "web" && (
        <SafeAreaView
          edges={["top"]}
          style={{
            backgroundColor: STARTUP_STATUS_BAR_COLOR,
            marginBottom: -50,
          }}
        >
          <View style={{ height: 50 }} />
        </SafeAreaView>
      )}

      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: STARTUP_BACKGROUND_COLOR }}
      >
        {/* Standalone 't' Icon */}
        <Animated.View
          style={{
            opacity: tOpacity,
            transform: [{ scale: tScale }],
            position: "absolute",
          }}
          className="inset-0 items-center justify-center"
        >
          <TicketmasterTMark fill="white" size={190} />
        </Animated.View>

        {/* Full Wordmark */}
        <Animated.View
          className="absolute inset-0 items-center justify-center"
          style={[
            {
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
