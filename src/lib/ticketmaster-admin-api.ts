import { firebaseAuth } from '@/lib/firebase';
import type { TicketmasterSearchResponse } from '@/types/ticketmaster';

export async function searchTicketmasterAdmin(mode: 'events' | 'venues', query: string, signal?: AbortSignal) {
  const publicApiKey = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY?.trim();
  const endpoint = process.env.EXPO_PUBLIC_TICKETMASTER_LOOKUP_URL?.trim();

  if (publicApiKey) {
    return searchTicketmasterDirect(mode, query, publicApiKey, signal);
  }

  const user = firebaseAuth.currentUser;
  if (!endpoint) throw new Error('Ticketmaster lookup is not configured.');
  if (!user) throw new Error('Sign in with an approved admin account to use lookup.');
  const token = await user.getIdToken();
  const url = new URL(endpoint);
  url.searchParams.set('mode', mode);
  url.searchParams.set('q', query.trim());
  const response = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` }, signal });
  const payload = (await response.json()) as TicketmasterSearchResponse & { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Ticketmaster lookup failed.');
  return payload;
}

async function searchTicketmasterDirect(
  mode: 'events' | 'venues',
  query: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<TicketmasterSearchResponse> {
  const resource = mode === 'venues' ? 'venues' : 'events';
  const url = new URL(`https://app.ticketmaster.com/discovery/v2/${resource}.json`);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('keyword', query.trim().slice(0, 100));
  url.searchParams.set('size', '20');
  if (mode === 'events') url.searchParams.set('sort', 'date,asc');

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) throw new Error(`Ticketmaster lookup failed (${response.status}).`);
  const data = await response.json() as TicketmasterPayload;

  return {
    events: (data._embedded?.events ?? []).map(normalizeEvent),
    venues: (data._embedded?.venues ?? []).map(normalizeVenue),
  };
}

type RawVenue = Record<string, any>;
type RawEvent = Record<string, any>;
type TicketmasterPayload = { _embedded?: { events?: RawEvent[]; venues?: RawVenue[] } };

function normalizeVenue(value: RawVenue) {
  return {
    id: value.id ?? '', name: value.name ?? '', address: value.address?.line1 ?? '',
    city: value.city?.name ?? '', state: value.state?.stateCode ?? value.state?.name ?? '',
    country: value.country?.countryCode ?? value.country?.name ?? '', postalCode: value.postalCode ?? '',
    latitude: finite(value.location?.latitude), longitude: finite(value.location?.longitude),
  };
}

function normalizeEvent(value: RawEvent) {
  const classification = value.classifications?.[0] ?? {};
  const venue = value._embedded?.venues?.[0];
  const attraction = value._embedded?.attractions?.[0];
  return {
    id: value.id ?? '', name: value.name ?? '', artistName: attraction?.name ?? value.name ?? '',
    date: value.dates?.start?.localDate ?? '', time: value.dates?.start?.localTime ?? '',
    status: value.dates?.status?.code ?? '', url: value.url ?? '', imageUrl: bestImage(value.images ?? []),
    description: value.info ?? value.pleaseNote ?? '', category: classification.segment?.name ?? '',
    genre: classification.genre?.name ?? '', subgenre: classification.subGenre?.name ?? '',
    salesStart: value.sales?.public?.startDateTime ?? '', salesEnd: value.sales?.public?.endDateTime ?? '',
    venue: venue ? normalizeVenue(venue) : null,
  };
}

function bestImage(images: RawEvent[]) {
  return [...images].filter((image) => image.url).sort((a, b) => imageScore(b) - imageScore(a))[0]?.url ?? '';
}
function imageScore(image: RawEvent) {
  const width = Number(image.width) || 0;
  const height = Number(image.height) || 1;
  return width * height - Math.abs(width / height - 16 / 9) * 100000;
}
function finite(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
