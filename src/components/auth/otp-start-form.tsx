import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthErrorMessage } from '@/components/auth/auth-error-message';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import type { OtpMethod } from '@/lib/auth/otp';

type OtpStartFormProps = {
  buttonLabel: string;
  disabled?: boolean;
  error?: string | null;
  identifier: string;
  loading?: boolean;
  method: OtpMethod;
  onChangeIdentifier: (value: string) => void;
  onChangeMethod: (method: OtpMethod) => void;
  onSubmit: () => void;
};

const methodOptions: { label: string; value: OtpMethod }[] = [
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
];

export function OtpStartForm({
  buttonLabel,
  disabled = false,
  error,
  identifier,
  loading = false,
  method,
  onChangeIdentifier,
  onChangeMethod,
  onSubmit,
}: OtpStartFormProps) {
  const isEmail = method === 'email';

  return (
    <View style={styles.form}>
      <View style={styles.switcher}>
        {methodOptions.map((option) => {
          const active = option.value === method;

          return (
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              key={option.value}
              onPress={() => onChangeMethod(option.value)}
              style={[styles.switchButton, active && styles.switchButtonActive]}>
              <Text style={[styles.switchLabel, active && styles.switchLabelActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AuthTextInput
        autoComplete={isEmail ? 'email' : 'tel'}
        inputMode={isEmail ? 'email' : 'tel'}
        keyboardType={isEmail ? 'email-address' : 'phone-pad'}
        label={isEmail ? 'Email address' : 'Phone number'}
        onChangeText={onChangeIdentifier}
        onSubmitEditing={onSubmit}
        placeholder={isEmail ? 'you@example.com' : '+15551234567'}
        returnKeyType="send"
        textContentType={isEmail ? 'emailAddress' : 'telephoneNumber'}
        value={identifier}
      />
      <AuthErrorMessage message={error} />
      <AuthButton
        disabled={disabled}
        label={buttonLabel}
        loading={loading}
        onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  switcher: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: ticketSpacing.xs,
    padding: 4,
  },
  switchButton: {
    alignItems: 'center',
    borderRadius: ticketRadii.sm,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  switchButtonActive: {
    backgroundColor: ticketColors.primary,
  },
  switchLabel: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  switchLabelActive: {
    color: '#FFFFFF',
  },
});
