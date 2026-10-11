import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Head from 'expo-router/head';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Text, TextInput } from '@/components/ui/app-text';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { EventTile, ArtistRow } from '@/components/discovery/discovery-cards';
import { ArtistTile, CityGuideCard, FeedEventCard } from '@/components/discovery/home-feed-cards';
import { getHomeSections, groupArtists, groupCities, homeCategories, initialPromptScrollState, localDateKey, sectionTitles, updatePromptScroll, type HomeSection } from '@/components/discovery/home-feed-data';
import { FloatingPrompt } from '@/components/discovery/floating-prompt';
import { useDiscoveryEvents } from '@/components/discovery/use-discovery-events';
import type { DiscoveryEvent } from '@/components/discovery/discovery-data';
import { fanColors as C } from '@/constants/fan-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useAppStore } from '@/store/use-app-store';
import { useFanStore } from '@/store/use-fan-store';

type FeedSelection = { section: HomeSection } | { artist: string } | { city: string };

export function DiscoverTabScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const events = useDiscoveryEvents();
  const location = useAppStore((state) => state.homeLocationLabel);
  const locationEnabled = useAppStore((state) => state.locationEnabled);
  const hasChosenLocation = useAppStore((state) => state.hasChosenLocation);
  const savedIds = useFanStore((state) => state.savedEventIds);
  const favourites = useFanStore((state) => state.favouriteArtistIds);
  const toggleSaved = useFanStore((state) => state.toggleSavedEvent);
  const [query, setQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<DiscoveryEvent | null>(null);
  const [selection, setSelection] = useState<FeedSelection | null>(null);
  const scroll = useRef<ScrollView>(null);
  const feedOffset = useRef(0);
  const browsingResults = useRef(false);
  const restoreOffset = useRef<number | null>(null);
  const promptScroll = useRef(initialPromptScrollState);
  const [promptVisible, setPromptVisible] = useState(true);
  const showResults = Boolean(query.trim() || selection);
  const [now, setNow] = useState(() => new Date());
  const today = localDateKey(now);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const sections = useMemo(() => getHomeSections(events, now), [events, now]);
  const matchedEvents = useMemo(() => events.filter((event) => `${event.title} ${event.artist} ${event.genre} ${event.venue} ${event.city}`.toLowerCase().includes(query.trim().toLowerCase())), [events, query]);
  const forYou = useMemo(() => [...events].sort((left, right) =>
    Number(savedIds.includes(right.id) || favourites.includes(right.id)) - Number(savedIds.includes(left.id) || favourites.includes(left.id))
    || Number(right.date >= today) - Number(left.date >= today)), [events, savedIds, favourites, today]);
  const cities = groupCities(events.filter((event) => event.date >= today));
  const showLocationPrompt = !locationEnabled && !hasChosenLocation;
  const resultEvents = query.trim() ? matchedEvents : selection && 'section' in selection ? sections[selection.section]
    : selection && 'artist' in selection ? events.filter((event) => event.artist === selection.artist && event.date >= today)
    : selection && 'city' in selection ? events.filter((event) => event.city === selection.city && event.date >= today) : events;
  const resultTitle = query.trim() ? `Search results (${resultEvents.length})` : selection && 'section' in selection ? sectionTitles[selection.section]
    : selection && 'artist' in selection ? selection.artist : selection && 'city' in selection ? selection.city : 'Explore Events';
  const carouselStyle = { paddingHorizontal: layout.padding, gap: 12 };

  function openSelection(value: FeedSelection) {
    browsingResults.current = true;
    setQuery(''); setSelection(value);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function clearResults() {
    restoreOffset.current = feedOffset.current;
    setQuery(''); setSelection(null);
  }
  function onContentSizeChange() {
    if (restoreOffset.current === null) return;
    scroll.current?.scrollTo({ y: restoreOffset.current, animated: false });
    restoreOffset.current = null;
    browsingResults.current = false;
  }
  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    if (!browsingResults.current && restoreOffset.current === null) feedOffset.current = contentOffset.y;
    const next = updatePromptScroll(promptScroll.current, contentOffset.y, contentSize.height - layoutMeasurement.height);
    if (next.visible !== promptScroll.current.visible) setPromptVisible(next.visible);
    promptScroll.current = next;
  }
  function renderEventSection(section: HomeSection, promo = false) {
    const items = sections[section];
    return <React.Fragment key={section}>
      <SectionHeading title={sectionTitles[section]} padding={layout.padding} onViewAll={() => openSelection({ section })} />
      {items.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={(promo ? layout.eventCardWidth : layout.compactCardWidth) + 12} decelerationRate="fast" contentContainerStyle={carouselStyle}>
        {items.map((event) => <FeedEventCard key={event.id} event={event} promo={promo} width={promo ? layout.eventCardWidth : layout.compactCardWidth} onMenu={() => setSelectedEvent(event)} />)}
      </ScrollView> : <Text style={[styles.emptyBody, { marginHorizontal: layout.padding }]}>No {section === 'weekend' ? 'events this weekend' : section === 'last-minute' ? 'events in the next two weeks' : 'listings available yet'}.</Text>}
    </React.Fragment>;
  }

  return <ScreenWrapper backgroundColor={C.background}>
    <Head><meta name="theme-color" content={C.background} /><meta name="color-scheme" content="dark" /></Head>
    <StatusBar style="light" backgroundColor={C.background} />
    <ScrollView ref={scroll} onScroll={onScroll} onContentSizeChange={onContentSizeChange} scrollEventThrottle={16} onLayout={layout.onLayout} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: showLocationPrompt ? 100 : 32 }}>
      <View style={[styles.header, { marginHorizontal: layout.padding }, layout.wide && styles.wideHeader]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Choose your location" onPress={() => router.push('/account/location')} style={[styles.location, layout.wide && styles.wideLocation]}>
          <Ionicons name="location" size={22} color={C.teal} /><Text numberOfLines={2} style={styles.locationText}>{location.replace(/,\s*(US|NG)$/, '')}</Text><Ionicons name="chevron-forward" size={18} color="white" />
        </Pressable>
        <View style={[styles.search, layout.wide && { flex: 2 }]}>
          <View style={styles.searchIcon}><Ionicons name="search-outline" size={25} color="white" /></View>
          <TextInput accessibilityLabel="Search shows, artists or venues" placeholder="Search for Shows" placeholderTextColor={C.muted} value={query} onChangeText={(value) => { browsingResults.current = Boolean(value.trim()); setQuery(value); setSelection(null); }} returnKeyType="search" style={styles.searchInput} />
          {(query || selection) && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={clearResults} style={styles.clear}><Ionicons name="close" size={22} color="white" /></Pressable>}
        </View>
      </View>
      {showResults ? <View style={[styles.results, { paddingHorizontal: layout.padding }]}>
        <Text accessibilityLiveRegion="polite" style={styles.heading}>{resultTitle}</Text>
        <Pressable accessibilityRole="button" onPress={clearResults} style={styles.backToFeed}><Ionicons name="arrow-back" size={20} color="white" /><Text style={styles.viewAll}>Back to Home</Text></Pressable>
        <View style={styles.grid}>{resultEvents.map((event) => <ArtistRow key={event.id} event={event} rank={selection && 'section' in selection && selection.section === 'explore' ? events.findIndex((item) => item.id === event.id) + 1 : undefined} width={layout.columnWidth} />)}</View>
        {!resultEvents.length && <EmptyDiscovery title="No shows found" body="Try another event or venue, or browse all events." />}
      </View> : <>
        <Text style={[styles.heading, styles.forYouTitle, { marginHorizontal: layout.padding }]}>For You</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={layout.eventCardWidth + 12} decelerationRate="fast" contentContainerStyle={carouselStyle}>
          {forYou.slice(0, 6).map((event) => <EventTile key={event.id} event={event} width={layout.eventCardWidth} onMenu={() => setSelectedEvent(event)} />)}
        </ScrollView>
        {!events.length && <EmptyDiscovery title="No events available" body="New events will appear here when they’re added." />}
        {events.length > 0 && <>
          <SectionHeading title="Explore Events" padding={layout.padding} onViewAll={() => openSelection({ section: 'explore' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={layout.artistGroupWidth + 12} decelerationRate="fast" contentContainerStyle={carouselStyle}>
            {Array.from({ length: Math.ceil(events.length / 3) }, (_, group) => <View key={group} style={{ gap: 12 }}>{events.slice(group * 3, group * 3 + 3).map((event, index) => <ArtistRow key={event.id} event={event} rank={group * 3 + index + 1} width={layout.artistGroupWidth} />)}</View>)}
          </ScrollView>
          {renderEventSection('last-minute')}
          {renderEventSection('weekend')}
          {renderEventSection('announced', true)}
          {renderEventSection('presales', true)}
          {homeCategories.map(({ id, title }) => <React.Fragment key={id}>
            <SectionHeading title={title} padding={layout.padding} onViewAll={() => openSelection({ section: id })} />
            {sections[id].length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={carouselStyle}>
              {groupArtists(sections[id]).map((group) => <ArtistTile key={group.artist} event={group.event} events={group.events} width={layout.compactCardWidth} onOpen={() => openSelection({ artist: group.artist })} />)}
            </ScrollView> : <Text style={[styles.emptyBody, { marginHorizontal: layout.padding }]}>No upcoming events in this category.</Text>}
          </React.Fragment>)}
          <SectionHeading title={sectionTitles.promoted} padding={layout.padding} onViewAll={() => openSelection({ section: 'promoted' })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={carouselStyle}>
            {groupArtists(sections.promoted).map((group) => <ArtistTile key={group.artist} event={group.event} events={group.events} subtitle={group.event.promotionText} showHeart={false} width={layout.compactCardWidth} onOpen={() => openSelection({ artist: group.artist })} />)}
          </ScrollView>
          <Text style={[styles.heading, styles.sectionTitle, { marginHorizontal: layout.padding }]}>City Guides</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={carouselStyle}>
            {cities.map((city) => <CityGuideCard key={city.city} city={city.city} image={city.image} width={layout.cityCardWidth} onOpen={() => openSelection({ city: city.city })} />)}
          </ScrollView>
          {events.some((event) => event.sample) && <Text style={[styles.catalogNote, { marginHorizontal: layout.padding }]}>Includes sample listings for this demo. Event details identify sample dates and availability.</Text>}

        </>}
      </>}
    </ScrollView>
    {showLocationPrompt && <FloatingPrompt visible={promptVisible && !showResults} title="Find Events Near You" body="Set your location" icon="location" color={C.teal} onPress={() => router.push('/account/location')} />}
    <Modal visible={selectedEvent !== null} transparent animationType="fade" onRequestClose={() => setSelectedEvent(null)}>
      <View style={styles.modalBackdrop}><Pressable accessibilityRole="button" accessibilityLabel="Close event options" style={StyleSheet.absoluteFill} onPress={() => setSelectedEvent(null)} />
        <View style={styles.eventOptions}><Text style={styles.heading}>{selectedEvent?.title}</Text>{selectedEvent?.sample && <Text style={styles.emptyBody}>Sample event · no real ticket inventory</Text>}<Pressable accessibilityRole="button" onPress={() => { if (selectedEvent) toggleSaved(selectedEvent.id); setSelectedEvent(null); }} style={styles.option}><Ionicons name={selectedEvent && savedIds.includes(selectedEvent.id) ? 'bookmark' : 'bookmark-outline'} size={23} color={C.purple} /><Text style={styles.optionLabel}>{selectedEvent && savedIds.includes(selectedEvent.id) ? 'Remove from Watchlist' : 'Save to Watchlist'}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setSelectedEvent(null)} style={styles.option}><Text style={styles.optionLabel}>Cancel</Text></Pressable></View>
      </View>
    </Modal>
  </ScreenWrapper>;
}
function SectionHeading({ title, padding, onViewAll }: { title: string; padding: number; onViewAll: () => void }) {
  return <View style={[styles.sectionHeading, { marginHorizontal: padding }]}><Text style={[styles.heading, { flex: 1 }]}>{title}</Text><Pressable accessibilityRole="button" accessibilityLabel={`View all ${title}`} onPress={onViewAll} style={styles.viewAllButton}><Text style={styles.viewAll}>View All</Text></Pressable></View>;
}
function EmptyDiscovery({ title, body }: { title: string; body: string }) {
  return <View style={styles.noResults}><Ionicons name="search-outline" size={35} color={C.muted} /><Text style={styles.noResultsTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>;
}
const styles = StyleSheet.create({
  header: { gap: 12 }, wideHeader: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  wideLocation: { flex: 1, minWidth: 0 }, location: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingVertical: 8 }, locationText: { color: 'white', fontSize: 16, fontWeight: '700', flexShrink: 1 },
  search: { minHeight: 60, borderRadius: 40, backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', padding: 8, paddingRight: 12, gap: 10, minWidth: 0 }, searchIcon: { height: 44, width: 44, borderRadius: 24, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' }, searchInput: { color: 'white', fontSize: 16, flex: 1, minWidth: 0, padding: 0 }, clear: { minHeight: 44, width: 44, alignItems: 'center', justifyContent: 'center' },
  heading: { color: 'white', fontSize: 18, fontWeight: '700', lineHeight: 25 }, forYouTitle: { marginTop: 28, marginBottom: 16 }, sectionHeading: { marginTop: 28, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, viewAll: { color: 'white', fontSize: 14 }, viewAllButton: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 },
  sectionTitle: { marginTop: 32, marginBottom: 20 }, backToFeed: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }, catalogNote: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 32, paddingBottom: 24 },
  results: { paddingTop: 28, gap: 16 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 }, noResults: { alignItems: 'center', padding: 32, paddingVertical: 48, gap: 12 }, noResultsTitle: { color: 'white', fontSize: 20, fontWeight: '700' }, emptyBody: { color: C.muted, fontSize: 16, lineHeight: 23 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' }, eventOptions: { width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: C.surface, padding: 24, paddingBottom: 36 }, option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 14 }, optionLabel: { color: 'white', fontSize: 16 },
});
