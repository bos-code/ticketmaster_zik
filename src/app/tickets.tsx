import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { TransferTicketsScreen } from '@/components/tickets/TransferTicketsScreen';

export default function TicketsRoute() {
  const params = useLocalSearchParams<{ reservationId?: string | string[] }>();
  const reservationId = Array.isArray(params.reservationId)
    ? params.reservationId[0]
    : params.reservationId;

  return <TransferTicketsScreen reservationId={reservationId} />;
}
