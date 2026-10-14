import { Text } from '@/components/ui/app-text';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import VenueMap from '@/components/VenueMap';
import {
  buildStaticMapPreviewUrl,
  canRenderEmbeddedMap,
  openExternalMaps,
  type VenueMapData,
} from '@/lib/map-utils';

import { useVenueCoordinate } from '@/hooks/use-venue-coordinate';
import { VenueMapPlaceholder } from '@/components/events/venue-map-placeholder';

export function VenueMapCard({
  appearance = 'light',
  eventId,
  latitude,
  longitude,
  mapHeight = 560,
  venueAddress,
  venueName,
}: VenueMapData & { mapHeight?: number; appearance?: 'light' | 'dark' }) {
  const router = useRouter();
  const dark = appearance === 'dark';
  const { coordinate: venueCoordinate, isLoading, retry } = useVenueCoordinate({ latitude, longitude, venueName, venueAddress });
  const canShowEmbeddedMap = canRenderEmbeddedMap();
  const staticMapUrl = venueCoordinate ? buildStaticMapPreviewUrl(
    venueCoordinate.longitude,
    venueCoordinate.latitude,
  ) : null;

  function handleOpenDirections() {
    if (dark) {
      if (venueCoordinate) {
        void openExternalMaps({ destination: venueCoordinate, destinationLabel: venueName, origin: null });
      } else {
        void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([venueName, venueAddress].filter(Boolean).join(', '))}`);
      }
      return;
    }
    if (eventId) {
      router.push({
        pathname: '/event-directions/[id]',
        params: { id: eventId },
      });
      return;
    }

    if (venueCoordinate) {
      void openExternalMaps({
        destination: venueCoordinate,
        destinationLabel: venueName,
        origin: null,
      });
    } else {
      void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([venueName, venueAddress].filter(Boolean).join(', '))}`);
    }
  }

  return (
    <View style={[styles.card, dark && { backgroundColor: '#242424' }]}>
      <View style={[styles.mapContainer, { height: mapHeight }, dark && { backgroundColor: '#25363C' }]}>
        {!venueCoordinate ? (
          <VenueMapPlaceholder dark={dark} isLoading={isLoading} onRetry={retry} venueAddress={venueAddress || venueName} />
        ) : canShowEmbeddedMap ? (
          <VenueMap
            appearance={appearance}
            preview={dark}
            latitude={venueCoordinate.latitude}
            longitude={venueCoordinate.longitude}
            venueAddress={venueAddress}
            venueName={venueName}
          />
        ) : staticMapUrl ? (
          <Image
            contentFit='cover'
            source={{ uri: staticMapUrl }}
            style={styles.staticMap}
          />
        ) : null}
      </View>
      <Pressable
        accessibilityRole='button'
        onPress={handleOpenDirections}
        style={[styles.button, dark && { backgroundColor: '#242424', minHeight: 48 }]}
      >
        <Text style={[styles.buttonText, dark && { color: '#FFFFFF' }]}>Get Directions</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  mapContainer: {
    width: '100%',
  },
  staticMap: {
    height: '100%',
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#F2F1F5',
    justifyContent: 'center',
    minHeight: 35,
    paddingVertical: 0,
  },
  buttonText: {
    color: '#272529',
    fontSize: 17,
    fontWeight: '700',
  },
});
