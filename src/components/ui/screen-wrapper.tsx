import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export function ScreenWrapper({ children, backgroundColor = '#FFFFFF', style, ...props }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      style={[
        { 
          flex: 1, 
          backgroundColor, 
          paddingTop: Math.max(insets.top, 12) 
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}
