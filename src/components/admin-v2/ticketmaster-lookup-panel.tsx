import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { searchTicketmasterAdmin } from '@/lib/ticketmaster-admin-api';
import type { TicketmasterEvent, TicketmasterVenue } from '@/types/ticketmaster';
import { fonts } from '../../../theme/fonts';

type Mode = 'events' | 'venues';

export function TicketmasterLookupPanel({ onSelectEvent, onSelectVenue }: { onSelectEvent: (value: TicketmasterEvent) => void; onSelectVenue: (value: TicketmasterVenue) => void }) {
  const [mode, setMode] = useState<Mode>('events');
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [venues, setVenues] = useState<TicketmasterVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    const id = ++requestId.current;
    const controller = new AbortController();
    if (q.length < 2) { setEvents([]); setVenues([]); setError(null); setLoading(false); return () => controller.abort(); }
    const timer = setTimeout(async () => {
      try {
        setLoading(true); setError(null);
        const result = await searchTicketmasterAdmin(mode, q, controller.signal);
        if (id !== requestId.current) return;
        setEvents(result.events ?? []); setVenues(result.venues ?? []);
      } catch (reason) {
        if (controller.signal.aborted || id !== requestId.current) return;
        setEvents([]); setVenues([]); setError(reason instanceof Error ? reason.message : 'Lookup failed.');
      } finally { if (id === requestId.current) setLoading(false); }
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [mode, query]);

  const results = mode === 'events' ? events : venues;
  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <Text style={styles.title}>Look up on Ticketmaster</Text>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {(['events', 'venues'] as const).map((item) => {
            const active = mode === item;
            return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} key={item} onPress={() => { setMode(item); setEvents([]); setVenues([]); setError(null); }} style={[styles.tab, active && styles.tabActive]}><Text style={[styles.tabText, active && styles.tabTextActive]}>{item === 'events' ? 'Events' : 'Venues'}</Text></Pressable>;
          })}
        </View>
      </View>
      <Text style={styles.help}>Search artist or tour — pick a show date to fill details and poster. Venue search fills location only.</Text>
      <TextInput accessibilityLabel={`Search Ticketmaster ${mode}`} autoCapitalize="none" autoCorrect={false} onChangeText={setQuery} placeholder={mode === 'events' ? 'Search artist, event, or tour' : 'Search venue'} placeholderTextColor="#7B7B7B" returnKeyType="search" style={styles.input} value={query} />
      {loading ? <Message loading text="Searching Ticketmaster…" /> : null}
      {error ? <Message error text={error} /> : null}
      {!loading && !error && query.trim().length >= 2 && !results.length ? <Message text={`No matching ${mode} found.`} /> : null}
      {events.map((event) => <Result key={event.id} primary={event.name} secondary={[formatDate(event), event.venue?.name, event.venue?.city].filter(Boolean).join(' · ')} onSelect={() => onSelectEvent(event)} />)}
      {venues.map((venue) => <Result key={venue.id} primary={venue.name} secondary={[venue.city, venue.state, venue.country].filter(Boolean).join(', ')} onSelect={() => onSelectVenue(venue)} />)}
    </View>
  );
}

function Result({ primary, secondary, onSelect }: { primary: string; secondary: string; onSelect: () => void }) {
  return <View style={styles.result}><View style={styles.copy}><Text style={styles.resultTitle}>{primary}</Text><Text style={styles.meta}>{secondary}</Text></View><Pressable accessibilityLabel={`Select ${primary}`} onPress={onSelect} style={styles.select}><Text style={styles.selectText}>Select</Text></Pressable></View>;
}
function Message({ error, loading, text }: { error?: boolean; loading?: boolean; text: string }) { return <View accessibilityLiveRegion="polite" style={[styles.message, error && styles.messageError]}>{loading ? <ActivityIndicator color="#0875DA" size="small" /> : null}<Text style={[styles.messageText, error && styles.errorText]}>{text}</Text></View>; }
function formatDate(event: TicketmasterEvent) { if (!event.date) return event.time || 'Date TBA'; const date = new Date(`${event.date}T${event.time || '00:00:00'}`); return Number.isNaN(date.getTime()) ? event.date : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: event.time ? 'numeric' : undefined, minute: event.time ? '2-digit' : undefined }).format(date); }

const styles = StyleSheet.create({
  panel: { backgroundColor: '#F5F9FF', borderColor: '#AAC9EB', borderRadius: 8, borderWidth: 1, gap: 10, padding: 12 },
  head: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  title: { color: '#181818', flex: 1, fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
  tabs: { backgroundColor: '#FFF', borderColor: '#D8DDE4', borderRadius: 7, borderWidth: 1, flexDirection: 'row', padding: 2 },
  tab: { alignItems: 'center', borderRadius: 5, justifyContent: 'center', minHeight: 34, paddingHorizontal: 12 }, tabActive: { backgroundColor: '#0875DA' },
  tabText: { color: '#4B5563', fontFamily: fonts.medium, fontSize: 13 }, tabTextActive: { color: '#FFF', fontFamily: fonts.semiBold },
  help: { color: '#69717C', fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  input: { backgroundColor: '#FFF', borderColor: '#0875DA', borderRadius: 8, borderWidth: 3, color: '#161616', fontFamily: fonts.regular, fontSize: 18, minHeight: 54, paddingHorizontal: 14 },
  result: { alignItems: 'center', backgroundColor: '#FFF', borderColor: '#E1E4E8', borderRadius: 4, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 68, padding: 10 }, copy: { flex: 1 },
  resultTitle: { color: '#171717', fontFamily: fonts.bold, fontSize: 14, lineHeight: 19 }, meta: { color: '#737373', fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 3 },
  select: { alignItems: 'center', backgroundColor: '#222', borderRadius: 8, justifyContent: 'center', minHeight: 44, minWidth: 64, paddingHorizontal: 12 }, selectText: { color: '#FFF', fontFamily: fonts.medium, fontSize: 13 },
  message: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 6, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 52, padding: 10 }, messageError: { backgroundColor: '#FFF2F2' },
  messageText: { color: '#5F6670', fontFamily: fonts.medium, fontSize: 13, textAlign: 'center' }, errorText: { color: '#B42318' },
});
