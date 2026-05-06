import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
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
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [draftValue, setDraftValue] = useState<Date>(() => resolvePickerValue(value, mode));

  function openPicker() {
    const nextValue = resolvePickerValue(value, mode);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: nextValue,
        mode,
        is24Hour: false,
        display: mode === 'time' ? 'clock' : 'calendar',
        onChange: (_, selectedDate) => {
          if (!selectedDate) {
            return;
          }

          onChangeValue(formatPickerValue(selectedDate, mode));
        },
      });
      return;
    }

    setDraftValue(nextValue);
    setIsPickerVisible(true);
  }

  function closePicker() {
    setIsPickerVisible(false);
  }

  function confirmPicker() {
    onChangeValue(formatPickerValue(draftValue, mode));
    closePicker();
  }

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={openPicker}
          style={[styles.inputButton, error && styles.inputError]}
        >
          <Text style={[styles.inputText, !value && styles.placeholderText]}>
            {value || placeholder || (mode === 'date' ? 'Select date' : 'Select time')}
          </Text>
          <Ionicons
            color="rgba(255,255,255,0.48)"
            name={mode === 'date' ? 'calendar-outline' : 'time-outline'}
            size={18}
          />
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {Platform.OS === 'ios' ? (
        <Modal
          animationType="slide"
          onRequestClose={closePicker}
          presentationStyle="overFullScreen"
          transparent
          visible={isPickerVisible}
        >
          <View style={styles.modalBackdrop}>
            <Pressable onPress={closePicker} style={styles.modalDismissArea} />
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Pressable onPress={closePicker} style={styles.modalAction}>
                  <Text style={styles.modalActionText}>Cancel</Text>
                </Pressable>
                <Text style={styles.modalTitle}>{label}</Text>
                <Pressable onPress={confirmPicker} style={styles.modalAction}>
                  <Text style={styles.modalActionText}>Done</Text>
                </Pressable>
              </View>

              <DateTimePicker
                display={mode === 'date' ? 'inline' : 'spinner'}
                mode={mode}
                onChange={(_, selectedDate) => {
                  if (!selectedDate) {
                    return;
                  }

                  setDraftValue(selectedDate);
                }}
                textColor="#FFFFFF"
                themeVariant="dark"
                value={draftValue}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

function resolvePickerValue(value: string, mode: 'date' | 'time') {
  return mode === 'date' ? parseDateValue(value) ?? new Date() : parseTimeValue(value) ?? new Date();
}

function parseDateValue(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, yearString, monthString, dayString] = match;
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function parseTimeValue(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    return null;
  }

  const [, hourString, minuteString, meridiem] = match;
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  const parsedDate = new Date();
  const normalizedHour = meridiem.toUpperCase() === 'PM' ? (hour % 12) + 12 : hour % 12;
  parsedDate.setHours(normalizedHour, minute, 0, 0);
  return parsedDate;
}

function formatPickerValue(value: Date, mode: 'date' | 'time') {
  if (mode === 'date') {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-');
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

const styles = StyleSheet.create({
  field: { flex: 1, gap: 7 },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  inputButton: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 13,
  },
  inputText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingRight: 12,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.32)',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, fontWeight: '700', lineHeight: 15 },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.58)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#101010',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 18,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.08)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 14,
  },
  modalAction: {
    minWidth: 64,
    paddingVertical: 10,
  },
  modalActionText: {
    color: '#2D8CFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
