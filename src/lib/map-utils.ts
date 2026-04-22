import { Linking, Platform } from 'react-native';

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type VenueMapData = {
  venueName: string;
  venueAddress?: string;
  venueSummary?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function hasValidCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): boolean {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
  );
}

export function toCoordinate(
  latitude?: number | null,
  longitude?: number | null,
): MapCoordinate | null {
  if (!hasValidCoordinates(latitude, longitude)) {
    return null;
  }

  return { latitude: latitude as number, longitude: longitude as number };
}

export function getDistanceMeters(a: MapCoordinate, b: MapCoordinate) {
  const earthRadius = 6371000;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const deltaLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadius * arc;
}

export function formatDistance(distanceMeters: number) {
  const miles = distanceMeters / 1609.34;

  if (miles >= 10) {
    return `${Math.round(miles)} mi`;
  }

  if (miles >= 0.1) {
    return `${miles.toFixed(1)} mi`;
  }

  const feet = distanceMeters * 3.28084;
  return `${Math.round(feet)} ft`;
}

export function estimateDurationSeconds(distanceMeters: number) {
  const averageCityDrivingMetersPerSecond = 12.5;
  return Math.max(240, Math.round(distanceMeters / averageCityDrivingMetersPerSecond));
}

export function formatDuration(seconds: number) {
  const roundedMinutes = Math.max(1, Math.round(seconds / 60));

  if (roundedMinutes >= 60) {
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;

    if (!minutes) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  }

  return `${roundedMinutes} min`;
}

export function getRegionForCoordinates(
  coordinates: MapCoordinate[],
  paddingMultiplier = 1.35,
) {
  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);

  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeDelta = Math.max(0.01, (maxLatitude - minLatitude) * paddingMultiplier);
  const longitudeDelta = Math.max(0.01, (maxLongitude - minLongitude) * paddingMultiplier);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

export function getMapEdgePadding() {
  return {
    top: 72,
    right: 56,
    bottom: 92,
    left: 56,
  };
}

type ExternalMapsOptions = {
  destination: MapCoordinate;
  destinationLabel?: string;
  origin?: MapCoordinate | null;
};

export async function openExternalMaps({
  destination,
  destinationLabel,
  origin,
}: ExternalMapsOptions) {
  const destinationQuery = `${destination.latitude},${destination.longitude}`;
  const encodedLabel = destinationLabel ? encodeURIComponent(destinationLabel) : undefined;
  const iosDestination = encodedLabel
    ? `${destinationQuery} (${encodedLabel})`
    : destinationQuery;
  const originQuery = origin
    ? `${origin.latitude},${origin.longitude}`
    : undefined;
  const primaryUrl =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${encodeURIComponent(iosDestination)}${
          originQuery ? `&saddr=${encodeURIComponent(originQuery)}` : ''
        }&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          destinationQuery,
        )}${originQuery ? `&origin=${encodeURIComponent(originQuery)}` : ''}&travelmode=driving`;
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    destinationQuery,
  )}`;

  try {
    await Linking.openURL(primaryUrl);
  } catch {
    await Linking.openURL(fallbackUrl);
  }
}
