import {
  estimateDurationSeconds,
  formatDistance,
  formatDuration,
  getDistanceMeters,
  type MapCoordinate,
} from '@/lib/map-utils';

type RoutePreview = {
  coordinates: MapCoordinate[];
  distanceMeters: number;
  distanceLabel: string;
  durationSeconds: number;
  durationLabel: string;
  steps: string[];
  source: 'google' | 'fallback';
  notice?: string;
};

type GetRoutePreviewOptions = {
  origin: MapCoordinate;
  destination: MapCoordinate;
};

const GOOGLE_DIRECTIONS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_DIRECTIONS_API_KEY;

export async function getRoutePreview({
  origin,
  destination,
}: GetRoutePreviewOptions): Promise<RoutePreview> {
  if (!GOOGLE_DIRECTIONS_KEY) {
    return buildFallbackRoute(origin, destination, 'Open in Maps for turn-by-turn navigation.');
  }

  try {
    const url =
      'https://maps.googleapis.com/maps/api/directions/json?' +
      `origin=${origin.latitude},${origin.longitude}` +
      `&destination=${destination.latitude},${destination.longitude}` +
      '&mode=driving' +
      `&key=${GOOGLE_DIRECTIONS_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Directions request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as GoogleDirectionsResponse;
    const route = payload.routes?.[0];
    const leg = route?.legs?.[0];

    if (!route || !leg || !route.overview_polyline?.points) {
      throw new Error('No directions data returned.');
    }

    return {
      coordinates: decodePolyline(route.overview_polyline.points),
      distanceMeters: leg.distance?.value ?? getDistanceMeters(origin, destination),
      distanceLabel:
        leg.distance?.text ?? formatDistance(leg.distance?.value ?? getDistanceMeters(origin, destination)),
      durationSeconds: leg.duration?.value ?? estimateDurationSeconds(getDistanceMeters(origin, destination)),
      durationLabel:
        leg.duration?.text ??
        formatDuration(leg.duration?.value ?? estimateDurationSeconds(getDistanceMeters(origin, destination))),
      steps: (leg.steps ?? [])
        .map((step) => stripHtml(step.html_instructions ?? ''))
        .filter(Boolean)
        .slice(0, 4),
      source: 'google',
    };
  } catch {
    return buildFallbackRoute(
      origin,
      destination,
      'Live routing unavailable right now. Showing an approximate path instead.',
    );
  }
}

function buildFallbackRoute(
  origin: MapCoordinate,
  destination: MapCoordinate,
  notice?: string,
): RoutePreview {
  const distanceMeters = getDistanceMeters(origin, destination);
  const durationSeconds = estimateDurationSeconds(distanceMeters);

  return {
    coordinates: [origin, destination],
    distanceMeters,
    distanceLabel: formatDistance(distanceMeters),
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
    steps: [],
    source: 'fallback',
    notice,
  };
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodePolyline(encoded: string): MapCoordinate[] {
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const coordinates: MapCoordinate[] = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const latitudeDelta = result & 1 ? ~(result >> 1) : result >> 1;
    latitude += latitudeDelta;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const longitudeDelta = result & 1 ? ~(result >> 1) : result >> 1;
    longitude += longitudeDelta;

    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return coordinates;
}

type GoogleDirectionsResponse = {
  routes?: {
    overview_polyline?: {
      points?: string;
    };
    legs?: {
      distance?: {
        text?: string;
        value?: number;
      };
      duration?: {
        text?: string;
        value?: number;
      };
      steps?: {
        html_instructions?: string;
      }[];
    }[];
  }[];
};
