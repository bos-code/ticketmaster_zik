import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { selectTicketReservations, useEventStore } from '@/store/use-event-store';

type TicketIndexTab = 'upcoming' | 'past';

const screenPalette = {
  background: '#050505',
  card: '#0F0F10',
  cardBorder: 'rgba(255,255,255,0.10)',
  tabText: 'rgba(255,255,255,0.56)',
  tabTextActive: '#FFFFFF',
  accent: '#B79E6A',
  venue: 'rgba(255,255,255,0.86)',
  help: 'rgba(255,255,255,0.90)',
  emptyCard: '#111214',
  emptyBorder: 'rgba(255,255,255,0.08)',
  emptyText: 'rgba(255,255,255,0.68)',
} as const;

export function MyTicketsIndexScreen() {
  const router = useRouter();
  const reservations = useEventStore(selectTicketReservations);
  const upcomingEvents = useMemo(
    () => reservations.filter((reservation) => reservation.status === 'upcoming'),
    [reservations],
  );
  const pastEvents = useMemo(
    () => reservations.filter((reservation) => reservation.status === 'past'),
    [reservations],
  );
  const [activeTab, setActiveTab] = useState<TicketIndexTab>(() =>
    upcomingEvents.length > 0 || pastEvents.length === 0 ? 'upcoming' : 'past',
  );

  useEffect(() => {
    if (activeTab === 'upcoming' && upcomingEvents.length === 0 && pastEvents.length > 0) {
      setActiveTab('past');
      return;
    }

    if (activeTab === 'past' && pastEvents.length === 0 && upcomingEvents.length > 0) {
      setActiveTab('upcoming');
    }
  }, [activeTab, pastEvents.length, upcomingEvents.length]);

  const visibleEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
  const backdropImage = visibleEvents[0]?.event.imageUrl ?? reservations[0]?.event.imageUrl;
  const emptyTitle = activeTab === 'upcoming' ? 'No upcoming events yet.' : 'No past events yet.';
  const emptyBody =
    activeTab === 'upcoming'
      ? 'Reservations for events that have not happened yet will show up here.'
      : 'Tickets you have already used will show up here.';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {backdropImage ? (
        <Image
          contentFit="cover"
          source={{ uri: backdropImage }}
          style={styles.backdropImage}
        />
      ) : null}
      <View style={styles.backdropOverlay} />

      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>My Events</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/settings')}
            style={styles.helpButton}>
            <Text style={styles.helpText}>Help</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          <TicketFilterTab
            active={activeTab === 'upcoming'}
            count={upcomingEvents.length}
            label="Upcoming"
            onPress={() => setActiveTab('upcoming')}
          />
          <TicketFilterTab
            active={activeTab === 'past'}
            count={pastEvents.length}
            label="Past"
            onPress={() => setActiveTab('past')}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {visibleEvents.length ? (
            visibleEvents.map((event) => (
              <Pressable
                accessibilityRole="button"
                key={event.id}
                onPress={() =>
                  router.push({
                    pathname: '/tickets',
                    params: { reservationId: event.id },
                  })
                }
                style={styles.eventCard}>
                <Image
                  contentFit="cover"
                  source={{ uri: event.event.imageUrl }}
                  style={styles.eventImage}
                />

                <View style={styles.infoPanel}>
                  <View style={styles.dateChip}>
                    <Text style={styles.dateChipText}>{event.event.date}</Text>
                  </View>

                  <Text style={styles.eventTitle}>{event.event.title}</Text>
                  <View style={styles.titleAccent} />
                  <Text style={styles.eventVenue}>{event.event.venue}</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptyBody}>{emptyBody}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TicketFilterTab({
  active,
  count,
  label,
  onPress,
}: {
  active: boolean;
  count: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.filterTab}>
      <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
        {`${label.toUpperCase()}(${count})`}
      </Text>
      <View style={[styles.filterTabUnderline, active && styles.filterTabUnderlineActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: screenPalette.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backdropImage: {
    height: 220,
    left: 0,
    opacity: 0.38,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backdropOverlay: {
    backgroundColor: 'rgba(5, 5, 5, 0.72)',
    height: 240,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  helpButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 40,
  },
  helpText: {
    color: screenPalette.help,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.lg,
  },
  filterTab: {
    flex: 1,
    gap: ticketSpacing.sm,
    paddingBottom: ticketSpacing.sm,
  },
  filterTabText: {
    color: screenPalette.tabText,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  filterTabTextActive: {
    color: screenPalette.tabTextActive,
  },
  filterTabUnderline: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderRadius: ticketRadii.pill,
    height: 2,
    width: '72%',
  },
  filterTabUnderlineActive: {
    backgroundColor: screenPalette.accent,
  },
  content: {
    gap: ticketSpacing.md,
    paddingBottom: 120,
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.sm,
  },
  eventCard: {
    backgroundColor: screenPalette.card,
    borderColor: screenPalette.cardBorder,
    borderRadius: 2,
    borderWidth: 1,
    overflow: 'hidden',
  },
  eventImage: {
    height: 240,
    width: '100%',
  },
  infoPanel: {
    backgroundColor: '#121214',
    gap: ticketSpacing.sm,
    paddingHorizontal: ticketSpacing.md,
    paddingVertical: ticketSpacing.md,
  },
  dateChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: ticketSpacing.sm,
    paddingVertical: 6,
  },
  dateChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
  },
  titleAccent: {
    backgroundColor: screenPalette.accent,
    borderRadius: ticketRadii.pill,
    height: 2,
    width: 96,
  },
  eventVenue: {
    color: screenPalette.venue,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 19,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: screenPalette.emptyCard,
    borderColor: screenPalette.emptyBorder,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    marginTop: ticketSpacing.md,
    paddingHorizontal: ticketSpacing.lg,
    paddingVertical: ticketSpacing.xl,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyBody: {
    color: screenPalette.emptyText,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
});
