import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { HeartIcon } from '@/components/heart-icon';
import { ArtistRow } from '@/components/discovery/discovery-cards';
import { FloatingPrompt } from '@/components/discovery/floating-prompt';
import { useDiscoveryEvents } from '@/components/discovery/use-discovery-events';
import { fanColors as C } from '@/constants/fan-theme';
import { useFanStore } from '@/store/use-fan-store';
import { useAppStore } from '@/store/use-app-store';
import { useFanPermissions } from '@/hooks/use-fan-permissions';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

export default function WatchlistScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const events = useDiscoveryEvents();
  const activeTab = useFanStore((state) => state.watchlistTab);
  const setTab = useFanStore((state) => state.setWatchlistTab);
  const savedIds = useFanStore((state) => state.savedEventIds);
  const favouriteIds = useFanStore((state) => state.favouriteArtistIds);
  const toggleSaved = useFanStore((state) => state.toggleSavedEvent);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const { busy, error, changePermission } = useFanPermissions();
  const selectedIds = activeTab === 'events' ? savedIds : favouriteIds;
  const selectedEvents = events.filter((event) => selectedIds.includes(event.id));
  const missingIds = activeTab === 'events' ? selectedIds.filter((id) => !events.some((event) => event.id === id)) : [];
  const isEmpty = !selectedEvents.length && !missingIds.length;

  return <ScreenWrapper backgroundColor={C.background}>
    <Head><meta name="theme-color" content={C.background} /><meta name="color-scheme" content="dark" /></Head>
    <StatusBar style="light" backgroundColor={C.background} />
    <View style={styles.header}><Text style={styles.title}>WATCHLIST</Text><Text style={styles.subtitle}>Keep track of what’s important</Text></View>
    <View style={styles.segmented}>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: activeTab === 'events' }} accessibilityLabel="Saved events" onPress={() => setTab('events')} style={[styles.segment, activeTab === 'events' && styles.segmentActive]}><Ionicons name={activeTab === 'events' ? 'bookmark' : 'bookmark-outline'} size={18} color={activeTab === 'events' ? '#111111' : 'white'} /><Text style={[styles.segmentText, activeTab === 'events' && styles.segmentTextActive]}>Events</Text></Pressable>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: activeTab === 'favourites' }} onPress={() => setTab('favourites')} style={[styles.segment, activeTab === 'favourites' && styles.segmentActive]}><HeartIcon size={18} color={activeTab === 'favourites' ? '#111111' : 'white'} /><Text style={[styles.segmentText, activeTab === 'favourites' && styles.segmentTextActive]}>Favourites</Text></Pressable>
    </View>
    <ScrollView onLayout={layout.onLayout} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}>
      {isEmpty ? <>
        <View style={styles.empty}><Ionicons name={activeTab === 'events' ? 'bookmark-outline' : 'heart-outline'} size={34} color="white" /><View style={styles.rule} /><Text style={styles.emptyTitle}>{activeTab === 'events' ? 'No Events Added' : 'No Favourites Added'}</Text></View>
        <View style={styles.benefits}>
          <Benefit icon="calendar-outline" title={activeTab === 'events' ? 'Save Events' : 'Follow Your Favourites'} body={activeTab === 'events' ? 'Easily jump back into events that you have an interest in going to' : 'Tap the heart beside artists, teams and performers you love'} />
          <Benefit icon="notifications-outline" title="Never Miss A Presale" body="Set alerts so you never miss out on those presale tickets" />
          <Benefit icon="information-circle-outline" title="Stay Informed" body="Receive alerts and updates about key event information" />
          {activeTab === 'favourites' && <Pressable accessibilityRole="button" onPress={() => router.navigate('/discover')} style={styles.browseButton}><Text style={styles.browseLabel}>Explore artists</Text><Ionicons name="arrow-forward" size={18} color={C.purple} /></Pressable>}
        </View>
      </> : <View style={[styles.savedList, { paddingHorizontal: layout.padding }]}>
        {selectedEvents.map((event) => <View key={event.id} style={{ gap: 6, width: layout.columnWidth }}><ArtistRow event={event} />{activeTab === 'events' && <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${event.title} from saved events`} onPress={() => toggleSaved(event.id)} style={styles.removeButton}><Ionicons name="bookmark" size={14} color={C.purple} /><Text style={styles.removeLabel}>Saved · Remove</Text></Pressable>}</View>)}
        {missingIds.map((id) => <View key={id} style={styles.unavailable}><Text style={styles.subtitle}>This event is no longer available.</Text><Pressable accessibilityRole="button" onPress={() => toggleSaved(id)} style={styles.removeButton}><Text style={styles.removeLabel}>Remove saved event</Text></Pressable></View>)}
      </View>}
      {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </ScrollView>
    {!notificationsEnabled && <FloatingPrompt title="Enable Push Notifications" body="Keep up to date with events" icon="warning" color="#FFBD3B" busy={busy === 'notifications'} onPress={() => void changePermission('notifications', true)} />}
  </ScreenWrapper>;
}
function Benefit({ icon, title, body }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; body: string }) {
  return <View style={styles.benefit}><Ionicons name={icon} size={21} color={C.purple} /><View style={{ flex: 1, gap: 3 }}><Text style={styles.benefitTitle}>{title}</Text><Text style={styles.benefitBody}>{body}</Text></View></View>;
}
const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 2 }, title: { color: 'white', fontSize: 18, fontWeight: '800', lineHeight: 22 }, subtitle: { color: C.muted, fontSize: 16, lineHeight: 23, marginTop: 2 },
  segmented: { marginHorizontal: 15, marginTop: 24, flexDirection: 'row', borderColor: C.border, borderWidth: 1, borderRadius: 30, padding: 3, minHeight: 52 }, segment: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, borderRadius: 24 }, segmentActive: { backgroundColor: C.purple }, segmentText: { color: 'white', fontSize: 16 }, segmentTextActive: { color: '#111111', fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 39 }, rule: { width: 73, height: 2, backgroundColor: C.purple, marginTop: 32, marginBottom: 19 }, emptyTitle: { color: C.muted, fontSize: 16, fontWeight: '700' },
  benefits: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 24, marginTop: 34, gap: 18 }, benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: 15 }, benefitTitle: { color: 'white', fontSize: 16, fontWeight: '700' }, benefitBody: { color: C.muted, fontSize: 14, lineHeight: 21 },
  browseButton: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginLeft: 35 }, browseLabel: { color: C.purple, fontSize: 13, fontWeight: '600' }, savedList: { padding: 16, paddingTop: 28, gap: 24, flexDirection: 'row', flexWrap: 'wrap' },
  removeButton: { alignSelf: 'flex-end', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 }, removeLabel: { color: C.purple, fontSize: 14 }, unavailable: { paddingVertical: 12 }, error: { color: '#FFD6AA', padding: 15, fontSize: 16, lineHeight: 18 },
});
