import { Platform } from 'react-native';

export type VenueGeocodeInput = {
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  venue?: string;
};

export type VenueGeocodeResult = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
};

type GoogleGeocodeResponse = {
  results?: {
    formatted_address?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
    place_id?: string;
  }[];
  status?: string;
  error_message?: string;
};

const GOOGLE_GEOCODING_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json';

export function buildVenueGeocodeQuery(input: VenueGeocodeInput) {
  return [
    input.address,
    input.venue,
    input.city,
    input.state,
    input.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(', ');
}

export async function geocodeVenueLocation(
  input: VenueGeocodeInput,
): Promise<VenueGeocodeResult> {
  const query = buildVenueGeocodeQuery(input);

  if (!query) {
    throw new Error('Enter a venue or address before finding the location.');
  }

  const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (googleMapsKey) {
    return geocodeWithGoogle(query, googleMapsKey);
  }

  if (Platform.OS !== 'web') {
    return geocodeWithExpoLocation(query);
  }

  throw new Error(
    'Venue lookup on web needs EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.',
  );
}

async function geocodeWithGoogle(
  query: string,
  googleMapsKey: string,
): Promise<VenueGeocodeResult> {
  const params = new URLSearchParams({
    address: query,
    key: googleMapsKey,
  });
  const response = await fetch(`${GOOGLE_GEOCODING_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Google geocoding failed with status ${response.status}.`);
  }

  const body = (await response.json()) as GoogleGeocodeResponse;
  const firstResult = body.results?.[0];
  const latitude = firstResult?.geometry?.location?.lat;
  const longitude = firstResult?.geometry?.location?.lng;

  if (
    !firstResult ||
    body.status !== 'OK' ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    throw new Error(
      body.error_message ||
        getGoogleGeocodingStatusMessage(body.status) ||
        'No matching venue location was found.',
    );
  }

  return {
    formattedAddress: firstResult.formatted_address?.trim() || query,
    latitude,
    longitude,
    placeId: firstResult.place_id,
  };
}

async function geocodeWithExpoLocation(query: string): Promise<VenueGeocodeResult> {
  const Location = await import('expo-location');
  const results = await Location.geocodeAsync(query);
  const firstResult = results[0];

  if (!firstResult) {
    throw new Error('No matching venue location was found.');
  }

  return {
    formattedAddress: query,
    latitude: firstResult.latitude,
    longitude: firstResult.longitude,
  };
}

function getGoogleGeocodingStatusMessage(status?: string) {
  if (status === 'ZERO_RESULTS') {
    return 'No matching venue location was found.';
  }

  if (status === 'REQUEST_DENIED') {
    return 'Google Maps rejected the geocoding request. Check the API key and Geocoding API access.';
  }

  if (status === 'OVER_QUERY_LIMIT') {
    return 'Google Maps geocoding quota has been reached.';
  }

  return undefined;
}
