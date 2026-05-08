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
  const normalizedRange = seatRange.trim();

  if (!normalizedRange) {
    return [];
  }

  const seats = normalizedRange
    .split(/\s*,\s*/)
    .flatMap((segment) => expandSeatSegment(segment))
    .map((seat) => seat.trim())
    .filter(Boolean);

  return seats.length ? seats : [normalizedRange];
}

export function formatTicketSeatSummary(
  ticket: Pick<TicketRecord, 'section' | 'row' | 'seatRange'>,
) {
  const seats = getSimpleTicketSeatNumbers(ticket.seatRange);
  const seatLabel =
    formatSeatSelectionLabel(seats) || ticket.seatRange.trim() || 'TBA';

  return `Section ${ticket.section} / Row ${ticket.row} / Seat ${seatLabel}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type ParsedSeatToken = {
  number: number;
  prefix: string;
  suffix: string;
  width: number;
};

function expandSeatSegment(segment: string) {
  const trimmedSegment = segment.trim();

  if (!trimmedSegment) {
    return [];
  }

  const rangeParts = trimmedSegment
    .split(/\s*(?:-|–|—|to)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (rangeParts.length !== 2) {
    return [trimmedSegment];
  }

  return expandSeatRange(rangeParts[0], rangeParts[1]) ?? rangeParts;
}

function expandSeatRange(startSeat: string, endSeat: string) {
  const startToken = parseSeatToken(startSeat);
  const endToken = parseSeatToken(endSeat);

  if (!startToken || !endToken) {
    return null;
  }

  if (
    startToken.prefix !== endToken.prefix ||
    startToken.suffix !== endToken.suffix
  ) {
    return null;
  }

  const delta = endToken.number - startToken.number;
  if (Math.abs(delta) > 200) {
    return null;
  }

  const step = delta >= 0 ? 1 : -1;
  const width = Math.max(startToken.width, endToken.width);
  const expandedSeats: string[] = [];

  for (
    let seatNumber = startToken.number;
    step > 0 ? seatNumber <= endToken.number : seatNumber >= endToken.number;
    seatNumber += step
  ) {
    expandedSeats.push(
      `${startToken.prefix}${String(seatNumber).padStart(width, '0')}${startToken.suffix}`,
    );
  }

  return expandedSeats;
}

function formatSeatSelectionLabel(seats: string[]) {
  if (!seats.length) {
    return '';
  }

  if (seats.length === 1) {
    return seats[0];
  }

  return areSequentialSeatValues(seats)
    ? `${seats[0]}-${seats[seats.length - 1]}`
    : seats.join(', ');
}

function areSequentialSeatValues(seats: string[]) {
  if (seats.length < 2) {
    return true;
  }

  const parsedSeats = seats.map(parseSeatToken);

  if (parsedSeats.some((seat) => !seat)) {
    return false;
  }

  const [firstSeat, ...remainingSeats] = parsedSeats as ParsedSeatToken[];

  return remainingSeats.every((seat, index) => {
    if (
      seat.prefix !== firstSeat.prefix ||
      seat.suffix !== firstSeat.suffix
    ) {
      return false;
    }

    return seat.number === firstSeat.number + index + 1;
  });
}

function parseSeatToken(value: string): ParsedSeatToken | null {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^([A-Za-z]*)(\d+)([A-Za-z]*)$/);

  if (!match) {
    return null;
  }

  return {
    number: Number(match[2]),
    prefix: match[1],
    suffix: match[3],
    width: match[2].length,
  };
}
