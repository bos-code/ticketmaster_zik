import type {
  TicketDetailsViewModel,
  TicketItem,
  TicketOrderData,
  TicketSummaryViewModel,
} from "@/types/ticket";

const EMPTY_TICKET: TicketItem = {
  id: "ticket-empty",
  ticketIndex: 0,
  type: "",
  seatingCategory: "",
  section: "",
  row: "",
  seat: "",
  canTransfer: false,
  canSell: false,
};

export function getTicketCount(order: TicketOrderData) {
  const ticketLength = order.tickets?.length ?? 0;

  return ticketLength || order.order.ticketCount;
}

export function getTicketCountLabel(count: number) {
  return count === 1 ? "x1 Ticket" : `x${count} Tickets`;
}

export function getTicketPositionLabel(index: number, total: number) {
  if (total <= 0) {
    return "0 of 0";
  }

  const normalizedIndex = Math.min(Math.max(index, 0), total - 1);
  return `${normalizedIndex + 1} of ${total}`;
}

export function getSelectedTicket(tickets: TicketItem[], ticketIndex?: number) {
  if (!tickets.length) {
    return EMPTY_TICKET;
  }

  if (
    typeof ticketIndex !== "number" ||
    !Number.isInteger(ticketIndex) ||
    ticketIndex < 0 ||
    ticketIndex >= tickets.length
  ) {
    return tickets[0];
  }

  return tickets[ticketIndex];
}

export function getTicketById(tickets: TicketItem[], ticketId?: string) {
  if (!tickets.length) {
    return EMPTY_TICKET;
  }

  if (!ticketId) {
    return tickets[0];
  }

  return tickets.find((ticket) => ticket.id === ticketId) ?? tickets[0];
}

export function getTicketIndexById(tickets: TicketItem[], ticketId?: string) {
  if (!tickets.length || !ticketId) {
    return 0;
  }

  const matchingIndex = tickets.findIndex((ticket) => ticket.id === ticketId);
  return matchingIndex >= 0 ? matchingIndex : 0;
}

export function createTicketSummaryViewModel(
  order: TicketOrderData,
): TicketSummaryViewModel {
  const ticketCount = getTicketCount(order);

  return {
    eventTitle: order.event.title,
    eventVenue: order.event.venue,
    eventDate: order.event.date,
    eventTime: order.event.time,
    eventFullDateTimeLabel: order.event.fullDateTimeLabel,
    heroImage: order.event.heroImage,
    orderId: order.order.id,
    orderNumber: order.order.orderNumber,
    ticketCount,
    ticketCountLabel: getTicketCountLabel(ticketCount),
    tickets: order.tickets,
  };
}

export function createTicketDetailsViewModel(
  order: TicketOrderData,
  activeIndex: number,
): TicketDetailsViewModel {
  const totalTickets = order.tickets.length;
  const activeTicket = getSelectedTicket(order.tickets, activeIndex);
  const normalizedIndex = totalTickets
    ? Math.min(Math.max(activeIndex, 0), totalTickets - 1)
    : 0;

  return {
    eventTitle: order.event.title,
    eventSubtitle: `${order.event.time} - ${order.event.venue}`,
    heroImage: order.event.heroImage,
    activeTicket,
    activeIndex: normalizedIndex,
    totalTickets,
    positionLabel: getTicketPositionLabel(normalizedIndex, totalTickets),
    canTransfer: activeTicket.canTransfer,
    canSell: activeTicket.canSell,
  };
}
