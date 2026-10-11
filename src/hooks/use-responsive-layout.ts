import { useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { getFanLayout } from '@/lib/fan-layout';

// Measure the available container, including when landscape safe areas reduce it.
export function useResponsiveLayout() {
  const { width: windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState<number | null>(null);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  return { ...getFanLayout(width ?? windowWidth), width: width ?? windowWidth, onLayout };
}
