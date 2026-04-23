import { create } from 'zustand';

import {
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

type EventStore = {
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
