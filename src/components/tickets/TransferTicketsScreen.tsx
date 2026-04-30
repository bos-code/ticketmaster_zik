import React from "react";

import { TicketTransferFlow } from "@/components/tickets/ticket-transfer-flow-impl";

export function TransferTicketsScreen({
  reservationId,
}: {
  reservationId?: string;
}) {
  return <TicketTransferFlow reservationId={reservationId} />;
}
