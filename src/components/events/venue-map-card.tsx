import { useRouter } from "expo-router";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import VenueMap from "@/components/VenueMap";
import {
  buildStaticMapPreviewUrl,
  canRenderEmbeddedMap,
  hasValidCoordinates,
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from "@/lib/map-utils";

const FALLBACK_MAP_CENTER = {
  latitude: 6.42674716,
  longitude: 3.43009885,
};

export function VenueMapCard({
  eventId,
  latitude,
  longitude,
  mapHeight = 560,
  venueAddress,
  venueName,
}: VenueMapData & { mapHeight?: number }) {
  const router = useRouter();
  const venueCoordinate = toCoordinate(latitude, longitude);
  const canShowEmbeddedMap = canRenderEmbeddedMap();
  const initialCoordinate = venueCoordinate ?? FALLBACK_MAP_CENTER;
  const shouldResolveInitialAddress = !hasValidCoordinates(latitude, longitude);
  const staticMapUrl = buildStaticMapPreviewUrl(
    initialCoordinate.longitude,
    initialCoordinate.latitude,
  );

  function handleOpenDirections() {
    if (eventId) {
      router.push({
        pathname: "/event-directions/[id]",
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
    <View style={styles.card}>
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        {canShowEmbeddedMap ? (
          <VenueMap
            latitude={initialCoordinate.latitude}
            longitude={initialCoordinate.longitude}
            shouldResolveInitialAddress={shouldResolveInitialAddress}
            venueAddress={venueAddress}
            venueName={venueName}
          />
        ) : staticMapUrl ? (
          <Image
            contentFit="cover"
            source={{ uri: staticMapUrl }}
            style={styles.staticMap}
          />
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={handleOpenDirections}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Get Directions</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  mapContainer: {
    width: "100%",
  },
  staticMap: {
    height: "100%",
    width: "100%",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#F2F1F5",
    justifyContent: "center",
    minHeight: 66,
    paddingVertical: 0,
  },
  buttonText: {
    color: "#272529",
    fontSize: 17,
    fontWeight: "700",
  },
});
