import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type AdminDateTimeFieldProps = {
  error?: string;
  label: string;
  mode: 'date' | 'time';
  onChangeValue: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function AdminDateTimeField({
  error,
  label,
  mode,
  onChangeValue,
  placeholder,
  value,
}: AdminDateTimeFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        // @ts-ignore - 'type' is supported on React Native Web
        type={mode}
        onChangeText={onChangeValue}
        placeholder={placeholder}
        placeholderTextColor="rgba(17, 24, 39, 0.32)"
        style={[styles.input, error && styles.inputError]}
        value={value}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, gap: 6 },
  label: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    minHeight: 48,
    paddingHorizontal: 13,
    // Ensure the web picker looks clean
    outlineStyle: 'none',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, fontWeight: '600', lineHeight: 15 },
});
