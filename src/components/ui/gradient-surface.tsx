import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

type GradientPoint = {
  x: number;
  y: number;
};

type GradientSurfaceProps = {
  children?: React.ReactNode;
  colors: readonly string[];
  end?: GradientPoint;
  start?: GradientPoint;
  style?: StyleProp<ViewStyle>;
};

export function GradientSurface({
  children,
  colors,
  end = { x: 1, y: 0.5 },
  start = { x: 0, y: 0.5 },
  style,
}: GradientSurfaceProps) {
  return (
    <LinearGradient colors={[...colors]} end={end} start={start} style={style}>
      {children}
    </LinearGradient>
  );
}
