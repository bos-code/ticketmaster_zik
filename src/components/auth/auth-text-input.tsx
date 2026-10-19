import { Text, TextInput } from '@/components/ui/app-text';
import React from 'react';
import { type TextInputProps, View } from 'react-native';

import { createAdminStyles, useAdminTheme } from '@/components/admin/admin-theme';
import { ticketRadii, ticketSpacing } from '@/constants/ticket-theme';

type AuthTextInputProps = TextInputProps & {
  label: string;
};

export function AuthTextInput({ label, style, ...props }: AuthTextInputProps) {
  const styles = useStyles();
  const { colors } = useAdminTheme();
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.textSubtle}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const useStyles = createAdminStyles((c) => ({
  wrap: {
    gap: ticketSpacing.xs,
  },
  label: {
    color: c.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 18,
  },
  input: {
    backgroundColor: c.surface,
    borderColor: c.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    color: c.text,
    fontSize: 16,
    fontWeight: '600',
    minHeight: 54,
    paddingHorizontal: ticketSpacing.md,
  },
}));
