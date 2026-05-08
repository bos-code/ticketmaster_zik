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
  const inputValue = mode === 'time' ? toWebTimeValue(value) : value;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        // @ts-ignore - 'type' is supported on React Native Web
        type={mode}
        onChangeText={(nextValue) => {
          onChangeValue(
            mode === 'time' ? fromWebTimeValue(nextValue) : nextValue,
          );
        }}
        placeholder={placeholder}
        placeholderTextColor="rgba(17, 24, 39, 0.32)"
        style={[styles.input, error && styles.inputError]}
        value={inputValue}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function toWebTimeValue(value: string) {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    return trimmedValue;
  }

  const [, hourString, minuteString, meridiem] = match;
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return trimmedValue;
  }

  const normalizedHour =
    meridiem.toUpperCase() === 'PM' ? (hour % 12) + 12 : hour % 12;

  return `${String(normalizedHour).padStart(2, '0')}:${minuteString}`;
}

function fromWebTimeValue(value: string) {
  const match = value.trim().match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return value;
  }

  const [, hourString, minuteString] = match;
  const hour = Number(hourString);
  const displayHour = hour % 12 || 12;
  const meridiem = hour >= 12 ? 'PM' : 'AM';

  return `${displayHour}:${minuteString} ${meridiem}`;
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
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, fontWeight: '600', lineHeight: 15 },
});
