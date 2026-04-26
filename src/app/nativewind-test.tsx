import { NativeWindTest } from '@/components/NativeWindTest';
import { ticketColors } from '@/constants/ticket-theme';
import React from 'react';
import { View } from 'react-native';

export default function NativeWindTestRoute() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: ticketColors.background }}>
      <NativeWindTest />
    </View>
  );
}
