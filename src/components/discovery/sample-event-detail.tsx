import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Head from 'expo-router/head';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { fanColors as C } from '@/constants/fan-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import type { EventRecord } from '@/lib/data';
import { useFanStore } from '@/store/use-fan-store';
import { discoveryImage } from './discovery-data';

export function SampleEventDetail({ event }: { event: EventRecord }) {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const saved = useFanStore((state) => state.savedEventIds.includes(event.id));
  const favourite = useFanStore((state) => state.favouriteArtistIds.includes(event.id));
  const toggleSaved = useFanStore((state) => state.toggleSavedEvent);
  const toggleFavourite = useFanStore((state) => state.toggleFavouriteArtist);
  const date = new Date(event.startsAt).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  return <ScreenWrapper backgroundColor={C.background}>
    <Head><meta name="theme-color" content={C.background} /></Head><StatusBar style="light" />
    <ScrollView onLayout={layout.onLayout} contentContainerStyle={styles.content}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to events" onPress={() => router.canGoBack() ? router.back() : router.replace('/discover')} style={styles.back}><Ionicons name="arrow-back" color="white" size={25} /></Pressable>
      <Image source={discoveryImage(event.discovery?.image ?? event.imageUrl)} contentFit="cover" style={{ width: '100%', height: Math.min(420, layout.width * 0.56) }} />
      <View style={[styles.details, { paddingHorizontal: layout.padding }]}>
        <Text style={styles.badge}>SAMPLE EVENT</Text><Text style={styles.title}>{event.title.toUpperCase()}</Text>
        <Text style={styles.body}>{date}</Text><Text style={styles.body}>{event.venue} — {event.city}</Text>
        <Text style={styles.notice}>{event.description}</Text>
        {event.discovery?.presale && <View style={styles.presale}><Text style={styles.subheading}>{event.discovery.presale.sponsor ?? 'Artist Presale'}</Text><Text style={styles.body}>{new Date(event.discovery.presale.opensAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text><Text style={styles.body}>Sample presale information</Text></View>}
        <Pressable accessibilityRole="button" accessibilityState={{ selected: saved }} onPress={() => toggleSaved(event.id)} style={styles.action}><Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} color="white" size={22} /><Text style={styles.actionText}>{saved ? 'Saved to Watchlist' : 'Save to Watchlist'}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: favourite }} onPress={() => toggleFavourite(event.id)} style={[styles.action, styles.secondary]}><Ionicons name={favourite ? 'heart' : 'heart-outline'} color={C.purple} size={22} /><Text style={styles.actionText}>{favourite ? 'Remove from Favourites' : 'Add to Favourites'}</Text></Pressable>
      </View>
    </ScrollView>
  </ScreenWrapper>;
}
const styles = StyleSheet.create({
  content: { paddingBottom: 36 }, back: { minHeight: 48, width: 48, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  details: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingTop: 24, gap: 16 }, badge: { color: C.teal, fontSize: 12, fontWeight: '700', letterSpacing: 1 }, title: { color: 'white', fontSize: 25, lineHeight: 33, fontWeight: '800' },
  body: { color: C.muted, fontSize: 15, lineHeight: 23 }, notice: { backgroundColor: C.surface, color: 'white', padding: 16, fontSize: 15, lineHeight: 23 }, presale: { gap: 8, paddingVertical: 12 }, subheading: { color: 'white', fontSize: 18, fontWeight: '700' },
  action: { minHeight: 52, backgroundColor: C.blue, flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center', padding: 12 }, secondary: { backgroundColor: C.surface }, actionText: { color: 'white', fontSize: 15, fontWeight: '700', flexShrink: 1 },
});
