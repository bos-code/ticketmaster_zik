import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { getTicketFlowHorizontalGutter } from "@/components/tickets/ticketFlowConstants";
import { useTicketFlowData } from "@/components/tickets/useTicketFlowData";
import { VenueMapCard } from "@/components/events/venue-map-card";

export const MapPreviewCard = React.memo(function MapPreviewCard() {
  const { event } = useTicketFlowData();
  const { width } = useWindowDimensions();
  const horizontalGutter = getTicketFlowHorizontalGutter(width);

  return (
    <Animated.View
      entering={FadeInUp.duration(240)}
      style={[styles.card, { marginHorizontal: horizontalGutter }]}
    >
      <VenueMapCard
        eventId={event.directionsEventId}
        latitude={event.latitude}
        longitude={event.longitude}
        mapHeight={240}
        venueAddress={event.venueAddress}
        venueName={event.venue}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    marginTop: 12,
    overflow: "hidden",
  },
});
