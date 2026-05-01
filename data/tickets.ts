export type TicketType = 'VIP' | 'Standard' | 'General';

export type TicketStatus = 'upcoming' | 'past';

export type TicketRecord = {
  id: string;
  eventName: string;
  artistName: string;
  albumName: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  date: string;
  time: string;
  purchaseDate: string;
  section: string;
  row: string;
  seatRange: string;
  barcode: string;
  ticketType: TicketType;
  status: TicketStatus;
  perks: string;
  transferRules: string;
  image: string;
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
};

const sharedEvent = {
  eventName: 'Wizkid: Made in Lagos Live',
  artistName: 'Wizkid',
  albumName: 'Made in Lagos',
  venue: 'Eko Convention Centre',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  image:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
};

export const mockTickets: TicketRecord[] = [
  {
    ...sharedEvent,
    id: 'ticket-wiz-mil-vip-001',
    date: '2026-12-19',
    time: '8:30 PM',
    purchaseDate: '2026-04-18',
    section: 'Gold Circle',
    row: 'A',
    seatRange: 'A12 - A13',
    barcode: 'WIZ-MIL-VIP-001',
    ticketType: 'VIP',
    status: 'upcoming',
    perks: 'Priority entry, Starboy lounge access, complimentary drinks, VIP wristband',
    transferRules: 'Transferable once before 24 hours to showtime. Valid ID required at entry.',
    backgroundColor: '#B79E6A',
    createdAt: '2026-04-18T11:15:00.000Z',
    updatedAt: '2026-04-18T11:15:00.000Z',
  },
  {
    ...sharedEvent,
    id: 'ticket-wiz-mil-standard-001',
    date: '2026-12-19',
    time: '8:30 PM',
    purchaseDate: '2026-04-19',
    section: 'Main Floor',
    row: 'F',
    seatRange: 'F21 - F22',
    barcode: 'WIZ-MIL-STD-001',
    ticketType: 'Standard',
    status: 'upcoming',
    perks: 'Reserved floor seating, mobile entry, official event updates',
    transferRules: 'Transferable through the app until doors open.',
    backgroundColor: '#005BD3',
    createdAt: '2026-04-19T15:25:00.000Z',
    updatedAt: '2026-04-19T15:25:00.000Z',
  },
  {
    ...sharedEvent,
    id: 'ticket-wiz-mil-general-001',
    date: '2026-12-19',
    time: '8:30 PM',
    purchaseDate: '2026-04-21',
    section: 'General Admission',
    row: 'GA',
    seatRange: 'Standing GA 104 - 105',
    barcode: 'WIZ-MIL-GEN-001',
    ticketType: 'General',
    status: 'upcoming',
    perks: 'Standing access, mobile ticket delivery',
    transferRules: 'Transferable once. No resale inside venue perimeter.',
    backgroundColor: '#16A34A',
    createdAt: '2026-04-21T10:40:00.000Z',
    updatedAt: '2026-04-21T10:40:00.000Z',
  },
  {
    ...sharedEvent,
    id: 'ticket-wiz-mil-vip-past-001',
    date: '2025-12-20',
    time: '9:00 PM',
    purchaseDate: '2025-10-12',
    section: 'Platinum Lounge',
    row: 'B',
    seatRange: 'B04 - B05',
    barcode: 'WIZ-MIL-VIP-PAST-001',
    ticketType: 'VIP',
    status: 'past',
    perks: 'Lounge access, premium bar, priority exit',
    transferRules: 'This ticket is no longer transferable because the event has passed.',
    backgroundColor: '#8B5CF6',
    createdAt: '2025-10-12T09:00:00.000Z',
    updatedAt: '2025-12-20T23:30:00.000Z',
  },
  {
    ...sharedEvent,
    id: 'ticket-wiz-mil-standard-002',
    date: '2026-12-20',
    time: '7:30 PM',
    purchaseDate: '2026-04-22',
    section: 'Balcony Centre',
    row: 'C',
    seatRange: 'C18 - C19',
    barcode: 'WIZ-MIL-STD-002',
    ticketType: 'Standard',
    status: 'upcoming',
    perks: 'Reserved balcony seating, mobile entry',
    transferRules: 'Transferable through the app until 6 hours before showtime.',
    backgroundColor: '#0EA5E9',
    createdAt: '2026-04-22T13:05:00.000Z',
    updatedAt: '2026-04-22T13:05:00.000Z',
  },
  {
    ...sharedEvent,
    id: 'ticket-wiz-mil-general-002',
    date: '2026-12-20',
    time: '7:30 PM',
    purchaseDate: '2026-04-23',
    section: 'Upper Gallery',
    row: 'GA',
    seatRange: 'Standing GA 238 - 239',
    barcode: 'WIZ-MIL-GEN-002',
    ticketType: 'General',
    status: 'upcoming',
    perks: 'Gallery standing access, mobile ticket delivery',
    transferRules: 'Transferable once before the event starts.',
    backgroundColor: '#DC2626',
    createdAt: '2026-04-23T17:45:00.000Z',
    updatedAt: '2026-04-23T17:45:00.000Z',
  },
];
