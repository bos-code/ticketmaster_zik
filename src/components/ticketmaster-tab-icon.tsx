import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { generatedTabIcons } from '@/constants/generated-tab-icons';

export type TicketmasterTabIconName = 'discover' | 'for-you' | 'my-tickets' | 'sell' | 'my-account';

export function TicketmasterTabIcon({ focused = false, name, size = 25 }: { focused?: boolean; name: TicketmasterTabIconName; size?: number }) {
  if (name === 'sell') return <Ionicons name="sync-outline" size={size} color={focused ? '#0452E8' : 'white'} />;
  const states = generatedTabIcons[name];
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, overflow: 'hidden' }}>
    {(['inactive', 'active'] as const).map((state) => {
      const icon = states[state];
      // Balance the visible artwork rather than each generated canvas's padding.
      const ratio = name === 'for-you' ? 0.6 : name === 'my-tickets' ? 0.94 : 1;
      const inkHeight = size * 0.94;
      const inkWidth = inkHeight * ratio;
      const scaleX = inkWidth / icon.bounds.width;
      const scaleY = inkHeight / icon.bounds.height;
      return <Image key={state} source={icon.source} accessible={false} contentFit="fill" transition={0} cachePolicy="memory-disk"
        style={{ position: 'absolute', opacity: (focused ? state === 'active' : state === 'inactive') ? 1 : 0,
          width: icon.width * scaleX, height: icon.height * scaleY,
          left: (size - inkWidth) / 2 - icon.bounds.x * scaleX,
          top: (size - inkHeight) / 2 - icon.bounds.y * scaleY }} />;
    })}
  </View>;
}


export function TicketStackIcon({ size = 38, color = 'white', filled = false }: { size?: number; color?: string; filled?: boolean }) {
  return <Svg width={size} height={size} viewBox="0 0 30 30"><G transform="rotate(12 18 16)"><Path d="M12 6H26V24L22 28H12Z" fill={filled ? '#0452E8' : 'none'} stroke={color} strokeWidth={1.35} /></G><G transform="rotate(-12 12 14)"><Rect x={5} y={3} width={17} height={23} fill={filled ? '#0452E8' : 'none'} stroke={color} strokeWidth={1.6} /><Rect x={8} y={8} width={11} height={7} fill="none" stroke={color} strokeWidth={1.4} /><Path d="M11 11.5H16M8 19H19M8 22H15" stroke={color} strokeWidth={1.2} /></G></Svg>;
}
