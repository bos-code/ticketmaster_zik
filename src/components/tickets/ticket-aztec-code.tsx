import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text } from '@/components/ui/app-text';
import { buildTicketAztecSvg } from '@/lib/ticket-code';

export const TicketAztecCode = memo(function TicketAztecCode({ value, size, isReference = false }: { value?: string; size: number; isReference?: boolean }) {
  const xml = useMemo(() => buildTicketAztecSvg(value), [value]);
  return <View accessible accessibilityLabel={xml ? (isReference ? 'Ticket reference code' : 'Ticket code') : 'Ticket code unavailable'} style={[styles.frame, { width: size, height: size }]}>
    {xml ? <SvgXml xml={xml} width="100%" height="100%" /> : <Text style={styles.unavailable}>Code unavailable</Text>}
  </View>;
});

const styles = StyleSheet.create({
  frame: { backgroundColor: '#FFFFFF', padding: 8, alignItems: 'center', justifyContent: 'center' },
  unavailable: { color: '#56515B', fontSize: 14, textAlign: 'center' },
});
