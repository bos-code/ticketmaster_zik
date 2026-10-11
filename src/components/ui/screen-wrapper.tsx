import React from 'react';
import { View, ViewProps } from 'react-native';
import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export function ScreenWrapper({ children, backgroundColor = '#FFFFFF', style, ...props }: ScreenWrapperProps) {
  const insets = useImmersiveSafeAreaInsets();
  
  return (
    <View 
      style={[
        { 
          flex: 1, 
          backgroundColor, 
          paddingTop: Math.max(insets.top, 12),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}
