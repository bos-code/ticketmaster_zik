import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { TicketmasterWordmark } from "@/components/ticketmaster-wordmark";
import { SPLASH_STATUS_BAR_COLOR } from "@/components/status-bar-chrome";

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
      onFinish?.();
    }, 3200); // Slightly longer to accommodate both animations

    return () => {
      clearTimeout(timeout);
    };
  }, [onFinish, tOpacity, tScale, wordmarkOpacity, wordmarkTranslateX]);

  return (
    <View pointerEvents="none" className="absolute inset-0 z-[1000]">
      {Platform.OS !== 'web' ? (
        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: STARTUP_STATUS_BAR_COLOR, marginBottom: -50 }}
        >
          <View style={{ height: 50 }} />
        </SafeAreaView>
      ) : (
        <View style={{ backgroundColor: STARTUP_STATUS_BAR_COLOR, height: 100, position: 'absolute', top: 0, left: 0, right: 0 }} />
      )}

      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: STARTUP_BACKGROUND_COLOR }}
      >
        {/* Standalone 't' Icon */}
        <Animated.View
          style={{
            opacity: tOpacity,
            transform: [{ scale: tScale }],
            position: 'absolute',
          }}
        >
          <Svg viewBox="0 0 8.85 19" width={80} height={172} fill="white">
            <Path d="M4.19 15.35c0-.47.07-.9.14-1.18l1.16-5.3h2.86l.5-2.32H5.99l.79-3.61-3.43 1.1-.54 2.5H.5L0 8.87h2.3l-.9 4.11c-.21.97-.4 1.89-.4 2.83C1 18.14 2.52 19 4.69 19c.54 0 1.16-.18 1.7-.3l.56-2.45a4.27 4.27 0 0 1-1.55.28c-.71 0-1.22-.44-1.22-1.18z" />
          </Svg>
        </Animated.View>

        {/* Full Wordmark */}
        <Animated.View
          className="absolute items-center justify-center"
          style={[
            {
              opacity: wordmarkOpacity,
              transform: [{ translateX: wordmarkTranslateX }],
            },
          ]}
        >
          <TicketmasterWordmark fill="#FFFFFF" size={270} />
        </Animated.View>
      </View>
    </View>
  );
}
