import type { DiscoveryCategory } from '@/lib/data';
import { homeArtworkImages } from '@/constants/home-artwork-images';
import type { DiscoveryEvent } from './discovery-data';

export const homeCategories: { id: DiscoveryCategory; title: string }[] = [
  { id: 'concerts', title: 'Concerts' }, { id: 'sports', title: 'Sports' },
  { id: 'arts', title: 'Arts, Theatre & Comedy' }, { id: 'family', title: 'Family' },
  { id: 'festivals', title: 'Festivals' },
];
export type HomeSection = 'explore' | 'last-minute' | 'weekend' | 'announced' | 'presales' | 'promoted' | DiscoveryCategory;
export const sectionTitles: Record<HomeSection, string> = {
  explore: 'Explore Events', 'last-minute': 'Last Minute', weekend: 'Popular This Weekend',
  announced: 'Just Announced', presales: 'Sponsored Presales', promoted: 'Promoted In The United States',
  concerts: 'Concerts', sports: 'Sports', arts: 'Arts, Theatre & Comedy', family: 'Family', festivals: 'Festivals',
};

export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function localDate(date: string) {
  return new Date(`${date}T12:00:00`);
}
export function getHomeSections(events: DiscoveryEvent[], now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(today); end.setDate(end.getDate() + 14);
  // Friday through Sunday, including the remaining days of the current weekend.
  const friday = new Date(today); friday.setDate(friday.getDate() + (5 - today.getDay() + 7) % 7);
  if (today.getDay() === 6) friday.setDate(friday.getDate() - 7);
  if (today.getDay() === 0) friday.setDate(friday.getDate() - 7);
  const monday = new Date(friday); monday.setDate(monday.getDate() + 3);
  const upcoming = events.filter((event) => localDate(event.date) >= today);
  const recentAnnouncement = new Date(now); recentAnnouncement.setDate(recentAnnouncement.getDate() - 30);
  const byDate = (left: DiscoveryEvent, right: DiscoveryEvent) => left.date.localeCompare(right.date);
  return {
    explore: events,
    'last-minute': upcoming.filter((event) => localDate(event.date) < end).sort(byDate),
    weekend: upcoming.filter((event) => localDate(event.date) >= friday && localDate(event.date) < monday).sort(byDate),
    announced: upcoming.filter((event) => event.announcedAt && new Date(event.announcedAt) <= now && new Date(event.announcedAt) >= recentAnnouncement)
      .sort((left, right) => (right.announcedAt ?? '').localeCompare(left.announcedAt ?? '')),
    presales: upcoming.filter((event) => event.presale?.sponsor),
    promoted: upcoming.filter((event) => event.promoted),
    concerts: upcoming.filter((event) => event.category === 'concerts'),
    sports: upcoming.filter((event) => event.category === 'sports'),
    arts: upcoming.filter((event) => event.category === 'arts'),
    family: upcoming.filter((event) => event.category === 'family'),
    festivals: upcoming.filter((event) => event.category === 'festivals'),
  } satisfies Record<HomeSection, DiscoveryEvent[]>;
}

export function groupArtists(events: DiscoveryEvent[]) {
  const groups = new Map<string, { artist: string; event: DiscoveryEvent; events: DiscoveryEvent[] }>();
  for (const event of events) {
    const key = event.artist.trim().toLowerCase();
    const group = groups.get(key);
    if (group) group.events.push(event);
    else groups.set(key, { artist: event.artist, event, events: [event] });
  }
  return [...groups.values()];
}

const cityPhotos: Record<string, string> = {
  Atlanta: 'city-atlanta', Chicago: 'city-chicago', Denver: 'city-denver',
  'Los Angeles': 'city-los-angeles', 'New York': 'city-new-york',
};
export function groupCities(events: DiscoveryEvent[]) {
  const cities = new Map<string, { city: string; image: DiscoveryEvent['image']; events: DiscoveryEvent[] }>();
  for (const event of events) {
    const group = cities.get(event.city);
    if (group) group.events.push(event);
    else {
      const photo = cityPhotos[event.city.split(',')[0].trim()];
      cities.set(event.city, { city: event.city, image: photo ? homeArtworkImages[photo] ?? event.image : event.image, events: [event] });
    }
  }
  return [...cities.values()].sort((left, right) => left.city.localeCompare(right.city));
}

export type PromptScrollState = { offset: number; travel: number; direction: -1 | 0 | 1; visible: boolean };
export const initialPromptScrollState: PromptScrollState = { offset: 0, travel: 0, direction: 0, visible: true };
export function updatePromptScroll(state: PromptScrollState, offset: number, maxOffset: number): PromptScrollState {
  // Clamp overscroll so bouncing at either edge cannot reverse the direction.
  const nextOffset = Math.max(0, Math.min(offset, Math.max(0, maxOffset)));
  const delta = nextOffset - state.offset;
  if (nextOffset <= 12) return { offset: nextOffset, travel: 0, direction: 0, visible: true };
  if (Math.abs(delta) < 1) return { ...state, offset: nextOffset };
  const direction = delta > 0 ? 1 : -1;
  const travel = direction === state.direction ? state.travel + Math.abs(delta) : Math.abs(delta);
  return { offset: nextOffset, direction, travel: Math.min(travel, 18), visible: travel >= 18 ? direction === -1 : state.visible };
}
