import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

import {
  TicketmasterTMark,
  TicketmasterWordmark,
} from "@/components/ticketmaster-wordmark";

type PremiumStartupScreenProps = {
  onFinish?: () => void;
};

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
    <View
      className="absolute inset-0 z-[1000] items-center justify-center bg-[#007AFF] px-8"
      style={{ pointerEvents: 'none' }}
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
  );
}
