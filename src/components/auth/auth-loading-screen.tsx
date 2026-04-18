import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ticketColors } from '@/constants/ticket-theme';

export function AuthLoadingScreen() {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={ticketColors.primary} size="large" />
      <Text style={styles.text}>Securing your session...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: ticketColors.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  text: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
