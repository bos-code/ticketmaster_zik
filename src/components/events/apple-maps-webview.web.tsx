import React from "react";

import VenueMap from "@/components/VenueMap";

type ConfirmedPlace = {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
};

type AppleMapsWebViewProps = {
  latitude: number;
  longitude: number;
  shouldResolveInitialAddress?: boolean;
  venueName: string;
  venueAddress?: string;
  onConfirmPlace?: (place: ConfirmedPlace) => void;
};

export function AppleMapsWebView({
  latitude,
  longitude,
  shouldResolveInitialAddress,
  venueAddress,
  venueName,
}: AppleMapsWebViewProps) {
  return (
    <VenueMap
      latitude={latitude}
      longitude={longitude}
      shouldResolveInitialAddress={shouldResolveInitialAddress}
      venueAddress={venueAddress}
      venueName={venueName}
    />
  );
}
