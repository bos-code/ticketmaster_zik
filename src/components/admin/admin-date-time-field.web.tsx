import { Text } from '@/components/ui/app-text';
import { LAYER_MODAL } from '@/constants/layers';
import { useOverlaySlot } from '@/lib/overlay-manager';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
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

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);

export function AdminDateTimeField({
  error,
  label,
  mode,
  onChangeValue,
  placeholder,
  value,
}: AdminDateTimeFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isShown = useOverlaySlot('modal', isOpen);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityLabel={`${label}: ${value || 'not set'}`}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={[styles.inputButton, error && styles.inputError]}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value || placeholder || (mode === 'date' ? 'Select date' : 'Select time')}
        </Text>
        <Text style={styles.inputIcon}>{mode === 'date' ? '▦' : '◷'}</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isShown}>
        <View style={[styles.modalBackdrop, { zIndex: LAYER_MODAL }]}>
          <Pressable onPress={() => setIsOpen(false)} style={StyleSheet.absoluteFill} />
          {mode === 'date' ? (
            <CalendarCard
              label={label}
              onClose={() => setIsOpen(false)}
              onSelect={(next) => {
                onChangeValue(next);
                setIsOpen(false);
              }}
              value={value}
            />
          ) : (
            <TimeCard
              label={label}
              onClose={() => setIsOpen(false)}
              onSelect={(next) => {
                onChangeValue(next);
                setIsOpen(false);
              }}
              value={value}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

function CalendarCard({ label, onClose, onSelect, value }: { label: string; onClose: () => void; onSelect: (value: string) => void; value: string }) {
  const selected = parseDate(value);
  const today = new Date();
  const [view, setView] = useState(() => ({
    month: (selected ?? today).getMonth(),
    year: (selected ?? today).getFullYear(),
  }));

  useEffect(() => {
    if (selected) {
      setView({ month: selected.getMonth(), year: selected.getFullYear() });
    }
  }, [value]);

  const cells = useMemo(() => buildMonthCells(view.year, view.month), [view]);

  function shiftMonth(delta: number) {
    setView((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { month: next.getMonth(), year: next.getFullYear() };
    });
  }

  return (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{label}</Text>
        <Pressable accessibilityRole="button" onPress={onClose}>
          <Text style={styles.modalClose}>Close</Text>
        </Pressable>
      </View>
      <View style={styles.monthRow}>
        <Pressable accessibilityLabel="Previous year" onPress={() => shiftMonth(-12)} style={styles.navButton}>
          <Text style={styles.navText}>«</Text>
        </Pressable>
        <Pressable accessibilityLabel="Previous month" onPress={() => shiftMonth(-1)} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{MONTHS[view.month]} {view.year}</Text>
        <Pressable accessibilityLabel="Next month" onPress={() => shiftMonth(1)} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
        <Pressable accessibilityLabel="Next year" onPress={() => shiftMonth(12)} style={styles.navButton}>
          <Text style={styles.navText}>»</Text>
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>
        ))}
      </View>
      <View style={styles.dayGrid}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <View key={`blank-${index}`} style={styles.dayCell} />;
          }
          const iso = formatDate(cell);
          const isSelected = value === iso;
          const isToday = iso === formatDate(today);

          return (
            <Pressable
              accessibilityLabel={iso}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={iso}
              onPress={() => onSelect(iso)}
              style={[styles.dayCell, styles.dayButton, isToday && styles.dayToday, isSelected && styles.daySelected]}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{cell.getDate()}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.footerRow}>
        <Pressable accessibilityRole="button" onPress={() => onSelect(formatDate(today))}>
          <Text style={styles.modalClose}>Today</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TimeCard({ label, onClose, onSelect, value }: { label: string; onClose: () => void; onSelect: (value: string) => void; value: string }) {
  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>(parsed.meridiem);

  return (
    <View style={styles.modalCard}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{label}</Text>
        <Pressable accessibilityRole="button" onPress={onClose}>
          <Text style={styles.modalClose}>Close</Text>
        </Pressable>
      </View>
      <Text style={styles.timePreview}>{formatTime(hour, minute, meridiem)}</Text>
      <View style={styles.timeColumns}>
        <ScrollView contentContainerStyle={styles.columnContent} style={styles.column}>
          {HOURS.map((option) => (
            <Pressable key={option} onPress={() => setHour(option)} style={[styles.timeOption, option === hour && styles.timeOptionActive]}>
              <Text style={[styles.timeOptionText, option === hour && styles.timeOptionTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView contentContainerStyle={styles.columnContent} style={styles.column}>
          {MINUTES.map((option) => (
            <Pressable key={option} onPress={() => setMinute(option)} style={[styles.timeOption, option === minute && styles.timeOptionActive]}>
              <Text style={[styles.timeOptionText, option === minute && styles.timeOptionTextActive]}>{String(option).padStart(2, '0')}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.columnContent}>
          {(['AM', 'PM'] as const).map((option) => (
            <Pressable key={option} onPress={() => setMeridiem(option)} style={[styles.timeOption, option === meridiem && styles.timeOptionActive]}>
              <Text style={[styles.timeOptionText, option === meridiem && styles.timeOptionTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => onSelect(formatTime(hour, minute, meridiem))} style={styles.confirmButton}>
        <Text style={styles.confirmText}>Set time</Text>
      </Pressable>
    </View>
  );
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildMonthCells(year: number, month: number) {
  const leading = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: days }, (_, index) => new Date(year, month, index + 1)),
  ];
}

function parseTime(value: string): { hour: number; minute: number; meridiem: 'AM' | 'PM' } {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value.trim());
  if (!match) return { hour: 8, minute: 0, meridiem: 'PM' };
  const hour = Number(match[1]);
  const minute = Math.round(Number(match[2]) / 5) * 5 % 60;
  return { hour: hour >= 1 && hour <= 12 ? hour : 8, minute, meridiem: match[3].toUpperCase() === 'AM' ? 'AM' : 'PM' };
}

function formatTime(hour: number, minute: number, meridiem: 'AM' | 'PM') {
  return `${hour}:${String(minute).padStart(2, '0')} ${meridiem}`;
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
  monthRow: { alignItems: 'center', flexDirection: 'row', gap: 4, paddingHorizontal: 10, paddingTop: 10 },
  navButton: { alignItems: 'center', height: 34, justifyContent: 'center', width: 34 },
  navText: { color: '#005BD3', fontSize: 20, fontWeight: '800' },
  monthLabel: { color: '#111827', flex: 1, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  weekRow: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 6 },
  weekday: { color: '#9CA3AF', flex: 1, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingVertical: 4 },
  dayCell: { alignItems: 'center', height: 40, justifyContent: 'center', width: `${100 / 7}%` },
  dayButton: { borderRadius: 20 },
  dayToday: { borderColor: '#005BD3', borderWidth: 1 },
  daySelected: { backgroundColor: '#005BD3' },
  dayText: { color: '#111827', fontSize: 13, fontWeight: '600' },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  footerRow: { alignItems: 'flex-end', borderTopColor: '#E5E7EB', borderTopWidth: 1, padding: 12 },
  timePreview: { color: '#111827', fontSize: 24, fontWeight: '800', paddingTop: 12, textAlign: 'center' },
  timeColumns: { flexDirection: 'row', gap: 8, height: 220, padding: 12 },
  column: { flex: 1 },
  columnContent: { flex: 1, gap: 6 },
  confirmButton: { alignItems: 'center', backgroundColor: '#005BD3', borderRadius: 8, justifyContent: 'center', margin: 12, marginTop: 0, minHeight: 44 },
  confirmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
