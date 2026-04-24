import { create } from 'zustand';

import {
  type AdminEventMetadata,
  eventCatalog,
  initialReservations,
  type EventRecord,
  type ReservationRecord,
  type ReservationSeatRecord,
} from '@/lib/data';
import { type EventSeatOption, type EventSeatSection } from '@/lib/mock-events';

type ReserveTicketsInput = {
  eventId: string;
  reservationId?: string;
  seatIds: string[];
};

export type CreateAdminEventInput = {
  additionalTicketInfo: string;
  barcodeNumber: string;
  city: string;
  entryInfo: string;
  eventDate: Date;
  imageUrl?: string | null;
  purchaseDate: Date;
  row: string;
  seatFrom: number;
  seatTo: number;
  section: string;
  state: string;
  ticketType: string;
  time: Date;
  venueName: string;
};

type EventStore = {
  createAdminEvent: (input: CreateAdminEventInput) => EventRecord;
  events: EventRecord[];
  reservations: ReservationRecord[];
  reserveTickets: (input: ReserveTicketsInput) => ReservationRecord | null;
};

export type HydratedEventRecord = EventRecord & {
  allSeatOptions: EventSeatOption[];
  reservedSeatIds: string[];
  reservations: ReservationRecord[];
};

export type TicketReservationView = ReservationRecord & {
  event: HydratedEventRecord;
  status: 'upcoming' | 'past';
};

type EventViewCache = {
  discoverEvents: HydratedEventRecord[];
  eventsRef: EventRecord[];
  hydratedEvents: HydratedEventRecord[];
  hydratedEventsById: Map<string, HydratedEventRecord>;
  primaryTicketReservation?: TicketReservationView;
  reservationsRef: ReservationRecord[];
  ticketReservations: TicketReservationView[];
  ticketReservationsById: Map<string, TicketReservationView>;
};

let eventViewCache: EventViewCache | null = null;

export const useEventStore = create<EventStore>((set, get) => ({
  createAdminEvent: (input) => {
    const nextEvent = buildAdminEvent(input);

    set((state) => ({
      events: [nextEvent, ...state.events],
    }));

    return nextEvent;
  },
  events: eventCatalog,
  reservations: initialReservations,
  reserveTickets: ({ eventId, reservationId, seatIds }) => {
    const { events, reservations } = get();
    const event = events.find((record) => record.id === eventId);

    if (!event) {
      return null;
    }

    const validSeatIds = Array.from(new Set(seatIds)).filter((seatId) =>
      event.seatOptions.some((seat) => seat.id === seatId),
    );

    if (!validSeatIds.length) {
      return null;
    }

    const seatSnapshots = buildSeatSnapshots(event, validSeatIds);
    const reservationTotal = seatSnapshots.reduce((sum, seat) => sum + seat.price, 0);
    const existingReservation = reservationId
      ? reservations.find((reservation) => reservation.id === reservationId)
      : undefined;

    const nextReservation: ReservationRecord = {
      id: existingReservation?.id ?? buildReservationId(eventId),
      eventId,
      orderId: existingReservation?.orderId ?? buildOrderId(event),
      reservationCode:
        existingReservation?.reservationCode ??
        buildReservationCode(event, reservations.length + 1),
      reservedAt: new Date().toISOString(),
      seatIds: validSeatIds,
      seats: seatSnapshots,
      reservationTotal,
      ticketCount: seatSnapshots.length,
      source: existingReservation?.source ?? 'reservation',
    };

    set((state) => ({
      reservations: existingReservation
        ? state.reservations.map((reservation) =>
            reservation.id === existingReservation.id ? nextReservation : reservation,
          )
        : [nextReservation, ...state.reservations],
    }));

    return nextReservation;
  },
}));

export function selectDiscoverEvents(state: EventStore) {
  return getEventViewCache(state).discoverEvents;
}

export function selectEventById(state: EventStore, eventId: string) {
  return getEventViewCache(state).hydratedEventsById.get(eventId);
}

export function selectTicketReservations(state: EventStore) {
  return getEventViewCache(state).ticketReservations;
}

export function selectTicketReservationById(state: EventStore, reservationId: string) {
  return getEventViewCache(state).ticketReservationsById.get(reservationId);
}

export function selectPrimaryTicketReservation(state: EventStore) {
  return getEventViewCache(state).primaryTicketReservation;
}

function getEventViewCache(state: EventStore) {
  if (
    eventViewCache &&
    eventViewCache.eventsRef === state.events &&
    eventViewCache.reservationsRef === state.reservations
  ) {
    return eventViewCache;
  }

  const hydratedEvents = state.events.map((event) =>
    hydrateEvent(event, state.reservations),
  );
  const hydratedEventsById = new Map(hydratedEvents.map((event) => [event.id, event]));
  const discoverEvents = hydratedEvents.filter((event) => event.discoverable !== false);
  const ticketReservations = state.reservations
    .filter((reservation) => reservation.source === 'reservation')
    .map((reservation) => {
      const event = hydratedEventsById.get(reservation.eventId);

      if (!event) {
        return undefined;
      }

      return {
        ...reservation,
        event,
        status: getReservationStatus(event.startsAt),
      } satisfies TicketReservationView;
    })
    .filter((reservation): reservation is TicketReservationView => Boolean(reservation))
    .sort((left, right) => {
      const leftTime = new Date(left.event.startsAt).getTime();
      const rightTime = new Date(right.event.startsAt).getTime();
      return rightTime - leftTime;
    });
  const ticketReservationsById = new Map(
    ticketReservations.map((reservation) => [reservation.id, reservation]),
  );

  eventViewCache = {
    discoverEvents,
    eventsRef: state.events,
    hydratedEvents,
    hydratedEventsById,
    primaryTicketReservation:
      ticketReservations.find((reservation) => reservation.status === 'upcoming') ??
      ticketReservations[0],
    reservationsRef: state.reservations,
    ticketReservations,
    ticketReservationsById,
  };

  return eventViewCache;
}

function hydrateEvent(event: EventRecord, reservations: ReservationRecord[]): HydratedEventRecord {
  const eventReservations = reservations.filter((reservation) => reservation.eventId === event.id);
  const reservedSeatIds = eventReservations.flatMap((reservation) => reservation.seatIds);
  const reservedSeatSet = new Set(reservedSeatIds);
  const availableSeatOptions = event.seatOptions.filter((seat) => !reservedSeatSet.has(seat.id));
  const seatCountBySection = buildSeatCountBySection(availableSeatOptions);

  const nextSeatSections = event.seatSections.map((section) =>
    hydrateSection(section, seatCountBySection[section.id] ?? 0),
  );

  return {
    ...event,
    allSeatOptions: event.seatOptions,
    reservations: eventReservations,
    reservedSeatIds,
    seatOptions: availableSeatOptions,
    seatSections: nextSeatSections,
  };
}

function buildAdminEvent(input: CreateAdminEventInput): EventRecord {
  const seatCount = input.seatTo - input.seatFrom + 1;
  const startsAt = buildAdminStartsAt(input.eventDate, input.time);
  const timeLabel = formatTimeLabel(input.time);
  const purchaseDateLabel = formatPurchaseDateLabel(input.purchaseDate);
  const title = `${input.ticketType} at ${input.venueName}`;
  const cityLabel = `${input.city}, ${input.state}`;
  const sectionId = buildAdminSlug(`${input.section}-${input.row}`) || 'admin-section';
  const priceFrom = getAdminTicketPrice(input.ticketType);
  const availability = seatCount <= 6 ? 'limited' : 'open';
  const note = input.additionalTicketInfo.trim() || input.ticketType.trim();
  const imageUrl = resolveAdminEventImage(input.imageUrl, input.ticketType);
  const adminDetails: AdminEventMetadata = {
    additionalTicketInfo: input.additionalTicketInfo.trim(),
    barcodeNumber: input.barcodeNumber.trim(),
    entryInfo: input.entryInfo.trim(),
    purchaseDate: input.purchaseDate.toISOString(),
    seatFrom: input.seatFrom,
    seatTo: input.seatTo,
    state: input.state.trim(),
    ticketType: input.ticketType.trim(),
    time: timeLabel,
  };

  return {
    adminDetails,
    city: cityLabel,
    date: formatEventDateLabel(input.eventDate, input.time),
    description:
      input.additionalTicketInfo.trim() ||
      `Admin-created ticket block for ${input.ticketType.toLowerCase()} entry at ${input.venueName}.`,
    discoverable: true,
    highlights: [
      `${input.ticketType} ticket block in Section ${input.section}, Row ${input.row}`,
      `Seats ${input.seatFrom} through ${input.seatTo} are ready for reservation preview`,
      `Purchased on ${purchaseDateLabel} with barcode ${input.barcodeNumber.trim()}`,
    ],
    id: `admin-${buildAdminSlug(`${input.venueName}-${startsAt}`)}`,
    imageUrl,
    latitude: null,
    longitude: null,
    priceFrom,
    reservationNote:
      input.entryInfo.trim() ||
      'Entry details will be confirmed by the venue before doors open.',
    seatOptions: Array.from({ length: seatCount }, (_, index) => {
      const seatNumber = input.seatFrom + index;

      return {
        availability,
        id: `admin-${sectionId}-${seatNumber}`,
        label: `Sec ${input.section} - Seat ${seatNumber}`,
        note: index === 0 ? note : `${note} together`,
        price: priceFrom,
        row: input.row.trim(),
        seat: String(seatNumber),
        sectionId,
      } satisfies EventSeatOption;
    }),
    seatSections: [
      {
        availability,
        availableCount: seatCount,
        id: sectionId,
        label: input.section.trim().toUpperCase(),
        name: `Section ${input.section.trim()} / Row ${input.row.trim()}`,
        priceFrom,
        summary: `Seats ${input.seatFrom} through ${input.seatTo} in Row ${input.row.trim()}.`,
      } satisfies EventSeatSection,
    ],
    shortTitle: title,
    startsAt,
    title,
    venue: input.venueName.trim(),
    venueAddress: `${input.venueName.trim()}, ${cityLabel}`,
    venueSummary:
      input.entryInfo.trim() ||
      `Entry instructions for ${input.venueName.trim()} are attached to this admin-created event.`,
  };
}

function buildSeatSnapshots(event: EventRecord, seatIds: string[]) {
  return seatIds
    .map((seatId) => event.seatOptions.find((seat) => seat.id === seatId))
    .filter((seat): seat is EventSeatOption => Boolean(seat))
    .map((seat) => {
      const sectionLabel =
        event.seatSections.find((section) => section.id === seat.sectionId)?.label ?? seat.sectionId;

      return {
        id: seat.id,
        label: seat.label,
        row: seat.row,
        seat: seat.seat,
        section: sectionLabel,
        price: seat.price,
        availability: seat.availability,
        note: seat.note,
      } satisfies ReservationSeatRecord;
    });
}

function buildSeatCountBySection(seatOptions: EventSeatOption[]) {
  return seatOptions.reduce<Record<string, number>>((counts, seat) => {
    counts[seat.sectionId] = (counts[seat.sectionId] ?? 0) + 1;
    return counts;
  }, {});
}

function hydrateSection(section: EventSeatSection, availableCount: number) {
  return {
    ...section,
    availableCount,
    availability: availableCount <= 6 ? 'limited' : 'open',
  } satisfies EventSeatSection;
}

function getReservationStatus(startsAt: string) {
  return new Date(startsAt).getTime() < Date.now() ? 'past' : 'upcoming';
}

function buildReservationId(eventId: string) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `reservation-${eventId}-${suffix}`;
}

function buildOrderId(event: EventRecord) {
  const shortCode = event.title.replace(/[^A-Z0-9]/gi, '').slice(0, 3).toUpperCase() || 'EVT';
  const sequence = Math.floor(10000 + Math.random() * 89999);
  return `Order #${sequence}-${shortCode}`;
}

function buildReservationCode(event: EventRecord, count: number) {
  const prefix = event.id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
  return `RSV-${prefix}-${String(count).padStart(2, '0')}`;
}

function buildAdminStartsAt(eventDate: Date, time: Date) {
  const nextDate = new Date(eventDate);
  nextDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return nextDate.toISOString();
}

function buildAdminSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatEventDateLabel(eventDate: Date, time: Date) {
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    weekday: 'short',
    year: 'numeric',
  }).format(eventDate);

  return `${dateLabel.replace(',', '').toUpperCase()}, ${formatTimeLabel(time)}`;
}

function formatPurchaseDateLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
}

function formatTimeLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

export function resolveAdminEventImage(imageUrl: string | null | undefined, ticketType: string) {
  const normalizedImageUrl = imageUrl?.trim();

  if (normalizedImageUrl) {
    return normalizedImageUrl;
  }

  return getDefaultAdminEventImage(ticketType);
}

export function getDefaultAdminEventImage(ticketType: string) {
  const value = ticketType.toLowerCase();

  if (value.includes('vip') || value.includes('premium')) {
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80';
  }

  if (value.includes('mobile') || value.includes('digital')) {
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';
  }

  return 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80';
}

function getAdminTicketPrice(ticketType: string) {
  const value = ticketType.toLowerCase();

  if (value.includes('vip')) {
    return 220;
  }

  if (value.includes('premium')) {
    return 165;
  }

  if (value.includes('club')) {
    return 145;
  }

  if (value.includes('guest')) {
    return 55;
  }

  return 85;
}
