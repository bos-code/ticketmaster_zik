import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';

export function VenueMapPlaceholder({ dark, isLoading, onRetry, venueAddress }: {
  dark: boolean; isLoading: boolean; onRetry: () => void; venueAddress: string;
}) {
  const color = dark ? '#CCCCCC' : '#626262';
  return <View style={styles.root}>
    {isLoading ? <><ActivityIndicator color={color} /><Text style={{ color }}>Loading venue map…</Text></> : <>
      <Text style={{ color, fontSize: 16, lineHeight: 23 }}>{venueAddress}</Text>
      <Text style={{ color }}>Map unavailable. You can still get directions.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Retry venue map" onPress={onRetry} style={styles.retry}>
        <Text style={{ color: dark ? '#FFFFFF' : '#0452E8', fontWeight: '600' }}>Retry map</Text>
      </Pressable>
    </>}
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  retry: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center' },
});
