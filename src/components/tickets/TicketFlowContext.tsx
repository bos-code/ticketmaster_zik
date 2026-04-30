import { createContext } from "react";

import type { TicketFlowContextValue } from "@/components/tickets/ticketFlowTypes";

export const TicketFlowContext = createContext<TicketFlowContextValue | null>(null);
