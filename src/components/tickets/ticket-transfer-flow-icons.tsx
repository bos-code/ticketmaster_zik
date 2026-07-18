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
        d="M20.5 14H7.5M13 8.5 7.5 14l5.5 5.5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

export function TicketStackIcon({ color = "#F2F4F7", size = 20 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
        <Path d="m8.1 3.8 10.7 2.9-.9 3.2a2.15 2.15 0 0 0-1.1 4.1l-.8 3.1-10.7-2.9.8-3.1A2.15 2.15 0 0 0 7.2 7l.9-3.2Z" />
        <Path d="m5.2 6.6 1.7.5m9.4 2.5-.8 3a2.15 2.15 0 0 0-1.1 4.1l-.8 3.1-10.7-2.9" opacity={0.82} />
        <Line x1="11.6" x2="11.1" y1="7.9" y2="9.8" />
        <Line x1="10.5" x2="10" y1="12.1" y2="14" />
      </G>
    </Svg>
  );
}

export function TicketScanIcon({ color = "#FFFFFF", size = 20 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeWidth={1.8}>
        <Path d="M7 3.5H3.5V7M17 3.5h3.5V7M7 20.5H3.5V17M17 20.5h3.5V17" strokeLinejoin="round" />
        <Line x1="6.8" x2="6.8" y1="8" y2="16" />
        <Line x1="9.1" x2="9.1" y1="8" y2="16" strokeWidth={1.2} />
        <Line x1="11.4" x2="11.4" y1="8" y2="16" strokeWidth={2.2} />
        <Line x1="14.2" x2="14.2" y1="8" y2="16" strokeWidth={1.2} />
        <Line x1="17.1" x2="17.1" y1="8" y2="16" />
      </G>
    </Svg>
  );
}

export function TicketTransferIcon({ color = "#2B72D7", size = 26 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9}>
        <Path d="M6.5 17.5 17.5 6.5" />
        <Path d="M10.5 6.5h7v7" />
      </G>
    </Svg>
  );
}

export function TicketResaleIcon({ color = "#6D6D6D", size = 24 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9}>
        <Path d="M19 9a7.5 7.5 0 0 0-12.8-2.7L4.5 8" />
        <Path d="M4.5 4.5V8h3.5" />
        <Path d="M5 15a7.5 7.5 0 0 0 12.8 2.7l1.7-1.7" />
        <Path d="M19.5 19.5V16H16" />
      </G>
    </Svg>
  );
}

export function TicketMenuIcon({ color = "#171717", size = 22 }: IconProps) {
  return (
    <Svg height={size} viewBox="0 0 22 22" width={size}>
      <Circle cx="11" cy="6" fill={color} r="1.35" />
      <Circle cx="11" cy="11" fill={color} r="1.35" />
      <Circle cx="11" cy="16" fill={color} r="1.35" />
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
