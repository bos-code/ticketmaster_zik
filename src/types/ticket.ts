export interface EventInfo {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  fullDateTimeLabel: string;
  heroImage: any;
}

export interface TicketOrderInfo {
  id: string;
  orderNumber: string;
  ticketCount: number;
}

export interface TicketItem {
  id: string;
  ticketIndex: number;
  type: string;
  seatingCategory: string;
  section: string;
  row: string;
  seat: string;
  barcodeValue?: string;
  canTransfer: boolean;
  canSell: boolean;
}

export interface TicketOrderData {
  event: EventInfo;
  order: TicketOrderInfo;
  tickets: TicketItem[];
}

export interface TicketSummaryViewModel {
  eventTitle: string;
  eventVenue: string;
  eventDate: string;
  eventTime: string;
  eventFullDateTimeLabel: string;
  heroImage: EventInfo["heroImage"];
  orderId: string;
  orderNumber: string;
  ticketCount: number;
  ticketCountLabel: string;
  tickets: TicketItem[];
}

export interface TicketDetailsViewModel {
  eventTitle: string;
  eventSubtitle: string;
  heroImage: EventInfo["heroImage"];
  activeTicket: TicketItem;
  activeIndex: number;
  totalTickets: number;
  positionLabel: string;
  canTransfer: boolean;
  canSell: boolean;
}
