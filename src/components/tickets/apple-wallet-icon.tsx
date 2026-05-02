import React from "react";
import Svg, { G, Path, type SvgProps } from "react-native-svg";

type AppleWalletIconProps = SvgProps & {
  size?: number;
};

export function AppleWalletIcon({
  height,
  size = 24,
  width,
  ...props
}: AppleWalletIconProps) {
  return (
    <Svg
      height={height ?? size}
      viewBox="0 0 120 120"
      width={width ?? size}
      {...props}
    >
      <Path d="M26 0H94a25.948 25.948 0 0 1 26 26V94a25.948 25.948 0 0 1-26 26H26A25.948 25.948 0 0 1 0 94V26A26.012 26.012 0 0 1 26 0Z" fill="#1E1E1F" />
      <Path
        d="M24 30H96a6.018 6.018 0 0 1 6 6V70a6.018 6.018 0 0 1-6 6H24a6.018 6.018 0 0 1-6-6V36a6.018 6.018 0 0 1 6-6Z"
        fill="#FFF"
        fillRule="evenodd"
      />
      <Path
        d="M22 26H98a8.024 8.024 0 0 1 8 8V86a8.024 8.024 0 0 1-8 8H22a8.024 8.024 0 0 1-8-8V34a8.024 8.024 0 0 1 8-8Z"
        fill="#D9D6CC"
        fillRule="evenodd"
      />
      <Path
        d="M24 30H96a6.018 6.018 0 0 1 6 6V70a6.018 6.018 0 0 1-6 6H24a6.018 6.018 0 0 1-6-6V36a6.018 6.018 0 0 1 6-6Z"
        fill="#3B99C9"
        fillRule="evenodd"
      />
      <G>
        <Path
          d="M24 37H96a6.018 6.018 0 0 1 6 6V55a6.018 6.018 0 0 1-6 6H24a6.018 6.018 0 0 1-6-6V43a6.018 6.018 0 0 1 6-6Z"
          fillRule="evenodd"
        />
        <Path
          d="M24 37H96a6.018 6.018 0 0 1 6 6V55a6.018 6.018 0 0 1-6 6H24a6.018 6.018 0 0 1-6-6V43a6.018 6.018 0 0 1 6-6Z"
          fill="#FFB003"
          fillRule="evenodd"
        />
      </G>
      <G>
        <Path
          d="M24 44H96a6.018 6.018 0 0 1 6 6V62a6.018 6.018 0 0 1-6 6H24a6.018 6.018 0 0 1-6-6V50a6.018 6.018 0 0 1 6-6Z"
          fillRule="evenodd"
        />
        <Path
          d="M24 44H96a6.018 6.018 0 0 1 6 6V62a6.018 6.018 0 0 1-6 6H24a6.018 6.018 0 0 1-6-6V50a6.018 6.018 0 0 1 6-6Z"
          fill="#50BE3D"
          fillRule="evenodd"
        />
      </G>
      <G>
        <Path
          d="M24 51H96a6.018 6.018 0 0 1 6 6V69a6.018 6.018 0 0 1-6 6H24a6.018 6.018 0 0 1-6-6V57a6.018 6.018 0 0 1 6-6Z"
          fillRule="evenodd"
        />
        <Path
          d="M24 51H96a6.018 6.018 0 0 1 6 6V69a6.018 6.018 0 0 1-6 6H24a6.018 6.018 0 0 1-6-6V57a6.018 6.018 0 0 1 6-6Z"
          fill="#F26D5F"
          fillRule="evenodd"
        />
      </G>
      <G>
        <Path
          d="M14 58h92V86a8.024 8.024 0 0 1-8 8H22a8.024 8.024 0 0 1-8-8V58Zm27 0c9 0 10 11.5 19 11.5S70 58 79 58Z"
          fillRule="evenodd"
        />
        <Path
          d="M14 58h92V86a8.024 8.024 0 0 1-8 8H22a8.024 8.024 0 0 1-8-8V58Zm27 0c9 0 10 11.5 19 11.5S70 58 79 58Z"
          fill="#D9D6CC"
          fillRule="evenodd"
        />
      </G>
    </Svg>
  );
}
