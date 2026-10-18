import { Text, TextInput } from '@/components/ui/app-text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { searchTicketmasterEvents } from '@/lib/ticketmaster-admin-api';
import { useTicketStore, type TicketInput } from '@/store/ticketStore';
import type { TicketmasterEvent } from '@/types/ticketmaster';

export function TicketmasterSearchScreen() {
  const router = useRouter();
  const addEvent = useTicketStore((state) => state.addEvent);
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
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

  async function handleAdd(event: TicketmasterEvent) {
    setAddingId(event.id);
    setError(null);
    try {
      await addEvent(toTicketInput(event));
      router.replace({ pathname: '/admin', params: { toast: 'created' } });
    } catch (reason) {
      console.warn('Ticketmaster event save failed.', reason);
      setError('We could not save this event. Please try again.');
      setAddingId(null);
    }
  }

  return (
    <ScreenWrapper backgroundColor="#F5F6F8">
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/admin'))} style={styles.iconButton}>
          <Ionicons color="#374151" name="chevron-back" size={20} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>ADMIN</Text>
          <Text style={styles.title}>Add from Ticketmaster</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
        <Text style={styles.help}>Tap Add to create a ticket from the event. Section, row and seats get placeholder values you can change with Edit.</Text>
        {loading ? <ActivityIndicator color="#0875DA" style={styles.spinner} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && query.trim().length >= 2 && !events.length ? <Text style={styles.help}>No matching events found.</Text> : null}
        {events.map((event) => (
          <View key={event.id} style={styles.result}>
            <View style={styles.copy}>
              <Text style={styles.resultTitle}>{event.name}</Text>
              <Text style={styles.meta}>{[event.date || 'Date TBA', event.venue?.name, event.venue?.city].filter(Boolean).join(' · ')}</Text>
            </View>
            <Pressable accessibilityLabel={`Add ${event.name}`} disabled={addingId !== null} onPress={() => void handleAdd(event)} style={[styles.add, addingId !== null && styles.addDisabled]}>
              {addingId === event.id ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.addText}>Add</Text>}
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

function toTicketInput(event: TicketmasterEvent): TicketInput {
  const venue = event.venue;
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
    section: 'GA',
    row: '1',
    seatRange: '1 - 2',
    barcode: `TM-${event.id}`,
    orderNumber: `TM-${event.id}`,
    ticketType: 'Standard',
    status: 'upcoming',
    perks: '',
    transferRules: '',
    image: event.imageUrl,
    backgroundColor: '#0875DA',
    seatLabel: 'General admission',
    ticketNote: 'Standard seating',
    entryInstructions: '',
  };
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
  error: { color: '#B42318', fontSize: 13 },
  result: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E1E4E8', borderRadius: 6, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 68, padding: 10 },
  copy: { flex: 1 },
  resultTitle: { color: '#171717', fontSize: 14, fontWeight: '700', lineHeight: 19 },
  meta: { color: '#737373', fontSize: 12, lineHeight: 17, marginTop: 3 },
  add: { alignItems: 'center', backgroundColor: '#222222', borderRadius: 8, justifyContent: 'center', minHeight: 44, minWidth: 64, paddingHorizontal: 12 },
  addDisabled: { opacity: 0.5 },
  addText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});
