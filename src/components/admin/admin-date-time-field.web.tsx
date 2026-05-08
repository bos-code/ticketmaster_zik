import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  if (mode === 'time') {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsTimePickerOpen(true)}
          style={[styles.inputButton, error && styles.inputError]}
        >
          <Text style={[styles.inputText, !value && styles.placeholderText]}>
            {value || placeholder || 'Select time'}
          </Text>
          <Text style={styles.inputIcon}>⌄</Text>
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Modal
          animationType="fade"
          onRequestClose={() => setIsTimePickerOpen(false)}
          transparent
          visible={isTimePickerOpen}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              onPress={() => setIsTimePickerOpen(false)}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <Pressable onPress={() => setIsTimePickerOpen(false)}>
                  <Text style={styles.modalClose}>Done</Text>
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.timeGrid}>
                {timeOptions.map((option) => {
                  const active = option === value;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        onChangeValue(option);
                        setIsTimePickerOpen(false);
                      }}
                      style={[styles.timeOption, active && styles.timeOptionActive]}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          active && styles.timeOptionTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        // @ts-ignore - 'type' is supported on React Native Web
        type="date"
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

function buildTimeOptions() {
  return Array.from({ length: 48 }, (_, index) => {
    const hour24 = Math.floor(index / 2);
    const minute = index % 2 === 0 ? '00' : '30';
    const displayHour = hour24 % 12 || 12;
    const meridiem = hour24 >= 12 ? 'PM' : 'AM';

    return `${displayHour}:${minute} ${meridiem}`;
  });
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
  inputButton: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 13,
  },
  inputText: {
    color: '#111827',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderText: { color: 'rgba(17, 24, 39, 0.32)' },
  inputIcon: { color: '#6B7280', fontSize: 18, fontWeight: '800' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, fontWeight: '600', lineHeight: 15 },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    maxHeight: 420,
    maxWidth: 360,
    overflow: 'hidden',
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  modalTitle: { color: '#111827', fontSize: 15, fontWeight: '800' },
  modalClose: { color: '#005BD3', fontSize: 14, fontWeight: '800' },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 14,
  },
  timeOption: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
    minWidth: 72,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  timeOptionActive: {
    backgroundColor: '#005BD3',
    borderColor: '#005BD3',
  },
  timeOptionText: { color: '#374151', fontSize: 12, fontWeight: '700' },
  timeOptionTextActive: { color: '#FFFFFF' },
});
