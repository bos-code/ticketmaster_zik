import { useLocalSearchParams } from "expo-router";
import React from "react";

import { TransferTicketsScreen } from "@/components/tickets/TransferTicketsScreen";

export default function TicketOrderDetailsRoute() {
  const params = useLocalSearchParams<{
    orderId?: string | string[];
    ticketId?: string | string[];
    ticketIndex?: string | string[];
  }>();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const ticketId = Array.isArray(params.ticketId)
    ? params.ticketId[0]
    : params.ticketId;
  const rawTicketIndex = Array.isArray(params.ticketIndex)
    ? params.ticketIndex[0]
    : params.ticketIndex;
  const ticketIndex = Number.parseInt(rawTicketIndex ?? "", 10);

  return (
    <TransferTicketsScreen
      initialScreen="viewer"
      initialTicketId={ticketId}
      initialTicketIndex={Number.isFinite(ticketIndex) ? ticketIndex : 0}
      orderId={orderId}
    />
  );
}
