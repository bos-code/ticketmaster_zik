import type { TicketRecord } from "../../data/tickets";

import { getSimpleTicketSeatNumbers } from "@/store/ticketStore";
import type { TicketItem, TicketOrderData } from "@/types/ticket";

export const ticketOrder: TicketOrderData = {
  event: {
    id: "event-don-toliver-octane-tour",
    title: "Don Toliver: Octane Tour",
    venue: "Madison Square Garden",
    date: "Mon, Jun 01",
    time: "7:30 PM",
    fullDateTimeLabel: "Mon, Jun 01, 7:30 PM",
    heroImage: require("../../assets/tickets/don-toliver.png"),
  },

  order: {
    id: "order-29-14766-don",
    orderNumber: "#29-14766/DON",
    ticketCount: 3,
  },

  tickets: [
    {
      id: "ticket-seat-2",
      ticketIndex: 1,
      type: "Arist presale",
      seatingCategory: "LOWER BOWL SEATING",
      section: "102",
      row: "12",
      seat: "2",
      barcodeValue: "DEMO-DON-102-12-2",
      canTransfer: true,
      canSell: false,
    },
    {
      id: "ticket-seat-3",
      ticketIndex: 2,
      type: "Arist presale",
      seatingCategory: "LOWER BOWL SEATING",
      section: "102",
      row: "12",
      seat: "3",
      barcodeValue: "DEMO-DON-102-12-3",
      canTransfer: true,
      canSell: false,
    },
    {
      id: "ticket-seat-4",
      ticketIndex: 3,
      type: "Arist presale",
      seatingCategory: "LOWER BOWL SEATING",
      section: "102",
      row: "12",
      seat: "4",
      barcodeValue: "DEMO-DON-102-12-4",
      canTransfer: true,
      canSell: false,
    },
  ],
};

export const ticketOrders: TicketOrderData[] = [ticketOrder];

export function mapTicketRecordToTicketOrderData(
  ticketRecord: TicketRecord,
): TicketOrderData {
  const seatValues = getSimpleTicketSeatNumbers(ticketRecord.seatRange);
  const normalizedSeats = seatValues.length ? seatValues : ["TBA"];
  const tickets = normalizedSeats.map((seat, index) =>
    createTicketItem(ticketRecord, seat, index),
  );
  const ticketCount = tickets.length;

  return {
    event: {
      id: ticketRecord.id,
      title: ticketRecord.eventName,
      venue: ticketRecord.venue,
      date: formatEventDateLabel(ticketRecord.date),
      time: ticketRecord.time,
      fullDateTimeLabel: formatEventFullDateTimeLabel(
        ticketRecord.date,
        ticketRecord.time,
      ),
      heroImage: { uri: ticketRecord.image },
    },
    order: {
      id: ticketRecord.id,
      orderNumber: ticketRecord.orderNumber,
      ticketCount,
    },
    tickets,
  };
}

export function mapTicketRecordsToTicketOrders(ticketRecords: TicketRecord[]) {
  return ticketRecords.map(mapTicketRecordToTicketOrderData);
}

function createTicketItem(
  ticketRecord: TicketRecord,
  seat: string,
  index: number,
): TicketItem {
  return {
    id: `${ticketRecord.id}-seat-${index + 1}`,
    ticketIndex: index + 1,
    type: ticketRecord.seatLabel.trim() || ticketRecord.ticketType,
    seatingCategory:
      ticketRecord.ticketNote.trim() || "STANDARD SEATING",
    section: ticketRecord.section,
    row: ticketRecord.row,
    seat,
    barcodeValue: ticketRecord.barcode || undefined,
    canTransfer: ticketRecord.status === "upcoming",
    canSell: false,
  };
}


function formatEventDateLabel(dateValue: string) {
  const date = parseTicketDate(dateValue);

  if (!date) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatEventFullDateTimeLabel(dateValue: string, timeValue: string) {
  const formattedDate = formatEventDateLabel(dateValue);
  return timeValue.trim()
    ? `${formattedDate}, ${timeValue.trim()}`
    : formattedDate;
}

function parseTicketDate(dateValue: string) {
  const trimmedDateValue = dateValue.trim();
  if (!trimmedDateValue) {
    return null;
  }

  const parsedDate = new Date(`${trimmedDateValue}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}
