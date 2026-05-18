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
  orderNumber: string;
  ticketType: TicketType;
  status: TicketStatus;
  perks: string;
  transferRules: string;
  image: string;
  backgroundColor: string;
  seatLabel: string;
  ticketNote: string;
  isHidden: boolean;
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
    orderNumber: '19-12465/DAL',
    ticketType: 'VIP',
    status: 'upcoming',
    perks: 'Priority entry, Starboy lounge access, complimentary drinks, VIP wristband',
    transferRules: 'Transferable once before 24 hours to showtime. Valid ID required at entry.',
    backgroundColor: '#B79E6A',
    seatLabel: 'Artist presale',
    ticketNote: 'Gold circle seating',
    isHidden: false,
    createdAt: '2026-04-18T11:15:00.000Z',
    updatedAt: '2026-04-18T11:15:00.000Z',
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
    orderNumber: '15-44921/LAG',
    ticketType: 'VIP',
    status: 'past',
    perks: 'Lounge access, premium bar, priority exit',
    transferRules: 'This ticket is no longer transferable because the event has passed.',
    backgroundColor: '#8B5CF6',
    seatLabel: 'Fan verified',
    ticketNote: 'Platinum lounge access',
    isHidden: false,
    createdAt: '2025-10-12T09:00:00.000Z',
    updatedAt: '2025-12-20T23:30:00.000Z',
  },
];
