import { useCallback, useMemo } from "react";

import {
  mapTicketRecordsToTicketOrders,
  ticketOrder,
  ticketOrders as fallbackTicketOrders,
} from "@/data/ticketOrder";
import { useTicketStore } from "@/store/ticketStore";
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
  const storeTickets = useTicketStore((state) => state.tickets);
  const ticketOrders = useMemo(
    () =>
      storeTickets.length
        ? mapTicketRecordsToTicketOrders(storeTickets)
        : fallbackTicketOrders,
    [storeTickets],
  );

  const resolvedTicketOrder = useMemo(
    () =>
      ticketOrders.find((candidateOrder) => candidateOrder.order.id === orderId) ??
      ticketOrders[0] ??
      ticketOrder,
    [orderId, ticketOrders],
  );

  const summaryViewModels = useMemo(
    () => ticketOrders.map((order) => createTicketSummaryViewModel(order)),
    [ticketOrders],
  );

  const upcomingSummaryViewModels = useMemo(() => {
    if (!storeTickets.length) {
      return summaryViewModels;
    }

    return storeTickets
      .filter((ticket) => ticket.status === "upcoming")
      .map((ticket) =>
        createTicketSummaryViewModel(mapTicketRecordsToTicketOrders([ticket])[0]),
      );
  }, [storeTickets, summaryViewModels]);

  const pastSummaryViewModels = useMemo(() => {
    if (!storeTickets.length) {
      return [];
    }

    return storeTickets
      .filter((ticket) => ticket.status === "past")
      .map((ticket) =>
        createTicketSummaryViewModel(mapTicketRecordsToTicketOrders([ticket])[0]),
      );
  }, [storeTickets]);

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
    ticketOrders,
    summaryViewModel,
    summaryViewModels,
    upcomingSummaryViewModels,
    pastSummaryViewModels,
    getDetailsViewModel,
    getTicketByIndex,
    getTicketById: getTicketForId,
    getTicketIndexById: getTicketIndexForId,
    ticketCount,
  };
}
