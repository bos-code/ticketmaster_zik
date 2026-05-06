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

const wizkidEvent: EventRecord = {
  id: 'wizkid-made-in-lagos-live',
  title: 'Wizkid: Made in Lagos Live',
  shortTitle: 'Wizkid: Made in Lagos Live',
  date: 'SAT, DEC 19, 8:30 PM',
  startsAt: '2026-12-19T20:30:00+01:00',
  venue: 'Eko Convention Centre',
  venueAddress:
    'Plot 1415 Adetokunbo Ademola Street, PMB 12724, Victoria Island, Lagos, Nigeria',
  venueSummary:
    'Victoria Island traffic can shift quickly on show nights, so the venue preview and directions stay attached to this ticket flow.',
  latitude: 6.42674716,
  longitude: 3.43009885,
  city: 'Lagos, Nigeria',
  priceFrom: 115,
  imageUrl:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
  description:
    'A hidden shared event record for the seeded My Tickets experience, keeping venue previews and directions available from the same source as the ticket flow.',
  highlights: [
    'Ticket transfer previews stay linked to a real venue location',
    'Directions and seat details can resolve from the same shared event data',
    'Legacy ticket mocks keep the same venue-map behavior as reservation-backed tickets',
  ],
  reservationNote:
    'Ticket details and venue directions stay connected from the same shared source record.',
  discoverable: false,
  seatSections: [
    {
      id: 'wiz-gold-circle',
      label: 'GC',
      name: 'Gold Circle',
      priceFrom: 115,
      availableCount: 6,
      availability: 'limited',
      summary: 'Front-of-stage access with a short walk to the main entry lane.',
    },
  ],
  seatOptions: [
    {
      id: 'wiz-gold-circle-12',
      sectionId: 'wiz-gold-circle',
      label: 'Gold Circle - Seat 12',
      row: 'A',
      seat: '12',
      price: 115,
      availability: 'limited',
      note: 'Artist presale',
    },
    {
      id: 'wiz-gold-circle-13',
      sectionId: 'wiz-gold-circle',
      label: 'Gold Circle - Seat 13',
      row: 'A',
      seat: '13',
      price: 115,
      availability: 'limited',
      note: 'Artist presale',
    },
  ],
};

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
      note: 'Artist presale',
    },
    {
      id: 'dt-102-3',
      sectionId: 'dt-102',
      label: 'Sec 102 - Seat 3',
      row: '12',
      seat: '3',
      price: 129,
      availability: 'limited',
      note: 'Artist presale',
    },
    {
      id: 'dt-102-4',
      sectionId: 'dt-102',
      label: 'Sec 102 - Seat 4',
      row: '12',
      seat: '4',
      price: 129,
      availability: 'limited',
      note: 'Artist presale',
    },
  ],
};

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

export const eventCatalog: EventRecord[] = [
  ...curatedEvents,
  wizkidEvent,
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
];
