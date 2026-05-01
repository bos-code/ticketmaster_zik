import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { TransferTicketsScreen } from '@/components/tickets/TransferTicketsScreen';

export default function TicketsRoute() {
  const params = useLocalSearchParams<{
    reservationId?: string | string[];
    ticketId?: string | string[];
  }>();
  const reservationId = Array.isArray(params.reservationId)
    ? params.reservationId[0]
    : params.reservationId;
  const ticketId = Array.isArray(params.ticketId) ? params.ticketId[0] : params.ticketId;

  return <TransferTicketsScreen reservationId={reservationId} ticketId={ticketId} />;
}
