import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { normalizeOtp, OTP_LENGTH } from '@/lib/auth/otp';

type OtpCodeInputProps = {
  disabled?: boolean;
  onChangeCode: (code: string) => void;
  value: string;
};

export function OtpCodeInput({ disabled = false, onChangeCode, value }: OtpCodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');

  return (
    <Pressable
      accessibilityLabel="One-time code"
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => inputRef.current?.focus()}
      style={styles.wrap}>
      <View style={styles.digits}>
        {digits.map((digit, index) => (
          <View
            key={`${index}-${digit}`}
            style={[styles.box, digit ? styles.boxFilled : null]}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        ))}
      </View>
      <TextInput
        caretHidden
        editable={!disabled}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        onChangeText={(text) => onChangeCode(normalizeOtp(text))}
        ref={inputRef}
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
        value={value}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 68,
  },
  digits: {
    flexDirection: 'row',
    gap: ticketSpacing.xs,
    justifyContent: 'space-between',
  },
  box: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: ticketColors.primary,
  },
  digit: {
    color: ticketColors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  hiddenInput: {
    height: 1,
    opacity: 0,
    position: 'absolute',
    width: 1,
  },
});
