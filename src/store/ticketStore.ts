import { create } from 'zustand';

import { mockTickets, type TicketRecord, type TicketStatus, type TicketType } from '../../data/tickets';

export type { TicketRecord, TicketStatus, TicketType };

export type TicketInput = Omit<TicketRecord, 'id' | 'createdAt' | 'updatedAt'>;
export type TicketUpdateInput = Partial<TicketInput>;

type TicketStore = {
  tickets: TicketRecord[];
  events: TicketRecord[];
  addEvent: (ticket: TicketInput) => TicketRecord;
  updateEvent: (id: string, updatedFields: TicketUpdateInput) => void;
  removeEvent: (id: string) => void;
  getEventById: (id: string) => TicketRecord | undefined;
};

export const TICKET_TYPE_OPTIONS: TicketType[] = ['VIP', 'Standard', 'General'];
export const TICKET_STATUS_OPTIONS: TicketStatus[] = ['upcoming', 'past'];

export const DEFAULT_WIZKID_TICKET: TicketInput = {
  eventName: 'Wizkid: Made in Lagos Live',
  artistName: 'Wizkid',
  albumName: 'Made in Lagos',
  venue: 'Eko Convention Centre',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  date: '2026-12-19',
  time: '8:30 PM',
  purchaseDate: '2026-04-30',
  section: 'Gold Circle',
  row: 'A',
  seatRange: 'A12 - A13',
  barcode: 'WIZ-MIL-VIP-NEW',
  ticketType: 'VIP',
  status: 'upcoming',
  perks: 'Priority entry, Starboy lounge access, complimentary drinks',
  transferRules: 'Transferable once before 24 hours to showtime. Valid ID required at entry.',
  image:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
  backgroundColor: '#B79E6A',
  seatLabel: 'Artist presale',
  ticketNote: 'Standard seating',
};

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: mockTickets,
  events: mockTickets,
  addEvent: (ticket) => {
    const now = new Date().toISOString();
    const nextTicket: TicketRecord = {
      ...ticket,
      id: generateTicketId(ticket),
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const tickets = [nextTicket, ...state.tickets];
      return { tickets, events: tickets };
    });

    return nextTicket;
  },
  updateEvent: (id, updatedFields) => {
    set((state) => {
      const tickets = state.tickets.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              ...updatedFields,
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      );

      return { tickets, events: tickets };
    });
  },
  removeEvent: (id) => {
    set((state) => {
      const tickets = state.tickets.filter((ticket) => ticket.id !== id);
      return { tickets, events: tickets };
    });
  },
  getEventById: (id) => get().tickets.find((ticket) => ticket.id === id),
}));

export function generateTicketId(ticket: Pick<TicketInput, 'artistName' | 'ticketType'>) {
  const artist = slugify(ticket.artistName) || 'artist';
  const type = slugify(ticket.ticketType) || 'ticket';
  return `ticket-${artist}-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatTicketDate(ticket: Pick<TicketRecord, 'date' | 'time'>) {
  const date = new Date(`${ticket.date}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return `${ticket.date} ${ticket.time}`.trim();
  }

  return `${new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)} at ${ticket.time}`;
}

export function getSimpleTicketSeatNumbers(seatRange: string) {
  const seats = seatRange
    .split(/\s*-\s*/)
    .map((seat) => {
      const trimmedSeat = seat.trim();
      const matches = trimmedSeat.match(/\d+/g);

      return matches?.length ? matches[matches.length - 1] : trimmedSeat;
    })
    .filter(Boolean);

  return seats.length ? seats : [seatRange.trim()];
}

export function formatTicketSeatSummary(
  ticket: Pick<TicketRecord, 'section' | 'row' | 'seatRange'>,
) {
  const seats = getSimpleTicketSeatNumbers(ticket.seatRange);
  const seatLabel =
    seats.length > 1 ? `${seats[0]}-${seats[seats.length - 1]}` : seats[0];

  return `Section ${ticket.section} / Row ${ticket.row} / Seat ${seatLabel}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
