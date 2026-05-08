import { useLocalSearchParams } from "expo-router";
import React from "react";

import { TransferTicketsScreen } from "@/components/tickets/TransferTicketsScreen";

export default function TicketsIndexRoute() {
  const params = useLocalSearchParams<{
    orderId?: string | string[];
  }>();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  return <TransferTicketsScreen initialScreen="list" orderId={orderId} />;
}
