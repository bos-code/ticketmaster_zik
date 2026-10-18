import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

type CustomSpinnerProps = {
  size?: number;
  color?: string;
  style?: ViewStyle;
};

// iOS-style activity indicator: eight rounded spokes that fade behind the
// leading spoke and advance one spoke at a time, clockwise.
const SPOKE_OPACITIES = [1, 0.85, 0.7, 0.56, 0.44, 0.34, 0.26, 0.2];
const SPOKE_COUNT = SPOKE_OPACITIES.length;
const STEP_INPUT = Array.from({ length: SPOKE_COUNT * 2 }, (_, index) =>
  Math.floor(index / 2) + (index % 2) * 0.999,
);
const STEP_OUTPUT = STEP_INPUT.map((value) => `${Math.floor(value) * (360 / SPOKE_COUNT)}deg`);

export function CustomSpinner({ size = 36, color = '#3355D8', style }: CustomSpinnerProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: SPOKE_COUNT,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const rotate = progress.interpolate({
    inputRange: [...STEP_INPUT, SPOKE_COUNT],
    outputRange: [...STEP_OUTPUT, '360deg'],
  });

  return (
    <Animated.View
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      style={[{ width: size, height: size, transform: [{ rotate }] }, style]}
    >
      <Svg viewBox="0 0 48 48" width={size} height={size}>
        {SPOKE_OPACITIES.map((opacity, index) => (
          <Rect
            fill={color}
            height={15}
            key={index}
            opacity={opacity}
            rx={2.5}
            transform={`rotate(${-index * (360 / SPOKE_COUNT)} 24 24)`}
            width={5}
            x={21.5}
            y={0}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
