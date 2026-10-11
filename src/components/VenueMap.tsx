import React from "react";

import { AppleMapsWebView } from "@/components/events/apple-maps-webview";

type VenueMapProps = {
  appearance?: 'light' | 'dark';
  preview?: boolean;
  latitude: number;
  longitude: number;
  shouldResolveInitialAddress?: boolean;
  venueAddress?: string;
  venueName: string;
};

export default function VenueMap({
  appearance,
  preview,
  latitude,
  longitude,
  shouldResolveInitialAddress,
  venueAddress,
  venueName,
}: VenueMapProps) {
  return (
    <AppleMapsWebView
      appearance={appearance}
      preview={preview}
      latitude={latitude}
      longitude={longitude}
      shouldResolveInitialAddress={shouldResolveInitialAddress}
      venueAddress={venueAddress}
      venueName={venueName}
    />
  );
}
