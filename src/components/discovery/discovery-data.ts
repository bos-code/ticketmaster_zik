import type { DiscoveryCategory, EventRecord } from '@/lib/data';

export type DiscoveryEvent = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image: string | number;
  source: 'app';
  category?: DiscoveryCategory;
  announcedAt?: string;
  promoted?: boolean;
  promotionText?: string;
  presale?: { opensAt: string; sponsor?: string };
  sample?: boolean;
};
export const discoveryImage = (image: DiscoveryEvent['image']) => typeof image === 'string' ? { uri: image } : image;

export function toDiscoveryEvent(event: EventRecord): DiscoveryEvent {
  const timeMatch = event.startsAt.match(/T(\d{2}):(\d{2})/);
  const hour = timeMatch ? Number(timeMatch[1]) : null;
  const time = event.adminDetails?.time || (hour !== null && timeMatch
    ? `${hour % 12 || 12}:${timeMatch[2]} ${hour >= 12 ? 'PM' : 'AM'}` : 'Time TBA');
  return { id: event.id, title: event.title, artist: event.discovery?.artist ?? event.shortTitle ?? event.title,
    genre: event.discovery?.genre ?? 'Event', ...event.discovery, sample: event.sample,
    date: event.startsAt.slice(0, 10), time, venue: event.venue, city: event.city, image: event.discovery?.image ?? event.imageUrl, source: 'app' };
}

export function eventDateParts(date: string) {
  const value = new Date(`${date}T12:00:00`);
  if (Number.isNaN(value.getTime())) return { month: 'TBA', day: '—', weekday: '' };
  return { month: value.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(value.getDate()), weekday: value.toLocaleDateString('en-US', { weekday: 'long' }) };
}
