import { Text, TextInput } from '@/components/ui/app-text';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { searchTicketmasterEvents } from '@/lib/ticketmaster-admin-api';
import { TICKET_TYPE_OPTIONS, useTicketStore, type TicketInput, type TicketType } from '@/store/ticketStore';
import type { TicketmasterEvent } from '@/types/ticketmaster';

type Placement = { section: string; row: string; seatFrom: string; seatTo: string; ticketType: TicketType };

const DEFAULT_PLACEMENT: Placement = { section: 'GA', row: '1', seatFrom: '1', seatTo: '2', ticketType: 'Standard' };

export function TicketmasterSearchScreen() {
  const router = useRouter();
  const addEvent = useTicketStore((state) => state.addEvent);
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TicketmasterEvent | null>(null);
  const [placement, setPlacement] = useState<Placement>(DEFAULT_PLACEMENT);
  const [saving, setSaving] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    const id = ++requestId.current;
    const controller = new AbortController();
    if (q.length < 2) {
      setEvents([]);
      setError(null);
      setLoading(false);
      return () => controller.abort();
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await searchTicketmasterEvents(q, controller.signal);
        if (id === requestId.current) setEvents(result);
      } catch (reason) {
        if (controller.signal.aborted || id !== requestId.current) return;
        setEvents([]);
        setError(reason instanceof Error ? reason.message : 'Lookup failed.');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 450);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function handleBack() {
    if (selected) {
      setSelected(null);
      setError(null);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/admin');
  }

  function handleSelect(event: TicketmasterEvent) {
    setPlacement(DEFAULT_PLACEMENT);
    setError(null);
    setSelected(event);
  }

  async function handleAdd() {
    if (!selected) return;
    const problem = validatePlacement(placement);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await addEvent(toTicketInput(selected, placement));
      router.replace({ pathname: '/admin', params: { toast: 'created' } });
    } catch (reason) {
      console.warn('Ticketmaster event save failed.', reason);
      setError('We could not save this event. Please try again.');
      setSaving(false);
    }
  }

  return (
    <ScreenWrapper backgroundColor="#F5F6F8">
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back" onPress={handleBack} style={styles.iconButton}>
          <Ionicons color="#374151" name="chevron-back" size={20} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>ADMIN</Text>
          <Text style={styles.title}>{selected ? 'Preview ticket' : 'Add from Ticketmaster'}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {selected ? (
          <Preview
            error={error}
            event={selected}
            onAdd={() => void handleAdd()}
            onChange={(next) => setPlacement((current) => ({ ...current, ...next }))}
            placement={placement}
            saving={saving}
          />
        ) : (
          <>
            <TextInput
              accessibilityLabel="Search Ticketmaster events"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search artist, event, or tour"
              placeholderTextColor="#7B7B7B"
              returnKeyType="search"
              style={styles.input}
              value={query}
            />
            <Text style={styles.help}>Tap an event to preview it before it is added to your tickets.</Text>
            {loading ? <ActivityIndicator color="#0875DA" style={styles.spinner} /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {!loading && !error && query.trim().length >= 2 && !events.length ? <Text style={styles.help}>No matching events found.</Text> : null}
            {events.map((event) => (
              <Pressable accessibilityLabel={`Preview ${event.name}`} key={event.id} onPress={() => handleSelect(event)} style={styles.result}>
                {event.imageUrl ? <Image contentFit="cover" source={{ uri: event.imageUrl }} style={styles.thumb} /> : <View style={styles.thumb} />}
                <View style={styles.copy}>
                  <Text numberOfLines={2} style={styles.resultTitle}>{event.name}</Text>
                  <Text numberOfLines={2} style={styles.meta}>{[formatDate(event), event.venue?.name, event.venue?.city].filter(Boolean).join(' · ')}</Text>
                </View>
                <Ionicons color="#9CA3AF" name="chevron-forward" size={18} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

function Preview({ error, event, onAdd, onChange, placement, saving }: {
  error: string | null;
  event: TicketmasterEvent;
  onAdd: () => void;
  onChange: (next: Partial<Placement>) => void;
  placement: Placement;
  saving: boolean;
}) {
  const venue = event.venue;
  const warning = getStatusWarning(event);
  const location = [venue?.name, venue?.address, [venue?.city, venue?.state].filter(Boolean).join(', '), venue?.country].filter(Boolean).join('\n');

  return (
    <View style={styles.previewCard}>
      {event.imageUrl ? <Image contentFit="cover" source={{ uri: event.imageUrl }} style={styles.poster} /> : null}
      <View style={styles.previewBody}>
        <Text style={styles.previewTitle}>{event.name}</Text>
        {event.category ? <Text style={styles.chip}>{event.category}</Text> : null}
        <Text style={styles.previewLine}>{formatDate(event)}</Text>
        {location ? <Text style={styles.previewLine}>{location}</Text> : null}
        {warning ? <Text style={styles.warning}>{warning}</Text> : null}

        <Text style={styles.sectionLabel}>Ticket details</Text>
        <View style={styles.chipRow}>
          {TICKET_TYPE_OPTIONS.map((option) => {
            const active = placement.ticketType === option;
            return (
              <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={option} onPress={() => onChange({ ticketType: option })} style={[styles.typeChip, active && styles.typeChipActive]}>
                <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.fieldRow}>
          <Field label="Section" onChangeText={(section) => onChange({ section })} value={placement.section} />
          <Field label="Row" onChangeText={(row) => onChange({ row })} value={placement.row} />
        </View>
        <View style={styles.fieldRow}>
          <Field keyboardType="number-pad" label="Seat from" onChangeText={(seatFrom) => onChange({ seatFrom })} value={placement.seatFrom} />
          <Field keyboardType="number-pad" label="Seat to" onChangeText={(seatTo) => onChange({ seatTo })} value={placement.seatTo} />
        </View>
        <Text style={styles.help}>Ticketmaster does not provide your seats, so these are placeholders. You can change them later with Edit.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityLabel="Add to my tickets" disabled={saving} onPress={onAdd} style={[styles.addButton, saving && styles.addDisabled]}>
          {saving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.addText}>Add to my tickets</Text>}
        </Pressable>
      </View>
    </View>
  );
}

function Field({ keyboardType, label, onChangeText, value }: { keyboardType?: 'number-pad'; label: string; onChangeText: (value: string) => void; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput accessibilityLabel={label} keyboardType={keyboardType} onChangeText={onChangeText} style={styles.fieldInput} value={value} />
    </View>
  );
}

function validatePlacement(placement: Placement) {
  if (!placement.section.trim() || !placement.row.trim()) return 'Enter a section and row.';
  const from = Number(placement.seatFrom);
  const to = Number(placement.seatTo);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) return 'Seats must be whole numbers, and "to" cannot be lower than "from".';
  return null;
}

function getStatusWarning(event: TicketmasterEvent) {
  if (event.status === 'cancelled') return 'Ticketmaster lists this event as cancelled.';
  if (event.status === 'postponed' || event.status === 'rescheduled') return `Ticketmaster lists this event as ${event.status}.`;
  if (event.date && event.date < new Date().toISOString().slice(0, 10)) return 'This event date is in the past.';
  return null;
}

function toTicketInput(event: TicketmasterEvent, placement: Placement): TicketInput {
  const venue = event.venue;
  const past = Boolean(event.date) && event.date < new Date().toISOString().slice(0, 10);
  return {
    eventName: event.name,
    artistName: event.artistName,
    albumName: '',
    venue: venue?.name ?? 'Venue TBA',
    city: venue?.city ?? '',
    state: venue?.state ?? '',
    country: venue?.country ?? '',
    date: event.date,
    time: formatTime(event.time),
    purchaseDate: new Date().toISOString().slice(0, 10),
    section: placement.section.trim(),
    row: placement.row.trim(),
    seatRange: `${Number(placement.seatFrom)} - ${Number(placement.seatTo)}`,
    barcode: `TM-${event.id}`,
    orderNumber: `TM-${event.id}`,
    ticketType: placement.ticketType,
    status: past ? 'past' : 'upcoming',
    perks: '',
    transferRules: '',
    image: event.imageUrl,
    backgroundColor: '#0875DA',
    seatLabel: placement.ticketType === 'VIP' ? 'VIP' : 'General admission',
    ticketNote: `${placement.ticketType} seating`,
    entryInstructions: '',
  };
}

function formatDate(event: TicketmasterEvent) {
  if (!event.date) return 'Date TBA';
  const date = new Date(`${event.date}T${event.time || '00:00:00'}`);
  if (Number.isNaN(date.getTime())) return event.date;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: event.time ? 'numeric' : undefined,
    minute: event.time ? '2-digit' : undefined,
  }).format(date);
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 'TBA';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 62, paddingHorizontal: 16 },
  iconButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  headerCopy: { flex: 1 },
  eyebrow: { color: '#6B7280', fontSize: 11, letterSpacing: 1 },
  title: { color: '#111827', fontSize: 20, fontWeight: '700' },
  content: { gap: 10, padding: 16, paddingBottom: 40 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#0875DA', borderRadius: 8, borderWidth: 3, color: '#161616', fontSize: 18, minHeight: 54, paddingHorizontal: 14 },
  help: { color: '#69717C', fontSize: 13, lineHeight: 18 },
  spinner: { marginVertical: 12 },
  error: { color: '#B42318', fontSize: 13, lineHeight: 18 },
  result: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E1E4E8', borderRadius: 6, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 76, padding: 8 },
  thumb: { backgroundColor: '#E5E7EB', borderRadius: 4, height: 58, width: 58 },
  copy: { flex: 1 },
  resultTitle: { color: '#171717', fontSize: 14, fontWeight: '700', lineHeight: 19 },
  meta: { color: '#737373', fontSize: 12, lineHeight: 17, marginTop: 3 },
  previewCard: { backgroundColor: '#FFFFFF', borderColor: '#E1E4E8', borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  poster: { aspectRatio: 16 / 9, backgroundColor: '#E5E7EB', width: '100%' },
  previewBody: { gap: 8, padding: 14 },
  previewTitle: { color: '#111827', fontSize: 18, fontWeight: '700', lineHeight: 24 },
  chip: { alignSelf: 'flex-start', backgroundColor: '#E8F1FB', borderRadius: 999, color: '#0B5CAD', fontSize: 12, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 3 },
  previewLine: { color: '#374151', fontSize: 14, lineHeight: 20 },
  warning: { backgroundColor: '#FFF4E5', borderRadius: 6, color: '#9A6700', fontSize: 13, lineHeight: 18, overflow: 'hidden', padding: 8 },
  sectionLabel: { color: '#111827', fontSize: 13, fontWeight: '700', letterSpacing: 0.6, marginTop: 8, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', gap: 8 },
  typeChip: { alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 999, flex: 1, justifyContent: 'center', minHeight: 40 },
  typeChipActive: { backgroundColor: '#222222' },
  typeChipText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  typeChipTextActive: { color: '#FFFFFF' },
  fieldRow: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, gap: 4 },
  fieldLabel: { color: '#6B7280', fontSize: 12 },
  fieldInput: { backgroundColor: '#F9FAFB', borderColor: '#D8DDE4', borderRadius: 8, borderWidth: 1, color: '#111827', fontSize: 16, minHeight: 44, paddingHorizontal: 12 },
  addButton: { alignItems: 'center', backgroundColor: '#005BD3', borderRadius: 999, justifyContent: 'center', marginTop: 6, minHeight: 50 },
  addDisabled: { opacity: 0.5 },
  addText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
