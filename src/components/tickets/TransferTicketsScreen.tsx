import React from "react";

import { TicketTransferFlow } from "@/components/tickets/ticket-transfer-flow-impl";

export function TransferTicketsScreen({
  reservationId,
  ticketId,
}: {
  reservationId?: string;
  ticketId?: string;
}) {
  return <TicketTransferFlow reservationId={reservationId} ticketId={ticketId} />;
}
