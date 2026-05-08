import React from "react";

import { TicketTransferFlow } from "@/components/tickets/ticket-transfer-flow-impl";

export function TransferTicketsScreen({
  initialScreen,
  initialTicketIndex,
  orderId,
}: {
  initialScreen?: "list" | "viewer";
  initialTicketIndex?: number;
  orderId?: string;
}) {
  return (
    <TicketTransferFlow
      initialScreen={initialScreen}
      initialTicketIndex={initialTicketIndex}
      orderId={orderId}
    />
  );
}
