import React from 'react';
import { Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const DELTA = 0.025;

export default function VenueMap({ latitude, longitude, venueName }) {
  return (
    <MapView
      style={{ flex: 1 }}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: DELTA,
        longitudeDelta: DELTA,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      <Marker
        coordinate={{ latitude, longitude }}
        title={venueName}
        pinColor="red"
      />
    </MapView>
  );
}
