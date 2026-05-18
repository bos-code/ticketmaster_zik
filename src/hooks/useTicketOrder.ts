import { useCallback, useMemo } from "react";

import { mapTicketRecordsToTicketOrders } from "@/data/ticketOrder";
import { useTicketStore } from "@/store/ticketStore";
import type {
  TicketDetailsViewModel,
  TicketItem,
  TicketOrderData,
} from "@/types/ticket";
import {
  createTicketDetailsViewModel,
  createTicketSummaryViewModel,
  getSelectedTicket,
  getTicketById,
  getTicketCount,
  getTicketIndexById,
} from "@/utils/ticketUtils";

const EMPTY_TICKET_DETAILS: TicketDetailsViewModel = {
  eventTitle: "",
  eventSubtitle: "",
  heroImage: undefined,
  activeTicket: getSelectedTicket([]),
  activeIndex: 0,
  totalTickets: 0,
  positionLabel: "0 of 0",
  canTransfer: false,
  canSell: false,
};

export function useTicketOrder(orderId?: string) {
  const storeTickets = useTicketStore((state) => state.tickets);
  const visibleStoreTickets = useMemo(
    () => storeTickets.filter((ticket) => !ticket.isHidden),
    [storeTickets],
  );
  const hasSyncedTickets = useTicketStore((state) => state.isSynced);
  const isLoadingTickets = !hasSyncedTickets && visibleStoreTickets.length === 0;
  const ticketOrders = useMemo(
    () =>
      visibleStoreTickets.length
        ? mapTicketRecordsToTicketOrders(visibleStoreTickets)
        : [],
    [visibleStoreTickets],
  );

  const resolvedTicketOrder = useMemo<TicketOrderData | null>(
    () => {
      if (!ticketOrders.length) {
        return null;
      }

      if (orderId) {
        return (
          ticketOrders.find(
            (candidateOrder) => candidateOrder.order.id === orderId,
          ) ?? null
        );
      }

      return ticketOrders[0];
    },
    [orderId, ticketOrders],
  );

  const summaryViewModels = useMemo(
    () => ticketOrders.map((order) => createTicketSummaryViewModel(order)),
    [ticketOrders],
  );

  const upcomingSummaryViewModels = useMemo(() => {
    if (!visibleStoreTickets.length) {
      return [];
    }

    return visibleStoreTickets
      .filter((ticket) => ticket.status === "upcoming")
      .map((ticket) =>
        createTicketSummaryViewModel(mapTicketRecordsToTicketOrders([ticket])[0]),
      );
  }, [visibleStoreTickets]);

  const pastSummaryViewModels = useMemo(() => {
    if (!visibleStoreTickets.length) {
      return [];
    }

    return visibleStoreTickets
      .filter((ticket) => ticket.status === "past")
      .map((ticket) =>
        createTicketSummaryViewModel(mapTicketRecordsToTicketOrders([ticket])[0]),
      );
  }, [visibleStoreTickets]);

  const summaryViewModel = useMemo(
    () =>
      resolvedTicketOrder
        ? createTicketSummaryViewModel(resolvedTicketOrder)
        : null,
    [resolvedTicketOrder],
  );

  const getDetailsViewModel = useCallback(
    (activeIndex: number) =>
      resolvedTicketOrder
        ? createTicketDetailsViewModel(resolvedTicketOrder, activeIndex)
        : EMPTY_TICKET_DETAILS,
    [resolvedTicketOrder],
  );

  const getTicketByIndex = useCallback(
    (ticketIndex?: number): TicketItem =>
      getSelectedTicket(resolvedTicketOrder?.tickets ?? [], ticketIndex),
    [resolvedTicketOrder],
  );

  const getTicketForId = useCallback(
    (ticketId?: string): TicketItem =>
      getTicketById(resolvedTicketOrder?.tickets ?? [], ticketId),
    [resolvedTicketOrder],
  );

  const getTicketIndexForId = useCallback(
    (ticketId?: string) =>
      getTicketIndexById(resolvedTicketOrder?.tickets ?? [], ticketId),
    [resolvedTicketOrder],
  );

  const ticketCount = useMemo(
    () => (resolvedTicketOrder ? getTicketCount(resolvedTicketOrder) : 0),
    [resolvedTicketOrder],
  );

  return {
    hasSyncedTickets,
    isLoadingTickets,
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
