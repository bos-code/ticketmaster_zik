import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

type CustomSpinnerProps = {
  size?: number;
  color?: string;
  style?: ViewStyle;
};

const SPOKE_OPACITIES = [
  1,
  0.92,
  0.84,
  0.76,
  0.68,
  0.58,
  0.48,
  0.38,
  0.3,
  0.22,
  0.15,
  0.09,
];

export function CustomSpinner({ size = 44, color = '#111111', style }: CustomSpinnerProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[{ width: size, height: size, transform: [{ rotate: spin }] }, style]}>
      <Svg viewBox="0 0 48 48" width={size} height={size}>
        {SPOKE_OPACITIES.map((opacity, index) => (
          <Rect
            fill={color}
            height={11}
            key={index}
            opacity={opacity}
            rx={2}
            transform={`rotate(${index * 30} 24 24)`}
            width={4}
            x={22}
            y={4}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
