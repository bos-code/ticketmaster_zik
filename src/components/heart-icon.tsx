import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

type HeartIconProps = {
  color: string;
  size: number;
  strokeWidth?: number;
  style?: SvgProps['style'];
};

export function HeartIcon({ color, size, strokeWidth = 2, style }: HeartIconProps) {
  return (
    <Svg
      fill="none"
      height={size}
      style={style}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path
        d="M12 21L4 13.5L3 9L6 5L10 6L12 8L14 6L18 5L21 9L20 13.5L12 21Z"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
