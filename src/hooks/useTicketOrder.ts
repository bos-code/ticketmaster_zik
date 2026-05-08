import { useCallback, useMemo } from "react";

import { ticketOrder, ticketOrders } from "@/data/ticketOrder";
import type { TicketItem } from "@/types/ticket";
import {
  createTicketDetailsViewModel,
  createTicketSummaryViewModel,
  getSelectedTicket,
  getTicketById,
  getTicketCount,
  getTicketIndexById,
} from "@/utils/ticketUtils";

export function useTicketOrder(orderId?: string) {
  const resolvedTicketOrder = useMemo(
    () =>
      ticketOrders.find((candidateOrder) => candidateOrder.order.id === orderId) ??
      ticketOrder,
    [orderId],
  );

  const summaryViewModel = useMemo(
    () => createTicketSummaryViewModel(resolvedTicketOrder),
    [resolvedTicketOrder],
  );

  const getDetailsViewModel = useCallback(
    (activeIndex: number) =>
      createTicketDetailsViewModel(resolvedTicketOrder, activeIndex),
    [resolvedTicketOrder],
  );

  const getTicketByIndex = useCallback(
    (ticketIndex?: number): TicketItem =>
      getSelectedTicket(resolvedTicketOrder.tickets, ticketIndex),
    [resolvedTicketOrder],
  );

  const getTicketForId = useCallback(
    (ticketId?: string): TicketItem =>
      getTicketById(resolvedTicketOrder.tickets, ticketId),
    [resolvedTicketOrder],
  );

  const getTicketIndexForId = useCallback(
    (ticketId?: string) =>
      getTicketIndexById(resolvedTicketOrder.tickets, ticketId),
    [resolvedTicketOrder],
  );

  const ticketCount = useMemo(
    () => getTicketCount(resolvedTicketOrder),
    [resolvedTicketOrder],
  );

  return {
    ticketOrder: resolvedTicketOrder,
    summaryViewModel,
    getDetailsViewModel,
    getTicketByIndex,
    getTicketById: getTicketForId,
    getTicketIndexById: getTicketIndexForId,
    ticketCount,
  };
}
