import React from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';

type AuthTextInputProps = TextInputProps & {
  label: string;
};

export function AuthTextInput({ label, style, ...props }: AuthTextInputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={ticketColors.textSubtle}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: ticketSpacing.xs,
  },
  label: {
    color: ticketColors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 18,
  },
  input: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: '600',
    minHeight: 54,
    paddingHorizontal: ticketSpacing.md,
  },
});
