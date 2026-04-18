import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { ticketColors, ticketRadii } from '@/constants/ticket-theme';

type PremiumStartupScreenProps = {
  onFinish?: () => void;
};

export function PremiumStartupScreen({ onFinish }: PremiumStartupScreenProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const markScale = useRef(new Animated.Value(0.92)).current;
  const markLift = useRef(new Animated.Value(8)).current;
  const glowScale = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(markScale, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(markLift, {
        toValue: 0,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 820,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 420,
          delay: 260,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        onFinish?.();
      }
    });
  }, [glowScale, markLift, markScale, onFinish, opacity]);

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <View style={styles.upperShade} />
      <View style={styles.lowerShade} />

      <Animated.View
        style={[
          styles.glow,
          {
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.markWrap,
          {
            transform: [{ translateY: markLift }, { scale: markScale }],
          },
        ]}>
        <Text style={styles.markShadow}>T</Text>
        <Text style={styles.mark}>T</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ticketColors.background,
  },
  upperShade: {
    position: 'absolute',
    top: -130,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: ticketColors.primary,
    opacity: 0.1,
  },
  lowerShade: {
    position: 'absolute',
    bottom: -180,
    width: 460,
    height: 460,
    borderRadius: 230,
    backgroundColor: ticketColors.primaryBright,
    opacity: 0.06,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: ticketColors.glow,
    opacity: 0.7,
  },
  markWrap: {
    width: 132,
    height: 132,
    borderRadius: ticketRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderWidth: 1,
    borderColor: ticketColors.borderStrong,
  },
  markShadow: {
    position: 'absolute',
    color: ticketColors.primaryBright,
    fontSize: 88,
    lineHeight: 104,
    fontWeight: '900',
    opacity: 0.42,
    transform: [{ translateX: 8 }, { translateY: 6 }],
  },
  mark: {
    color: ticketColors.text,
    fontSize: 88,
    lineHeight: 104,
    fontWeight: '900',
    transform: [{ translateX: -4 }, { translateY: -3 }],
  },
});
