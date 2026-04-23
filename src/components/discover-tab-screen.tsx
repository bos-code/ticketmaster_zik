import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientSurface } from '@/components/ui/gradient-surface';
import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { shellGradients } from '@/constants/shell-theme';
import {
  DEFAULT_HOME_LOCATION,
  resolveHomeLocation,
} from '@/lib/device-permissions';
import { useAppStore } from '@/store/use-app-store';
import { selectDiscoverEvents, useEventStore } from '@/store/use-event-store';

type EventWindow = 'All Dates' | 'Today' | 'This Week';

type GenreCard = {
  label: string;
  tint: string;
  imageUrl: string;
};

const eventWindows: EventWindow[] = ['All Dates', 'Today', 'This Week'];

export function DiscoverTabScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 68, 318);
  const discoverEvents = useEventStore(selectDiscoverEvents);
  const homeLocationLabel = useAppStore((state) => state.homeLocationLabel);
  const setHomeLocationLabel = useAppStore((state) => state.setHomeLocationLabel);
  const locationEnabled = useAppStore((state) => state.locationEnabled);
  const setLocationEnabled = useAppStore((state) => state.setLocationEnabled);
  const [searchValue, setSearchValue] = useState('');
  const [selectedWindow, setSelectedWindow] = useState<EventWindow>('All Dates');
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const normalizedSearch = searchValue.trim().toLowerCase();
  const genreCards = useMemo<GenreCard[]>(
    () => [
      {
        label: 'Music',
        tint: 'rgba(126, 65, 255, 0.32)',
        imageUrl:
          discoverEvents[0]?.imageUrl ??
          'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
      },
      {
        label: 'Sports',
        tint: 'rgba(17, 168, 138, 0.30)',
        imageUrl:
          discoverEvents[1]?.imageUrl ??
          'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=900&q=80',
      },
    ],
    [discoverEvents],
  );

  useEffect(() => {
    let isActive = true;

    async function loadCurrentLocation() {
      setIsResolvingLocation(true);
      setLocationMessage(null);

      const result = await resolveHomeLocation({ requestIfNeeded: true });

      if (!isActive) {
        return;
      }

      if (result.granted && result.label) {
        setLocationEnabled(true);
        setHomeLocationLabel(result.label);
      } else {
        setLocationEnabled(false);
        setLocationMessage(result.error ?? 'Location access is currently unavailable.');
      }

      setIsResolvingLocation(false);
    }

    void loadCurrentLocation();

    return () => {
      isActive = false;
    };
  }, [setHomeLocationLabel, setLocationEnabled]);

  const visibleEvents = useMemo(() => {
    return discoverEvents.filter((event) => {
      if (!normalizedSearch) {
        return true;
      }

      return [event.title, event.venue, event.city].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [discoverEvents, normalizedSearch]);

  const filteredEvents = useMemo(() => {
    if (selectedWindow === 'All Dates') {
      return visibleEvents;
    }

    const now = new Date();

    return visibleEvents.filter((event) => {
      const eventDate = new Date(event.startsAt);

      if (Number.isNaN(eventDate.getTime())) {
        return false;
      }

      if (selectedWindow === 'Today') {
        return isSameDay(eventDate, now);
      }

      const weekBoundary = new Date(now);
      weekBoundary.setDate(now.getDate() + 7);
      return eventDate >= startOfDay(now) && eventDate <= weekBoundary;
    });
  }, [selectedWindow, visibleEvents]);

  async function handleRefreshLocation() {
    setIsResolvingLocation(true);
    setLocationMessage(null);

    const result = await resolveHomeLocation({ requestIfNeeded: true });

    if (result.granted && result.label) {
      setLocationEnabled(true);
      setHomeLocationLabel(result.label);
    } else {
      setLocationEnabled(false);
      setLocationMessage(result.error ?? 'Location access is currently unavailable.');
    }

    setIsResolvingLocation(false);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.subtitle}>Find events around you and reserve faster.</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/settings')}
              style={styles.avatarButton}>
              <Ionicons color={ticketColors.primaryBright} name="person-circle-outline" size={34} />
            </Pressable>
          </View>

          <View style={styles.searchShell}>
            <Ionicons color={ticketColors.textSubtle} name="search-outline" size={20} />
            <TextInput
              accessibilityLabel="Search events, performers, or venues"
              onChangeText={setSearchValue}
              placeholder="Search events, performers, or venues"
              placeholderTextColor={ticketColors.textSubtle}
              style={styles.searchInput}
              value={searchValue}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleRefreshLocation}
            style={styles.locationCard}>
            <View style={styles.locationIconWrap}>
              {isResolvingLocation ? (
                <ActivityIndicator color={ticketColors.primaryBright} size="small" />
              ) : (
                <Ionicons color={ticketColors.primaryBright} name="location" size={20} />
              )}
            </View>

            <View style={styles.locationCopy}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <Text numberOfLines={1} style={styles.locationValue}>
                {locationEnabled ? homeLocationLabel : DEFAULT_HOME_LOCATION}
              </Text>
              {locationMessage ? (
                <Text numberOfLines={2} style={styles.locationHint}>
                  {locationMessage}
                </Text>
              ) : (
                <Text style={styles.locationHint}>Tap to refresh your live location.</Text>
              )}
            </View>

            <Ionicons color={ticketColors.textSubtle} name="chevron-forward" size={18} />
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <Pressable accessibilityRole="button" onPress={() => setSelectedWindow('All Dates')}>
              <Text style={styles.sectionAction}>See all</Text>
            </Pressable>
          </View>

          <FlatList
            contentContainerStyle={styles.carouselContent}
            data={visibleEvents.slice(0, 4)}
            decelerationRate="fast"
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/events/[id]',
                    params: { id: item.id },
                  })
                }
                style={[styles.featuredCard, { width: cardWidth }]}>
                <Image contentFit="cover" source={{ uri: item.imageUrl }} style={styles.featuredImage} />
                <GradientSurface colors={shellGradients.ticket} style={styles.featuredOverlay} />

                <View style={styles.featuredCopy}>
                  <Text style={styles.featuredDate}>{item.date}</Text>
                  <Text numberOfLines={1} style={styles.featuredTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.featuredVenue}>
                    {item.venue}
                  </Text>
                </View>
              </Pressable>
            )}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={cardWidth + ticketSpacing.md}
          />

       

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore Event Genres</Text>

            <View style={styles.genreRow}>
              {genreCards.map((genre) => (
                <Pressable
                  accessibilityRole="button"
                  key={genre.label}
                  onPress={() => setSearchValue(genre.label)}
                  style={styles.genreCard}>
                  <Image contentFit="cover" source={{ uri: genre.imageUrl }} style={styles.genreImage} />
                  <View style={[styles.genreTint, { backgroundColor: genre.tint }]} />
                  <Text style={styles.genreLabel}>{genre.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.largeSectionTitle}>Discover Events</Text>
            <Text style={styles.subsectionTitle}>Events Happening</Text>

            <View style={styles.filterRow}>
              {eventWindows.map((window) => {
                const active = selectedWindow === window;

                return (
                  <Pressable
                    accessibilityRole="button"
                    key={window}
                    onPress={() => setSelectedWindow(window)}
                    style={[styles.filterChip, active && styles.filterChipActive]}>
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {window}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {filteredEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No events available for {selectedWindow}.</Text>
                <Text style={styles.emptyBody}>
                  Try another time range or search a performer, venue, or city.
                </Text>
              </View>
            ) : (
              <View style={styles.eventList}>
                {filteredEvents.map((event) => (
                  <Pressable
                    accessibilityRole="button"
                    key={event.id}
                    onPress={() =>
                      router.push({
                        pathname: '/events/[id]',
                        params: { id: event.id },
                      })
                    }
                    style={styles.eventCard}>
                    <Image contentFit="cover" source={{ uri: event.imageUrl }} style={styles.eventImage} />

                    <View style={styles.eventCopy}>
                      <Text style={styles.eventDate}>{event.date}</Text>
                      <Text numberOfLines={2} style={styles.eventTitle}>
                        {event.title}
                      </Text>
                      <Text numberOfLines={1} style={styles.eventVenue}>
                        {`${event.venue} - ${event.city}`}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good Morning!';
  }

  if (hour < 18) {
    return 'Good Afternoon!';
  }

  return 'Good Evening!';
}

function startOfDay(value: Date) {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ticketColors.background,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 108,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: ticketSpacing.md,
    justifyContent: 'space-between',
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.lg,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    color: ticketColors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  subtitle: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  avatarButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  searchShell: {
    alignItems: 'center',
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    marginHorizontal: ticketSpacing.lg,
    marginTop: ticketSpacing.lg,
    minHeight: 56,
    paddingHorizontal: ticketSpacing.md,
  },
  searchInput: {
    color: ticketColors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    padding: 0,
  },
  locationCard: {
    alignItems: 'center',
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    marginHorizontal: ticketSpacing.lg,
    marginTop: ticketSpacing.md,
    paddingHorizontal: ticketSpacing.md,
    paddingVertical: ticketSpacing.md,
  },
  locationIconWrap: {
    alignItems: 'center',
    backgroundColor: ticketColors.primarySoft,
    borderRadius: ticketRadii.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  locationCopy: {
    flex: 1,
    gap: 2,
  },
  locationLabel: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  locationValue: {
    color: ticketColors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  locationHint: {
    color: ticketColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ticketSpacing.xl,
    paddingHorizontal: ticketSpacing.lg,
  },
  sectionTitle: {
    color: ticketColors.text,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 24,
  },
  sectionAction: {
    color: ticketColors.primaryBright,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  carouselContent: {
    gap: ticketSpacing.md,
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.md,
  },
  featuredCard: {
    borderRadius: 20,
    height: 360,
    overflow: 'hidden',
  },
  featuredImage: {
    height: '100%',
    width: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredCopy: {
    bottom: ticketSpacing.lg,
    left: ticketSpacing.lg,
    position: 'absolute',
    right: ticketSpacing.lg,
  },
  featuredDate: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: ticketSpacing.sm,
  },
  featuredVenue: {
    color: 'rgba(255, 255, 255, 0.84)',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 6,
  },
  promoCard: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: ticketSpacing.md,
    marginHorizontal: ticketSpacing.lg,
    marginTop: ticketSpacing.xl,
    overflow: 'hidden',
    paddingHorizontal: ticketSpacing.lg,
    paddingVertical: ticketSpacing.lg,
  },
  promoCopy: {
    flex: 1,
    gap: 4,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  promoBody: {
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  section: {
    marginTop: ticketSpacing.xl,
    paddingHorizontal: ticketSpacing.lg,
  },
  genreRow: {
    flexDirection: 'row',
    gap: ticketSpacing.md,
    marginTop: ticketSpacing.md,
  },
  genreCard: {
    borderRadius: 18,
    flex: 1,
    height: 160,
    overflow: 'hidden',
    position: 'relative',
  },
  genreImage: {
    height: '100%',
    width: '100%',
  },
  genreTint: {
    ...StyleSheet.absoluteFillObject,
  },
  genreLabel: {
    bottom: ticketSpacing.md,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    left: ticketSpacing.md,
    position: 'absolute',
  },
  largeSectionTitle: {
    color: ticketColors.text,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 39,
  },
  subsectionTitle: {
    color: ticketColors.textMuted,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
    marginTop: ticketSpacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ticketSpacing.sm,
    marginTop: ticketSpacing.lg,
  },
  filterChip: {
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.pill,
    borderWidth: 1,
    paddingHorizontal: ticketSpacing.md,
    paddingVertical: ticketSpacing.xs,
  },
  filterChipActive: {
    backgroundColor: ticketColors.primarySoft,
    borderColor: 'rgba(18, 119, 255, 0.18)',
  },
  filterChipText: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  filterChipTextActive: {
    color: ticketColors.primaryBright,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    marginTop: ticketSpacing.lg,
    padding: ticketSpacing.lg,
  },
  emptyTitle: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyBody: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    textAlign: 'center',
  },
  eventList: {
    gap: ticketSpacing.md,
    marginTop: ticketSpacing.lg,
  },
  eventCard: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  eventImage: {
    height: 112,
    width: 112,
  },
  eventCopy: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: ticketSpacing.md,
    paddingVertical: ticketSpacing.md,
  },
  eventDate: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  eventTitle: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  eventVenue: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
