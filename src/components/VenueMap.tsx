import React from "react";

import { AppleMapsWebView } from "@/components/events/apple-maps-webview";

type VenueMapProps = {
  latitude: number;
  longitude: number;
  shouldResolveInitialAddress?: boolean;
  venueAddress?: string;
  venueName: string;
};

export default function VenueMap({
  latitude,
  longitude,
  shouldResolveInitialAddress,
  venueAddress,
  venueName,
}: VenueMapProps) {
  return (
    <AppleMapsWebView
      latitude={latitude}
      longitude={longitude}
      shouldResolveInitialAddress={shouldResolveInitialAddress}
      venueAddress={venueAddress}
      venueName={venueName}
    />
  );
}
