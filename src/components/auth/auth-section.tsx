import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ticketColors, ticketSpacing } from '@/constants/ticket-theme';

type AuthSectionProps = {
  children: ReactNode;
  title?: string;
};

export function AuthSection({ children, title }: AuthSectionProps) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: ticketSpacing.sm,
  },
  title: {
    color: ticketColors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  content: {
    gap: ticketSpacing.sm,
  },
});
