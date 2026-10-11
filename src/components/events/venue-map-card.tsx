import { Text } from '@/components/ui/app-text';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import VenueMap from '@/components/VenueMap';
import {
  buildStaticMapPreviewUrl,
  canRenderEmbeddedMap,
  hasValidCoordinates,
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from '@/lib/map-utils';

const FALLBACK_MAP_CENTER = {
  latitude: 6.42674716,
  longitude: 3.43009885,
};

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
  const venueCoordinate = toCoordinate(latitude, longitude);
  const canShowEmbeddedMap = canRenderEmbeddedMap();
  const initialCoordinate = venueCoordinate ?? FALLBACK_MAP_CENTER;
  const shouldResolveInitialAddress = !hasValidCoordinates(latitude, longitude);
  const staticMapUrl = buildStaticMapPreviewUrl(
    initialCoordinate.longitude,
    initialCoordinate.latitude,
  );

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
    }
  }

  return (
    <View style={[styles.card, dark && { backgroundColor: '#242424' }]}>
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        {dark && !venueCoordinate ? (
          <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#25363C' }}><Text style={{ color: '#FFFFFF', fontSize: 23, fontWeight: '700' }}>{venueName}</Text><Text style={{ color: '#CCCCCC', marginTop: 12 }}>{venueAddress || venueName}</Text><Text style={{ color: '#CCCCCC', marginTop: 8 }}>Open directions to locate this venue.</Text></View>
        ) : canShowEmbeddedMap ? (
          <VenueMap
            appearance={appearance}
            preview={dark}
            latitude={initialCoordinate.latitude}
            longitude={initialCoordinate.longitude}
            shouldResolveInitialAddress={shouldResolveInitialAddress}
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
