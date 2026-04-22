import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import {
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from '@/lib/map-utils';

export function VenueMapCard({
  latitude,
  longitude,
  venueAddress,
  venueName,
  venueSummary,
}: VenueMapData) {
  const venueCoordinate = toCoordinate(latitude, longitude);

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
          'Open your preferred maps app for turn-by-turn directions on web.'}
      </Text>

      <View style={styles.placeholderMap}>
        <Ionicons color={ticketColors.textSubtle} name="map-outline" size={30} />
        <Text style={styles.placeholderTitle}>Interactive map preview is mobile-only.</Text>
        <Text style={styles.placeholderBody}>
          The full venue map, live location, and route preview are available in the native app.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!venueCoordinate}
        onPress={handleOpenExternalMaps}
        style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Open in Maps</Text>
      </Pressable>
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
    minHeight: 220,
    justifyContent: 'center',
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
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
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
