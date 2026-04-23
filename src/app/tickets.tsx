import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { TicketTransferFlow } from '@/components/tickets/ticket-transfer-flow';

export default function TicketsRoute() {
  const params = useLocalSearchParams<{ reservationId?: string | string[] }>();
  const reservationId = Array.isArray(params.reservationId)
    ? params.reservationId[0]
    : params.reservationId;

  return <TicketTransferFlow reservationId={reservationId} />;
}
