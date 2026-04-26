import {
  featuredEvents as seededFeaturedEvents,
  formatCurrency,
  type EventSeatOption,
  type EventSeatSection,
  type FeaturedEventRecord,
} from '@/lib/mock-events';

export { formatCurrency };
export type { EventSeatOption, EventSeatSection };

export type AdminEventMetadata = {
  additionalTicketInfo: string;
  barcodeNumber: string;
  entryInfo: string;
  purchaseDate: string;
  seatFrom: number;
  seatTo: number;
  state: string;
  ticketType: string;
  time: string;
};

export type EventRecord = Omit<FeaturedEventRecord, 'latitude' | 'longitude'> & {
  adminDetails?: AdminEventMetadata;
  startsAt: string;
  discoverable?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  shortTitle?: string;
};

export type ReservationSeatRecord = {
  id: string;
  label: string;
  row: string;
  seat: string;
  section: string;
  price: number;
  availability: EventSeatOption['availability'];
  note: string;
};

export type ReservationRecord = {
  id: string;
  eventId: string;
  orderId: string;
  reservationCode: string;
  reservedAt: string;
  seatIds: string[];
  seats: ReservationSeatRecord[];
  reservationTotal: number;
  ticketCount: number;
  source: 'seed' | 'reservation';
};

type DummyEventSeed = {
  id: string;
  title: string;
  shortTitle?: string;
  date: string;
  startsAt: string;
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
  sectionPrefix: string;
  sections: {
    id: string;
    label: string;
    name: string;
    priceFrom: number;
    availableCount: number;
    availability: EventSeatSection['availability'];
    summary: string;
    row: string;
    seats: string[];
    note: string;
  }[];
};

const startsAtByEventId: Record<string, string> = {
  'eras-tour': '2026-03-15T19:30:00-04:00',
  'lakers-celtics': '2026-03-20T19:30:00-07:00',
  'hamilton-broadway': '2026-03-28T20:00:00-04:00',
};

const curatedEvents: EventRecord[] = seededFeaturedEvents.map((event) => ({
  ...event,
  discoverable: true,
  shortTitle: event.title,
  startsAt: startsAtByEventId[event.id] ?? new Date().toISOString(),
}));

const donToliverEvent: EventRecord = {
  id: 'don-toliver-octane-tour',
  title: 'DON TOLIVER: OCTANE TOUR',
  shortTitle: 'Don Toliver Octane Tour',
  date: 'MON, JUN 01, 7:30 PM',
  startsAt: '2026-06-01T19:30:00-04:00',
  venue: 'Madison Square Garden',
  venueAddress: '4 Pennsylvania Plaza, New York, NY 10001',
  venueSummary:
    'The venue sits in a dense Midtown corridor, so the shared venue map and ticket details stay synced for arrival planning.',
  latitude: 40.7505,
  longitude: -73.9934,
  city: 'New York, NY',
  priceFrom: 129,
  imageUrl:
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
  description:
    'A premium arena reservation flow with a shared venue map, fast seat confirmation, and ticket details that stay linked in My Tickets.',
  highlights: [
    'Ticket reservations flow into My Tickets from the same shared event source',
    'Venue map, directions, and seat details stay connected to the same event record',
    'Ticket viewer and transfer states can reuse the reservation snapshot later',
  ],
  reservationNote:
    'Reserved tickets stay connected to the same event record so My Tickets always reflects the latest reservation details.',
  discoverable: false,
  seatSections: [
    {
      id: 'dt-102',
      label: '102',
      name: 'Lower Bowl 102',
      priceFrom: 129,
      availableCount: 3,
      availability: 'limited',
      summary: 'Lower bowl seating close to the main floor with quick aisle access.',
    },
  ],
  seatOptions: [
    {
      id: 'dt-102-2',
      sectionId: 'dt-102',
      label: 'Sec 102 - Seat 2',
      row: '12',
      seat: '2',
      price: 129,
      availability: 'limited',
      note: 'Arist presale',
    },
    {
      id: 'dt-102-3',
      sectionId: 'dt-102',
      label: 'Sec 102 - Seat 3',
      row: '12',
      seat: '3',
      price: 129,
      availability: 'limited',
      note: 'Arist presale',
    },
    {
      id: 'dt-102-4',
      sectionId: 'dt-102',
      label: 'Sec 102 - Seat 4',
      row: '12',
      seat: '4',
      price: 129,
      availability: 'limited',
      note: 'Arist presale',
    },
  ],
};

const pastTicketSeeds: DummyEventSeed[] = [
  {
    id: 'past-harry-styles-love-on-tour',
    title: 'HARRY STYLES: LOVE ON TOUR',
    shortTitle: 'Harry Styles Love On Tour',
    date: 'FRI, MAY 10, 8:00 PM',
    startsAt: '2025-05-10T20:00:00-04:00',
    venue: 'Madison Square Garden',
    venueAddress: '4 Pennsylvania Plaza, New York, NY 10001',
    venueSummary: 'A past Madison Square Garden concert kept in My Events history.',
    latitude: 40.7505,
    longitude: -73.9934,
    city: 'New York, NY',
    priceFrom: 118,
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    description: 'A saved ticket record for a previous arena concert.',
    highlights: ['Past mobile ticket', 'Madison Square Garden', 'Saved event history'],
    sectionPrefix: 'hs-past',
    sections: [
      {
        id: 'lower-102',
        label: '102',
        name: 'Lower Bowl 102',
        priceFrom: 118,
        availableCount: 0,
        availability: 'open',
        summary: 'Past lower bowl ticket record.',
        row: '12',
        seats: ['8', '9'],
        note: 'Past event ticket',
      },
    ],
  },
  {
    id: 'past-weeknd-after-hours',
    title: 'THE WEEKND: AFTER HOURS',
    shortTitle: 'The Weeknd After Hours',
    date: 'SAT, APR 12, 7:30 PM',
    startsAt: '2025-04-12T19:30:00-04:00',
    venue: 'Barclays Center',
    venueAddress: '620 Atlantic Ave, Brooklyn, NY 11217',
    venueSummary: 'A past Barclays Center concert kept in My Events history.',
    latitude: 40.6826,
    longitude: -73.9754,
    city: 'Brooklyn, NY',
    priceFrom: 104,
    imageUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
    description: 'A saved ticket record for a previous arena show.',
    highlights: ['Past mobile ticket', 'Barclays Center', 'Saved event history'],
    sectionPrefix: 'wknd-past',
    sections: [
      {
        id: 'club-17',
        label: '17',
        name: 'Club 17',
        priceFrom: 104,
        availableCount: 0,
        availability: 'open',
        summary: 'Past club level ticket record.',
        row: '7',
        seats: ['3', '4'],
        note: 'Past event ticket',
      },
    ],
  },
];

const extraDiscoverEvents: EventRecord[] = [
  buildDummyEvent({
    id: 'burna-boy-stadium-night',
    title: 'Burna Boy: Stadium Night',
    shortTitle: 'Burna Boy Stadium Night',
    date: 'SAT, MAY 09, 8:00 PM',
    startsAt: '2026-05-09T20:00:00-04:00',
    venue: 'Barclays Center',
    venueAddress: '620 Atlantic Ave, Brooklyn, NY 11217',
    venueSummary:
      'Atlantic Avenue gets busy before arena doors, so the venue preview keeps arrival planning close to the ticket flow.',
    latitude: 40.68265,
    longitude: -73.97544,
    city: 'Brooklyn, NY',
    priceFrom: 96,
    imageUrl:
      'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1200&q=80',
    description:
      'A high-energy arena concert with floor access, lower bowl picks, and quick group-friendly reservations.',
    highlights: [
      'Floor and lower bowl options stay grouped for faster comparison',
      'Venue map stays attached to the same event record',
      'Reservation confirmation feeds directly into My Tickets',
    ],
    sectionPrefix: 'burna',
    sections: [
      {
        id: 'floor-b',
        label: 'FLB',
        name: 'Floor B',
        priceFrom: 184,
        availableCount: 7,
        availability: 'limited',
        summary: 'Standing-floor access close to the main stage.',
        row: 'GA',
        seats: ['21', '22'],
        note: 'Floor access',
      },
      {
        id: 'lower-16',
        label: '16',
        name: 'Lower 16',
        priceFrom: 132,
        availableCount: 16,
        availability: 'open',
        summary: 'Side-stage lower bowl seats with a strong crowd view.',
        row: '9',
        seats: ['8', '9'],
        note: 'Lower bowl pair',
      },
      {
        id: 'upper-207',
        label: '207',
        name: 'Upper 207',
        priceFrom: 96,
        availableCount: 28,
        availability: 'open',
        summary: 'Budget-friendly seats with full arena sightlines.',
        row: '5',
        seats: ['13', '14'],
        note: 'Best entry price',
      },
    ],
  }),
  buildDummyEvent({
    id: 'skyline-food-fest',
    title: 'Skyline Food & Music Fest',
    shortTitle: 'Skyline Food Fest',
    date: 'SUN, MAY 17, 2:00 PM',
    startsAt: '2026-05-17T14:00:00-05:00',
    venue: 'Grant Park',
    venueAddress: '337 E Randolph St, Chicago, IL 60601',
    venueSummary:
      'Festival entrances spread along the park edge, so the map preview helps guests pick a smoother gate.',
    latitude: 41.87579,
    longitude: -87.61894,
    city: 'Chicago, IL',
    priceFrom: 54,
    imageUrl:
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    description:
      'A daytime outdoor festival with tasting passes, lawn access, and premium viewing pockets.',
    highlights: [
      'Outdoor sections make price tiers easy to scan',
      'Low-cost general admission options are discoverable first',
      'Reservation notes adapt to festival-style entry',
    ],
    sectionPrefix: 'sky',
    sections: [
      {
        id: 'vip-garden',
        label: 'VIP',
        name: 'VIP Garden',
        priceFrom: 148,
        availableCount: 5,
        availability: 'limited',
        summary: 'Covered lounge access near the main stage and food vendors.',
        row: 'A',
        seats: ['3', '4'],
        note: 'VIP tasting pass',
      },
      {
        id: 'ga-lawn',
        label: 'GA',
        name: 'General Admission Lawn',
        priceFrom: 54,
        availableCount: 42,
        availability: 'open',
        summary: 'Flexible lawn entry with all-day festival access.',
        row: 'GA',
        seats: ['31', '32', '33'],
        note: 'All-day entry',
      },
      {
        id: 'reserved-green',
        label: 'RG',
        name: 'Reserved Green',
        priceFrom: 88,
        availableCount: 19,
        availability: 'open',
        summary: 'Reserved picnic zone with easier re-entry.',
        row: 'C',
        seats: ['10', '11'],
        note: 'Reserved festival zone',
      },
    ],
  }),
  buildDummyEvent({
    id: 'mets-yankees-subway-series',
    title: 'Mets vs. Yankees: Subway Series',
    shortTitle: 'Subway Series',
    date: 'FRI, MAY 22, 7:10 PM',
    startsAt: '2026-05-22T19:10:00-04:00',
    venue: 'Citi Field',
    venueAddress: '41 Seaver Way, Queens, NY 11368',
    venueSummary:
      'Transit and rideshare areas fill quickly around first pitch, so the map preview keeps the venue context handy.',
    latitude: 40.75709,
    longitude: -73.84582,
    city: 'Queens, NY',
    priceFrom: 72,
    imageUrl:
      'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=1200&q=80',
    description:
      'A rivalry baseball night with field-level seats, club views, and affordable upper-deck options.',
    highlights: [
      'Sports inventory includes field, club, and upper tiers',
      'Seat rows stay visible through review and ticket details',
      'Directions connect back to the same venue data',
    ],
    sectionPrefix: 'subway',
    sections: [
      {
        id: 'field-112',
        label: '112',
        name: 'Field 112',
        priceFrom: 168,
        availableCount: 9,
        availability: 'limited',
        summary: 'Field-level seats near first base.',
        row: '8',
        seats: ['1', '2'],
        note: 'Field-level pair',
      },
      {
        id: 'club-309',
        label: '309',
        name: 'Excelsior Club 309',
        priceFrom: 118,
        availableCount: 14,
        availability: 'open',
        summary: 'Club-level sightline with covered concourse access.',
        row: '4',
        seats: ['7', '8'],
        note: 'Club concourse access',
      },
      {
        id: 'promenade-526',
        label: '526',
        name: 'Promenade 526',
        priceFrom: 72,
        availableCount: 36,
        availability: 'open',
        summary: 'Great value with a full-field view.',
        row: '12',
        seats: ['15', '16', '17'],
        note: 'Great for groups',
      },
    ],
  }),
  buildDummyEvent({
    id: 'apollo-comedy-classic',
    title: 'Apollo Comedy Classic',
    shortTitle: 'Apollo Comedy Classic',
    date: 'SAT, MAY 30, 9:00 PM',
    startsAt: '2026-05-30T21:00:00-04:00',
    venue: 'Apollo Theater',
    venueAddress: '253 W 125th St, New York, NY 10027',
    venueSummary:
      'The theatre entrance is easy to miss in a busy Harlem corridor, so guests can preview the block before heading out.',
    latitude: 40.81004,
    longitude: -73.95005,
    city: 'New York, NY',
    priceFrom: 48,
    imageUrl:
      'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&q=80',
    description:
      'A late comedy showcase with orchestra seats, balcony value, and quick two-seat reservations.',
    highlights: [
      'Small-venue seats make the reservation review feel tighter',
      'Late-night timing is clear on every card',
      'Ticket snapshots carry the same row and seat labels',
    ],
    sectionPrefix: 'apollo',
    sections: [
      {
        id: 'orch-center',
        label: 'OC',
        name: 'Orchestra Center',
        priceFrom: 94,
        availableCount: 6,
        availability: 'limited',
        summary: 'Centered floor view close to the stage.',
        row: 'E',
        seats: ['104', '105'],
        note: 'Close comedy sightline',
      },
      {
        id: 'mezz-left',
        label: 'ML',
        name: 'Mezzanine Left',
        priceFrom: 68,
        availableCount: 13,
        availability: 'open',
        summary: 'Raised view with fast aisle access.',
        row: 'B',
        seats: ['18', '19'],
        note: 'Aisle-friendly pair',
      },
      {
        id: 'balcony',
        label: 'BAL',
        name: 'Balcony',
        priceFrom: 48,
        availableCount: 22,
        availability: 'open',
        summary: 'Affordable reserved seating with full-stage view.',
        row: 'G',
        seats: ['7', '8'],
        note: 'Best value',
      },
    ],
  }),
  buildDummyEvent({
    id: 'ufc-fight-night-vegas',
    title: 'UFC Fight Night: Vegas',
    shortTitle: 'UFC Fight Night',
    date: 'FRI, JUN 12, 6:30 PM',
    startsAt: '2026-06-12T18:30:00-07:00',
    venue: 'T-Mobile Arena',
    venueAddress: '3780 Las Vegas Blvd S, Las Vegas, NV 89158',
    venueSummary:
      'Arena access sits inside a dense resort corridor, so route preview and external maps are both useful before doors.',
    latitude: 36.10284,
    longitude: -115.17824,
    city: 'Las Vegas, NV',
    priceFrom: 115,
    imageUrl:
      'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80',
    description:
      'A fight-night card with floor risers, lower bowl angles, and group seats higher in the arena.',
    highlights: [
      'Combat-sports sections use clear angle and distance notes',
      'Limited inventory appears before checkout',
      'Ticket details preserve the event image and venue map',
    ],
    sectionPrefix: 'ufc',
    sections: [
      {
        id: 'floor-riser',
        label: 'FR',
        name: 'Floor Riser',
        priceFrom: 310,
        availableCount: 4,
        availability: 'limited',
        summary: 'Premium floor riser seats near the walkout.',
        row: '3',
        seats: ['5', '6'],
        note: 'Near fighter walkout',
      },
      {
        id: 'lower-17',
        label: '17',
        name: 'Lower 17',
        priceFrom: 188,
        availableCount: 12,
        availability: 'limited',
        summary: 'Lower bowl view angled toward the octagon.',
        row: '11',
        seats: ['9', '10'],
        note: 'Octagon angle',
      },
      {
        id: 'upper-206',
        label: '206',
        name: 'Upper 206',
        priceFrom: 115,
        availableCount: 30,
        availability: 'open',
        summary: 'Full-arena view for groups and value seekers.',
        row: '6',
        seats: ['2', '3', '4'],
        note: 'Group-friendly seats',
      },
    ],
  }),
  buildDummyEvent({
    id: 'lagos-summer-jam',
    title: 'Lagos Summer Jam',
    shortTitle: 'Lagos Summer Jam',
    date: 'SAT, JUL 04, 7:00 PM',
    startsAt: '2026-07-04T19:00:00+01:00',
    venue: 'Eko Convention Centre',
    venueAddress: '1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
    venueSummary:
      'Victoria Island traffic can shift quickly, so the in-app venue map keeps arrival planning close to the ticket.',
    latitude: 6.42656,
    longitude: 3.43011,
    city: 'Lagos, NG',
    priceFrom: 38,
    imageUrl:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
    description:
      'A Lagos concert night with VIP tables, reserved floor seats, and accessible balcony options.',
    highlights: [
      'Local dummy inventory makes Discover feel fuller near the default region',
      'Seat tiers cover premium, standard, and value options',
      'Reservations still land in the same My Tickets flow',
    ],
    sectionPrefix: 'lagos',
    sections: [
      {
        id: 'vip-table',
        label: 'VIP',
        name: 'VIP Table',
        priceFrom: 126,
        availableCount: 6,
        availability: 'limited',
        summary: 'Premium table seating near the stage.',
        row: 'T2',
        seats: ['1', '2'],
        note: 'VIP table access',
      },
      {
        id: 'floor-reserved',
        label: 'FLR',
        name: 'Reserved Floor',
        priceFrom: 64,
        availableCount: 20,
        availability: 'open',
        summary: 'Reserved floor seats with a direct stage view.',
        row: 'H',
        seats: ['12', '13', '14'],
        note: 'Reserved floor',
      },
      {
        id: 'balcony-east',
        label: 'BE',
        name: 'Balcony East',
        priceFrom: 38,
        availableCount: 34,
        availability: 'open',
        summary: 'Affordable balcony view with easy exit access.',
        row: 'D',
        seats: ['6', '7'],
        note: 'Entry-level ticket',
      },
    ],
  }),
];

const donToliverReservationSeats: ReservationSeatRecord[] = donToliverEvent.seatOptions.map((seat) => ({
  id: seat.id,
  label: seat.label,
  row: seat.row,
  seat: seat.seat,
  section: donToliverEvent.seatSections.find((section) => section.id === seat.sectionId)?.label ?? seat.sectionId,
  price: seat.price,
  availability: seat.availability,
  note: seat.note,
}));

const pastTicketEvents: EventRecord[] = pastTicketSeeds.map((seed) => ({
  ...buildDummyEvent(seed),
  discoverable: false,
}));

const pastTicketReservations: ReservationRecord[] = pastTicketEvents.map((event, index) => {
  const seats = buildReservationSeatsForEvent(event);

  return {
    id: `reservation-${event.id}`,
    eventId: event.id,
    orderId: `Order #PAST-${index + 1}`,
    reservationCode: `RSV-PAST-${index + 1}`,
    reservedAt: event.startsAt,
    seatIds: seats.map((seat) => seat.id),
    seats,
    reservationTotal: seats.reduce((sum, seat) => sum + seat.price, 0),
    ticketCount: seats.length,
    source: 'reservation',
  };
});

export const eventCatalog: EventRecord[] = [
  ...curatedEvents,
  ...extraDiscoverEvents,
  ...pastTicketEvents,
  donToliverEvent,
];

export const initialReservations: ReservationRecord[] = [
  {
    id: 'reservation-don-toliver-1',
    eventId: donToliverEvent.id,
    orderId: 'Order #29-14766/DON',
    reservationCode: 'RSV-DONTOL-03',
    reservedAt: '2026-04-18T18:00:00.000Z',
    seatIds: donToliverReservationSeats.map((seat) => seat.id),
    seats: donToliverReservationSeats,
    reservationTotal: donToliverReservationSeats.reduce((sum, seat) => sum + seat.price, 0),
    ticketCount: donToliverReservationSeats.length,
    source: 'reservation',
  },
  ...pastTicketReservations,
];

function buildDummyEvent(seed: DummyEventSeed): EventRecord {
  return {
    id: seed.id,
    title: seed.title,
    shortTitle: seed.shortTitle ?? seed.title,
    date: seed.date,
    startsAt: seed.startsAt,
    venue: seed.venue,
    venueAddress: seed.venueAddress,
    venueSummary: seed.venueSummary,
    latitude: seed.latitude,
    longitude: seed.longitude,
    city: seed.city,
    priceFrom: seed.priceFrom,
    imageUrl: seed.imageUrl,
    description: seed.description,
    highlights: seed.highlights,
    reservationNote:
      'Dummy inventory is ready for the reservation flow and can be swapped for live data later.',
    discoverable: true,
    seatSections: seed.sections.map((section) => ({
      id: section.id,
      label: section.label,
      name: section.name,
      priceFrom: section.priceFrom,
      availableCount: section.availableCount,
      availability: section.availability,
      summary: section.summary,
    })),
    seatOptions: seed.sections.flatMap((section) =>
      section.seats.map((seat, index) => ({
        id: `${seed.sectionPrefix}-${section.id}-${seat}`,
        sectionId: section.id,
        label: `${section.name} - Seat ${seat}`,
        row: section.row,
        seat,
        price: section.priceFrom,
        availability: section.availability,
        note: index === 0 ? section.note : `${section.note} together`,
      })),
    ),
  };
}

function buildReservationSeatsForEvent(event: EventRecord): ReservationSeatRecord[] {
  return event.seatOptions.map((seat) => ({
    id: seat.id,
    label: seat.label,
    row: seat.row,
    seat: seat.seat,
    section:
      event.seatSections.find((section) => section.id === seat.sectionId)?.label ??
      seat.sectionId,
    price: seat.price,
    availability: seat.availability,
    note: seat.note,
  }));
}
