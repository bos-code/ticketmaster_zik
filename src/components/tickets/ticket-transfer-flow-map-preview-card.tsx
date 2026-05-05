import React from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";
import { VenueMapCard } from "@/components/events/venue-map-card";

export function MapPreviewCard() {
  const { event } = useTicketFlowData();

  if (!event.latitude || !event.longitude) return null;

  return (
    <Animated.View entering={FadeInUp.duration(240)} style={styles.card}>
      <VenueMapCard
        eventId={event.directionsEventId}
        latitude={event.latitude}
        longitude={event.longitude}
        venueName={event.venue}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 22,
    marginBottom: 20,
    marginTop: 18,
    overflow: "hidden",
  },
});
