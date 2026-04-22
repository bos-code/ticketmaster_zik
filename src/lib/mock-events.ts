export type EventSeatSection = {
  id: string;
  label: string;
  name: string;
  priceFrom: number;
  availableCount: number;
  availability: 'open' | 'limited';
  summary: string;
};

export type EventSeatOption = {
  id: string;
  sectionId: string;
  label: string;
  row: string;
  seat: string;
  price: number;
  availability: 'open' | 'limited';
  note: string;
};

export type FeaturedEventRecord = {
  id: string;
  title: string;
  date: string;
  venue: string;
  venueAddress: string;
  venueSummary: string;
  latitude: number;
  longitude: number;
  city: string;
  priceFrom: number;
  imageUrl: string;
  description: string;
  highlights: string[];
  reservationNote: string;
  seatSections: EventSeatSection[];
  seatOptions: EventSeatOption[];
};

export function formatCurrency(value: number) {
  return `$${value}`;
}

export const featuredEvents: FeaturedEventRecord[] = [
  {
    id: 'eras-tour',
    title: 'Taylor Swift | The Eras Tour',
    date: 'Sat, Mar 15, 2026',
    venue: 'MetLife Stadium',
    venueAddress: '1 MetLife Stadium Dr, East Rutherford, NJ 07073',
    venueSummary:
      'Stadium entry is spread across multiple gates, so seeing the venue and route before you leave helps avoid last-minute confusion.',
    latitude: 40.81353,
    longitude: -74.07446,
    city: 'East Rutherford, NJ',
    priceFrom: 89,
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    description:
      'An arena-scale pop night with layered production, flexible seat tiers, and fast-moving inventory.',
    highlights: [
      'Timed venue entry with mobile-first scanning',
      'Floor, lower bowl, and upper bowl reservations',
      'Instant reservation hold while payment remains off for now',
    ],
    reservationNote: 'Your reservation will be held for 15 minutes after confirmation.',
    seatSections: [
      {
        id: 'flr-a',
        label: 'A',
        name: 'Floor A',
        priceFrom: 235,
        availableCount: 8,
        availability: 'limited',
        summary: 'Closest to the main stage with very limited inventory.',
      },
      {
        id: 'lb-102',
        label: '102',
        name: 'Lower Bowl 102',
        priceFrom: 165,
        availableCount: 18,
        availability: 'open',
        summary: 'Balanced view of the full stage with strong sightlines.',
      },
      {
        id: 'lb-104',
        label: '104',
        name: 'Lower Bowl 104',
        priceFrom: 149,
        availableCount: 11,
        availability: 'limited',
        summary: 'Close side angle with quick entry and short concession lines.',
      },
      {
        id: 'ub-210',
        label: '210',
        name: 'Upper Bowl 210',
        priceFrom: 89,
        availableCount: 26,
        availability: 'open',
        summary: 'Budget-friendly seats with a full-stage overhead view.',
      },
    ],
    seatOptions: [
      {
        id: 'eras-a1',
        sectionId: 'flr-a',
        label: 'Floor A - Seat 11',
        row: '2',
        seat: '11',
        price: 235,
        availability: 'limited',
        note: 'Only 2 seats left together',
      },
      {
        id: 'eras-a2',
        sectionId: 'flr-a',
        label: 'Floor A - Seat 12',
        row: '2',
        seat: '12',
        price: 235,
        availability: 'limited',
        note: 'Only 2 seats left together',
      },
      {
        id: 'eras-102-1',
        sectionId: 'lb-102',
        label: 'Sec 102 - Seat 4',
        row: '11',
        seat: '4',
        price: 165,
        availability: 'open',
        note: 'Best value in the lower bowl',
      },
      {
        id: 'eras-102-2',
        sectionId: 'lb-102',
        label: 'Sec 102 - Seat 5',
        row: '11',
        seat: '5',
        price: 165,
        availability: 'open',
        note: 'Best value in the lower bowl',
      },
      {
        id: 'eras-104-1',
        sectionId: 'lb-104',
        label: 'Sec 104 - Seat 18',
        row: '9',
        seat: '18',
        price: 149,
        availability: 'limited',
        note: 'Low inventory remaining',
      },
      {
        id: 'eras-104-2',
        sectionId: 'lb-104',
        label: 'Sec 104 - Seat 19',
        row: '9',
        seat: '19',
        price: 149,
        availability: 'limited',
        note: 'Low inventory remaining',
      },
      {
        id: 'eras-210-1',
        sectionId: 'ub-210',
        label: 'Sec 210 - Seat 7',
        row: '3',
        seat: '7',
        price: 89,
        availability: 'open',
        note: 'Budget-friendly entry point',
      },
      {
        id: 'eras-210-2',
        sectionId: 'ub-210',
        label: 'Sec 210 - Seat 8',
        row: '3',
        seat: '8',
        price: 89,
        availability: 'open',
        note: 'Budget-friendly entry point',
      },
    ],
  },
  {
    id: 'lakers-celtics',
    title: 'Lakers vs. Celtics',
    date: 'Thu, Mar 20, 2026',
    venue: 'Crypto.com Arena',
    venueAddress: '1111 S Figueroa St, Los Angeles, CA 90015',
    venueSummary:
      'Downtown traffic can move quickly around game time, so the in-app map previews the venue and offers a clean handoff to full navigation.',
    latitude: 34.04302,
    longitude: -118.26725,
    city: 'Los Angeles, CA',
    priceFrom: 125,
    imageUrl:
      'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=900&q=80',
    description:
      'A marquee rivalry night with fast section turnover, premium lower-level views, and upper-deck value picks.',
    highlights: [
      'Clearly separated lower, club, and upper inventory',
      'Side-by-side seat reservation for small groups',
      'Fast review flow before final reservation confirmation',
    ],
    reservationNote: 'Reservations are held briefly so friends can coordinate before payment goes live.',
    seatSections: [
      {
        id: 'courtside',
        label: 'CS',
        name: 'Courtside Club',
        priceFrom: 420,
        availableCount: 4,
        availability: 'limited',
        summary: 'Closest possible view with club access and very low inventory.',
      },
      {
        id: 'lower-108',
        label: '108',
        name: 'Lower 108',
        priceFrom: 210,
        availableCount: 13,
        availability: 'limited',
        summary: 'Strong sideline view with quick tunnel access.',
      },
      {
        id: 'club-12',
        label: '12',
        name: 'Club 12',
        priceFrom: 175,
        availableCount: 17,
        availability: 'open',
        summary: 'Midcourt club sightline with lounge access.',
      },
      {
        id: 'upper-315',
        label: '315',
        name: 'Upper 315',
        priceFrom: 125,
        availableCount: 32,
        availability: 'open',
        summary: 'Affordable full-court view for groups.',
      },
    ],
    seatOptions: [
      {
        id: 'lakers-cs-1',
        sectionId: 'courtside',
        label: 'Courtside - Seat 6',
        row: '1',
        seat: '6',
        price: 420,
        availability: 'limited',
        note: 'Only 1 pair remains',
      },
      {
        id: 'lakers-108-1',
        sectionId: 'lower-108',
        label: 'Sec 108 - Seat 14',
        row: '7',
        seat: '14',
        price: 210,
        availability: 'limited',
        note: 'Popular rivalry section',
      },
      {
        id: 'lakers-108-2',
        sectionId: 'lower-108',
        label: 'Sec 108 - Seat 15',
        row: '7',
        seat: '15',
        price: 210,
        availability: 'limited',
        note: 'Popular rivalry section',
      },
      {
        id: 'lakers-club-1',
        sectionId: 'club-12',
        label: 'Club 12 - Seat 9',
        row: '3',
        seat: '9',
        price: 175,
        availability: 'open',
        note: 'Club access included',
      },
      {
        id: 'lakers-club-2',
        sectionId: 'club-12',
        label: 'Club 12 - Seat 10',
        row: '3',
        seat: '10',
        price: 175,
        availability: 'open',
        note: 'Club access included',
      },
      {
        id: 'lakers-315-1',
        sectionId: 'upper-315',
        label: 'Sec 315 - Seat 2',
        row: '5',
        seat: '2',
        price: 125,
        availability: 'open',
        note: 'Great for groups',
      },
    ],
  },
  {
    id: 'hamilton-broadway',
    title: 'Hamilton',
    date: 'Fri, Mar 28, 2026',
    venue: 'Richard Rodgers Theatre',
    venueAddress: '226 W 46th St, New York, NY 10036',
    venueSummary:
      'The theatre sits in a busy Broadway corridor, making a quick venue preview especially useful before showtime.',
    latitude: 40.75901,
    longitude: -73.98652,
    city: 'New York, NY',
    priceFrom: 159,
    imageUrl:
      'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80',
    description:
      'A theatre flow with premium orchestra options, balanced mezzanine seating, and a reservation-first confirmation step.',
    highlights: [
      'Section visibility notes tuned for theatre seating',
      'Cleaner availability language for small ticket blocks',
      'Reservation confirmation without payment friction yet',
    ],
    reservationNote: 'The reservation screen confirms your chosen seats and keeps the current UI style intact.',
    seatSections: [
      {
        id: 'orch-center',
        label: 'OC',
        name: 'Orchestra Center',
        priceFrom: 289,
        availableCount: 6,
        availability: 'limited',
        summary: 'Premium centered view with very tight inventory.',
      },
      {
        id: 'orch-side',
        label: 'OS',
        name: 'Orchestra Side',
        priceFrom: 219,
        availableCount: 10,
        availability: 'limited',
        summary: 'Strong lower-level view with slightly angled staging.',
      },
      {
        id: 'front-mezz',
        label: 'FM',
        name: 'Front Mezzanine',
        priceFrom: 179,
        availableCount: 14,
        availability: 'open',
        summary: 'Wide stage view and easy row access.',
      },
      {
        id: 'rear-mezz',
        label: 'RM',
        name: 'Rear Mezzanine',
        priceFrom: 159,
        availableCount: 20,
        availability: 'open',
        summary: 'Best value for the full production.',
      },
    ],
    seatOptions: [
      {
        id: 'ham-oc-1',
        sectionId: 'orch-center',
        label: 'Orchestra Center - Seat 101',
        row: 'D',
        seat: '101',
        price: 289,
        availability: 'limited',
        note: 'Only a few centered seats left',
      },
      {
        id: 'ham-os-1',
        sectionId: 'orch-side',
        label: 'Orchestra Side - Seat 14',
        row: 'F',
        seat: '14',
        price: 219,
        availability: 'limited',
        note: 'Low inventory remaining',
      },
      {
        id: 'ham-os-2',
        sectionId: 'orch-side',
        label: 'Orchestra Side - Seat 15',
        row: 'F',
        seat: '15',
        price: 219,
        availability: 'limited',
        note: 'Low inventory remaining',
      },
      {
        id: 'ham-fm-1',
        sectionId: 'front-mezz',
        label: 'Front Mezzanine - Seat 6',
        row: 'B',
        seat: '6',
        price: 179,
        availability: 'open',
        note: 'Clear full-stage sightline',
      },
      {
        id: 'ham-rm-1',
        sectionId: 'rear-mezz',
        label: 'Rear Mezzanine - Seat 22',
        row: 'E',
        seat: '22',
        price: 159,
        availability: 'open',
        note: 'Most affordable reservation option',
      },
    ],
  },
];

export function getFeaturedEvent(eventId: string) {
  return featuredEvents.find((event) => event.id === eventId);
}
