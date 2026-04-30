import { useContext } from "react";

import { TicketFlowContext } from "@/components/tickets/TicketFlowContext";

export function useTicketFlowData() {
  const context = useContext(TicketFlowContext);
  if (!context) {
    throw new Error("Ticket flow data is unavailable.");
  }
  return context;
}
