import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { EventReservationFlow } from '@/components/events/event-reservation-flow';
import { SampleEventDetail } from '@/components/discovery/sample-event-detail';
import { selectEventById, useEventStore } from '@/store/use-event-store';

export default function EventDetailRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const event = useEventStore((state) => selectEventById(state, eventId ?? ''));

  if (event?.sample) return <SampleEventDetail event={event} />;

  return <EventReservationFlow eventId={eventId ?? ''} />;
}
