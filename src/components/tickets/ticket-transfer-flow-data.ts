import type {
  TicketFlowContextValue,
} from "@/components/tickets/ticketFlowTypes";
import type { TicketOrderData, TicketSummaryViewModel } from "@/types/ticket";

export function buildTicketFlowDataFromOrder(
  order: TicketOrderData,
  summaryViewModel: TicketSummaryViewModel,
): TicketFlowContextValue {
  return {
    event: {
      directionsEventId: undefined,
      id: order.event.id,
      title: summaryViewModel.eventTitle,
      shortTitle: summaryViewModel.eventTitle,
      venue: summaryViewModel.eventVenue,
      venueAddress: summaryViewModel.eventVenueAddress ?? summaryViewModel.eventVenue,
      venueSummary: `${summaryViewModel.eventTitle} at ${summaryViewModel.eventVenue}`,
      dateTime: summaryViewModel.eventFullDateTimeLabel,
      headerSubtitle: `${summaryViewModel.eventTime} - ${summaryViewModel.eventVenue}`,
      heroImage: summaryViewModel.heroImage,
      latitude: summaryViewModel.latitude,
      longitude: summaryViewModel.longitude,
      mapImageUrl: "",
    },
    order: {
      id: order.order.id,
      orderNumber: summaryViewModel.orderNumber,
      ticketCount: summaryViewModel.ticketCount,
      ticketCountLabel: summaryViewModel.ticketCountLabel,
    },
    orderId: summaryViewModel.orderId,
    seats: order.tickets.map((ticket) => ({
      id: ticket.id,
      ticketIndex: ticket.ticketIndex,
      label: ticket.type,
      note: ticket.seatingCategory,
      row: ticket.row,
      seat: ticket.seat,
      section: ticket.section,
      barcodeValue: ticket.barcodeValue,
      canTransfer: ticket.canTransfer,
      canSell: ticket.canSell,
    })),
  };
}
