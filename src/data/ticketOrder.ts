import type { TicketOrderData } from "@/types/ticket";

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
