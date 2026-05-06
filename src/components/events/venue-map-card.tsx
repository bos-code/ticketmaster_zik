import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import VenueMap from "@/components/VenueMap";
import {
  openExternalMaps,
  toCoordinate,
  type VenueMapData,
} from "@/lib/map-utils";

export function VenueMapCard({
  eventId,
  latitude,
  longitude,
  venueName,
}: VenueMapData) {
  const router = useRouter();
  const venueCoordinate = toCoordinate(latitude, longitude);

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

  if (!venueCoordinate) return null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handleOpenDirections}
      style={styles.card}
    >
      <View style={styles.mapContainer} pointerEvents="none">
        <VenueMap
          latitude={latitude}
          longitude={longitude}
          venueName={venueName}
        />
      </View>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Get Directions</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  mapContainer: {
    height: 220,
    width: "100%",
  },
  button: {
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
});
