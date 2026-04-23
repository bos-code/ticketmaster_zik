import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import {
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from '@/lib/map-utils';

export function VenueMapCard({
  eventId,
  latitude,
  longitude,
  venueAddress,
  venueName,
  venueSummary,
}: VenueMapData) {
  const router = useRouter();
  const venueCoordinate = toCoordinate(latitude, longitude);

  function handleOpenDirections() {
    if (eventId) {
      router.push({
        pathname: '/event-directions/[id]',
        params: { id: eventId },
      });
      return;
    }

    void handleOpenExternalMaps();
  }

  async function handleOpenExternalMaps() {
    if (!venueCoordinate) {
      return;
    }

    await openExternalMaps({
      destination: venueCoordinate,
      destinationLabel: venueName,
      origin: null,
    });
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Venue</Text>
      <Text style={styles.title}>{venueName}</Text>
      {venueAddress ? <Text style={styles.address}>{venueAddress}</Text> : null}
      <Text style={styles.body}>
        {venueSummary ??
          'Open the in-app directions view for route details, or hand off to your preferred maps app.'}
      </Text>

      <View style={styles.placeholderMap}>
        <Ionicons color={ticketColors.textSubtle} name="map-outline" size={30} />
        <Text style={styles.placeholderTitle}>Interactive map preview is mobile-only.</Text>
        <Text style={styles.placeholderBody}>
          The full dark venue map, live route, and in-app directions screen are available in the
          native app.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!venueCoordinate}
          onPress={handleOpenDirections}
          style={[styles.primaryButton, !venueCoordinate && styles.primaryButtonDisabled]}>
          <Text style={styles.primaryButtonText}>Get Directions</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!venueCoordinate}
          onPress={handleOpenExternalMaps}
          style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Open in Maps</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    padding: ticketSpacing.lg,
  },
  eyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: ticketColors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
  },
  address: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  body: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  placeholderMap: {
    alignItems: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    justifyContent: 'center',
    minHeight: 220,
    paddingHorizontal: ticketSpacing.lg,
  },
  placeholderTitle: {
    color: ticketColors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  placeholderBody: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: ticketSpacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.primary,
    borderRadius: ticketRadii.md,
    flex: 1.2,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: ticketSpacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: ticketSpacing.md,
  },
  secondaryButtonText: {
    color: ticketColors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
});
