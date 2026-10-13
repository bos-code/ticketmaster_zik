import { toCoordinate, type MapCoordinate } from '@/lib/map-utils';

// Photon accepts modest public use. Cache lookups in useVenueCoordinate and
// allow deployments to supply their own Photon endpoint without code changes.
const GEOCODING_URL = process.env.EXPO_PUBLIC_VENUE_GEOCODING_URL || 'https://photon.komoot.io/api/';

export function getVenueSearchQuery(venueName: string, venueAddress?: string) {
  const name = venueName.trim();
  const address = venueAddress?.trim() ?? '';
  if (!name || address.toLowerCase().includes(name.toLowerCase())) return address;
  return [name, address].filter(Boolean).join(', ');
}

export async function geocodeVenue(query: string, signal?: AbortSignal): Promise<MapCoordinate> {
  if (!query.trim()) throw new Error('No venue address is available.');
  const url = new URL(GEOCODING_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '1');
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) throw new Error('Venue lookup is unavailable.');
    const result = await response.json() as {
      features?: { geometry?: { type?: string; coordinates?: unknown[] } }[];
    };
    const geometry = result.features?.[0]?.geometry;
    const values = geometry?.type === 'Point' ? geometry.coordinates : undefined;
    const coordinate = toCoordinate(
      typeof values?.[1] === 'number' ? values[1] : null,
      typeof values?.[0] === 'number' ? values[0] : null,
    );
    if (!coordinate) throw new Error('The venue could not be located.');
    return coordinate;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
