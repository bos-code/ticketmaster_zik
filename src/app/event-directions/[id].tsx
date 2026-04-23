import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { EventDirectionsScreen } from '@/components/events/event-directions-screen';

export default function EventDirectionsRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  return <EventDirectionsScreen eventId={eventId ?? ''} />;
}
