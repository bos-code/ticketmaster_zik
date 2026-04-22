import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { EventReservationFlow } from '@/components/events/event-reservation-flow';

export default function EventDetailRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <EventReservationFlow eventId={eventId ?? ''} />;
}
