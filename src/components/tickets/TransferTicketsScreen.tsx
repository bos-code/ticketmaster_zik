import React from "react";

import { TicketTransferFlow } from "@/components/tickets/ticket-transfer-flow-impl";

export function TransferTicketsScreen({
  initialScreen,
  initialTicketIndex,
  initialTicketId,
  orderId,
}: {
  initialScreen?: "list" | "viewer";
  initialTicketIndex?: number;
  initialTicketId?: string;
  orderId?: string;
}) {
  return (
    <TicketTransferFlow
      initialScreen={initialScreen}
      initialTicketIndex={initialTicketIndex}
      initialTicketId={initialTicketId}
      orderId={orderId}
    />
  );
}
