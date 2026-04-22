import React, { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

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
  const gradientId = useId().replace(/:/g, '');

  return (
    <View style={style}>
      <Svg pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <SvgLinearGradient
            id={gradientId}
            x1={formatCoordinate(start.x)}
            x2={formatCoordinate(end.x)}
            y1={formatCoordinate(start.y)}
            y2={formatCoordinate(end.y)}>
            {colors.map((color, index) => (
              <Stop
                key={`${gradientId}-${color}-${index}`}
                offset={formatStopOffset(index, colors.length)}
                stopColor={color}
              />
            ))}
          </SvgLinearGradient>
        </Defs>

        <Rect fill={`url(#${gradientId})`} height="100%" width="100%" x="0" y="0" />
      </Svg>

      {children}
    </View>
  );
}

function formatCoordinate(value: number) {
  return `${Math.max(0, Math.min(1, value)) * 100}%`;
}

function formatStopOffset(index: number, total: number) {
  if (total <= 1) {
    return '0%';
  }

  return `${(index / (total - 1)) * 100}%`;
}
