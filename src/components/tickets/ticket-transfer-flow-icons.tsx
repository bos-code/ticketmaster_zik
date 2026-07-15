import React from "react";
import Svg, { Circle, G, Line, Path, Rect } from "react-native-svg";

type IconProps = {
  color?: string;
  size?: number;
};

export function TicketFlowBackIcon({ color = "#FFFFFF", size = 28 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 28 28" width={size}>
      <Path
        d="M22 14H6M12.5 7.5 6 14l6.5 6.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.25}
      />
    </Svg>
  );
}

export function TicketStackIcon({ color = "#F2F4F7", size = 20 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.55}>
        <Path d="m8.2 4.1 10.3 2.8-.8 3a2 2 0 0 0-1 3.8l-.8 3-10.3-2.8.8-3a2 2 0 0 0 1-3.8l.8-3Z" />
        <Path d="m5.4 6.8 10.8 2.9-.8 3a2 2 0 0 0-1 3.8l-.8 3-10.8-2.9" opacity={0.75} />
        <Line x1="11.3" x2="10.8" y1="8.2" y2="10" />
        <Line x1="10.2" x2="9.7" y1="12.4" y2="14.2" />
      </G>
    </Svg>
  );
}

export function TicketScanIcon({ color = "#FFFFFF", size = 20 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeWidth={1.55}>
        <Path d="M7 3.5H3.5V7M17 3.5h3.5V7M7 20.5H3.5V17M17 20.5h3.5V17" strokeLinejoin="round" />
        <Line x1="7" x2="7" y1="8" y2="16" />
        <Line x1="9.5" x2="9.5" y1="8" y2="16" />
        <Line x1="12" x2="12" y1="8" y2="16" strokeWidth={2.1} />
        <Line x1="15" x2="15" y1="8" y2="16" />
        <Line x1="17.5" x2="17.5" y1="8" y2="16" />
      </G>
    </Svg>
  );
}

export function TicketTransferIcon({ color = "#2B72D7", size = 24 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M7 17 17 7M10 7h7v7"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

export function TicketResaleIcon({ color = "#6D6D6D", size = 24 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
        <Path d="M19.2 8.8A7.4 7.4 0 0 0 6.3 6.4L4.5 8.2" />
        <Path d="M4.6 4.7v3.6h3.6" />
        <Path d="M4.8 15.2a7.4 7.4 0 0 0 12.9 2.4l1.8-1.8" />
        <Path d="M19.4 19.3v-3.6h-3.6" />
      </G>
    </Svg>
  );
}

export function TicketMenuIcon({ color = "#171717", size = 22 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 22 22" width={size}>
      <Circle cx="11" cy="5" fill={color} r="1.65" />
      <Circle cx="11" cy="11" fill={color} r="1.65" />
      <Circle cx="11" cy="17" fill={color} r="1.65" />
    </Svg>
  );
}

export function CompactTicketIcon({ color = "#FFFFFF", size = 26 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 26 26" width={size}>
      <Rect fill="none" height="14" rx="1.5" stroke={color} strokeWidth={1.6} width="20" x="3" y="6" />
      <Line stroke={color} strokeDasharray="2 1.5" strokeWidth={1.4} x1="16.5" x2="16.5" y1="7" y2="19" />
      <Line stroke={color} strokeWidth={1.4} x1="7" x2="7" y1="10" y2="16" />
      <Line stroke={color} strokeWidth={1.4} x1="9.5" x2="9.5" y1="10" y2="16" />
      <Line stroke={color} strokeWidth={1.8} x1="12.3" x2="12.3" y1="10" y2="16" />
    </Svg>
  );
}
