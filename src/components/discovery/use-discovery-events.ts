import { useMemo } from 'react';
import { useEventStore } from '@/store/use-event-store';
import { toDiscoveryEvent } from './discovery-data';

export function useDiscoveryEvents() {
  const events = useEventStore((state) => state.events);
  return useMemo(() => events.filter((event) => event.discoverable !== false).map(toDiscoveryEvent), [events]);
}
