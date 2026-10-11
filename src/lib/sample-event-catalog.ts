import type { DiscoveryCategory, EventRecord } from './data';
import { homeArtwork } from './home-artwork';
import { homeArtworkImages } from '@/constants/home-artwork-images';

// Local assignment catalog. Never seeded into Firebase or offered as real inventory.
const photos = {
  concert: 'photo-1501386761578-eac5c94b800a',
  guitar: 'photo-1493225457124-a3eb161ffa5f',
  stage: 'photo-1514525253161-7a46d19cd819',
  sports: 'photo-1546519638-68e109498ffc',
  theatre: 'photo-1503095396549-807759245b35',
  family: 'photo-1470229722913-7c0e2dbbafd3',
  festival: 'photo-1459749411175-04bf5292ceea',
};
type Sample = {
  id: string; artist: string; category: DiscoveryCategory; genre: string;
  day: string; venue: string; city?: string; photo: keyof typeof photos;
  announced?: boolean; sponsor?: boolean; promoted?: string; presale?: boolean;
};
const samples: Sample[] = [
  { id: 'weezer', artist: 'Weezer', category: 'concerts', genre: 'Rock', day: '2026-10-24', venue: 'Crypto.com Arena', photo: 'guitar' },
  { id: 'marilyn-manson', artist: 'Marilyn Manson', category: 'concerts', genre: 'Rock', day: '2026-10-31', venue: 'Hollywood Palladium', photo: 'stage' },
  { id: 'john-mayer', artist: 'John Mayer', category: 'concerts', genre: 'Rock', day: '2026-10-17', venue: 'Hollywood Bowl', photo: 'guitar', promoted: 'Be There Live' },
  { id: 'dancing-stars', artist: 'Dancing with the Stars', category: 'arts', genre: 'Dance', day: '2026-10-18', venue: 'Dolby Theatre', photo: 'theatre', promoted: 'A night of dance' },
  { id: 'olivia-rodrigo', artist: 'Olivia Rodrigo', category: 'concerts', genre: 'Pop', day: '2026-10-23', venue: 'Kia Forum', photo: 'concert' },
  { id: 'lukas-nelson', artist: 'Lukas Nelson', category: 'concerts', genre: 'Country', day: '2026-10-15', venue: 'The Bellwether', photo: 'guitar' },
  { id: 'domi-jd-beck', artist: 'DOMi & JD Beck', category: 'concerts', genre: 'Jazz', day: '2026-10-11', venue: 'The Bellwether', photo: 'stage' },
  { id: 'royston-club', artist: 'The Royston Club', category: 'concerts', genre: 'Indie', day: '2026-10-16', venue: 'The Moroccan Lounge', photo: 'guitar' },
  { id: 'seun-kuti', artist: 'Seun Kuti & Egypt 80', category: 'concerts', genre: 'Afrobeat', day: '2026-10-17', venue: 'The Regent Theater', photo: 'stage' },
  { id: 'scam-jam', artist: 'Scam and Jam', category: 'festivals', genre: 'Dance', day: '2026-11-07', venue: 'The Echo', photo: 'festival', announced: true, presale: true },
  { id: 'tesseract', artist: 'TesseracT', category: 'concerts', genre: 'Metal', day: '2027-01-23', venue: 'The Wiltern', photo: 'stage', sponsor: true, announced: true },
  { id: 'sahn', artist: 'Sahn', category: 'concerts', genre: 'Alternative', day: '2026-11-18', venue: 'The Fonda Theatre', photo: 'concert', sponsor: true },
  { id: 'sombr', artist: 'Sombr', category: 'concerts', genre: 'Alternative', day: '2026-11-14', venue: 'The Fonda Theatre', photo: 'guitar', announced: true },
  { id: 'john-summit', artist: 'John Summit', category: 'concerts', genre: 'Electronic', day: '2026-11-21', venue: 'BMO Stadium', photo: 'concert' },
  { id: 'chargers', artist: 'Los Angeles Chargers', category: 'sports', genre: 'Football', day: '2026-10-18', venue: 'SoFi Stadium', photo: 'sports' },
  { id: 'bull-riders', artist: 'Professional Bull Riders', category: 'sports', genre: 'Rodeo', day: '2026-11-07', venue: 'Crypto.com Arena', photo: 'sports' },
  { id: 'wwe', artist: 'WWE', category: 'sports', genre: 'Wrestling', day: '2026-11-15', venue: 'Ball Arena', city: 'Denver, CO', photo: 'sports', promoted: 'Wrestling' },
  { id: 'jo-koy', artist: 'Jo Koy', category: 'arts', genre: 'Comedy', day: '2026-10-17', venue: 'Peacock Theater', photo: 'theatre' },
  { id: 'john-mulaney', artist: 'John Mulaney', category: 'arts', genre: 'Comedy', day: '2026-11-14', venue: 'Chicago Theatre', city: 'Chicago, IL', photo: 'theatre' },
  { id: 'bluey', artist: "Bluey's Big Play", category: 'family', genre: 'Family Theatre', day: '2026-10-18', venue: 'Fox Theatre', city: 'Atlanta, GA', photo: 'family', announced: true },
  { id: 'disney-ice', artist: 'Disney on Ice', category: 'family', genre: 'Ice Show', day: '2026-11-14', venue: 'State Farm Arena', city: 'Atlanta, GA', photo: 'family' },
  { id: 'penn-teller', artist: 'Penn & Teller', category: 'family', genre: 'Magic', day: '2026-11-21', venue: 'Chicago Theatre', city: 'Chicago, IL', photo: 'theatre' },
  { id: 'niteharts', artist: 'Niteharts Festival', category: 'festivals', genre: 'Music Festival', day: '2026-11-14', venue: 'Grand Park', photo: 'festival', announced: true },
  { id: 'mission-bayfest', artist: 'Mission Bayfest', category: 'festivals', genre: 'Music Festival', day: '2026-11-21', venue: 'Mission Bay Park', city: 'San Diego, CA', photo: 'festival' },
  { id: 'escape', artist: 'Escape Halloween', category: 'festivals', genre: 'Electronic', day: '2026-10-30', venue: 'National Orange Show', city: 'San Bernardino, CA', photo: 'festival' },
  { id: 'my-chemical-romance', artist: 'My Chemical Romance', category: 'concerts', genre: 'Rock', day: '2026-11-21', venue: 'Empower Field', city: 'Denver, CO', photo: 'stage', promoted: 'Be There Live' },
];

export const sampleEventCatalog: EventRecord[] = samples.map((item, index) => ({
  id: `sample-${item.id}`, title: item.artist, shortTitle: item.artist,
  startsAt: `${item.day}T20:00:00`, date: `${item.day} · 8:00 PM`,
  city: item.city ?? 'Los Angeles, CA', venue: item.venue,
  venueAddress: `${item.venue}, ${item.city ?? 'Los Angeles, CA'}`,
  venueSummary: 'Sample listing; dates and venues demonstrate the browsing experience.',
  imageUrl: homeArtwork[item.id] ?? `https://images.unsplash.com/${photos[item.photo]}?auto=format&fit=crop&w=900&q=80`,
  priceFrom: 0, latitude: null, longitude: null, discoverable: true, sample: true,
  description: 'This is a sample event for the assignment. The date, venue and presale information are illustrative; no tickets are on sale for this listing.',
  highlights: [], reservationNote: 'No real ticket inventory.', seatOptions: [], seatSections: [],
  discovery: {
    artist: item.artist, category: item.category, genre: item.genre, image: homeArtworkImages[item.id],
    ...(item.announced ? { announcedAt: `2026-10-${String(10 - index % 3).padStart(2, '0')}T10:00:00` } : {}),
    ...(item.promoted ? { promoted: true, promotionText: item.promoted } : {}),
    ...(item.sponsor || item.presale ? { presale: { opensAt: '2026-10-15T10:00:00', ...(item.sponsor ? { sponsor: 'Partner presale' } : {}) } } : {}),
  },
}));

export function withSampleCatalog(events: EventRecord[]) {
  const existingIds = new Set(events.map((event) => event.id));
  return [...events, ...sampleEventCatalog.filter((event) => !existingIds.has(event.id))];
}
