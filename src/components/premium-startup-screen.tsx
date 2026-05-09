import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  TicketmasterTMark,
  TicketmasterWordmark,
} from "@/components/ticketmaster-wordmark";
import { SPLASH_STATUS_BAR_COLOR } from "@/components/status-bar-chrome";

type PremiumStartupScreenProps = {
  onFinish?: () => void;
};

const STARTUP_STATUS_BAR_COLOR = SPLASH_STATUS_BAR_COLOR;
const STARTUP_BACKGROUND_COLOR = SPLASH_STATUS_BAR_COLOR;

export function PremiumStartupScreen({ onFinish }: PremiumStartupScreenProps) {
  const markOpacity = useRef(new Animated.Value(1)).current;
  const markScale = useRef(new Animated.Value(1)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslateX = useRef(new Animated.Value(44)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(850),
      Animated.parallel([
        Animated.timing(markOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(markScale, {
          toValue: 0.96,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkTranslateX, {
          toValue: 0,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timeout = setTimeout(() => {
      onFinish?.();
    }, 2800);

    return () => {
      clearTimeout(timeout);
    };
  }, [markOpacity, markScale, onFinish, wordmarkOpacity, wordmarkTranslateX]);

  return (
    <View pointerEvents="none" className="absolute inset-0 z-[1000]">
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: STARTUP_STATUS_BAR_COLOR }}
      >
        <View style={{ height: 0 }} />
      </SafeAreaView>

      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: STARTUP_BACKGROUND_COLOR }}
      >
        <Animated.View
          className="absolute items-center justify-center"
          style={[
            {
              opacity: markOpacity,
              transform: [{ scale: markScale }],
            },
          ]}
        >
          <TicketmasterTMark fill="#FFFFFF" size={128} />
        </Animated.View>
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
