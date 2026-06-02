import { useEffect } from 'react';

import {
  ensureFirebaseSeedData,
  subscribeToAdminSettings,
  subscribeToEvents,
  subscribeToReservations,
  subscribeToTickets,
} from '@/lib/firebase-data';
import { useEventStore } from '@/store/use-event-store';
import { useAppStore } from '@/store/use-app-store';
import { useTicketStore } from '@/store/ticketStore';

export function useFirebaseDataSync() {
  useEffect(() => {
    let isActive = true;
    const unsubscribeHandlers: (() => void)[] = [];

    void (async () => {
      try {
        unsubscribeHandlers.push(
          subscribeToAdminSettings((settings) => {
            useAppStore
              .getState()
              .setTransferSenderName(settings.transferSenderName);
          }),
        );
        unsubscribeHandlers.push(
          subscribeToTickets((tickets) => {
            useTicketStore.getState().replaceTickets(tickets);
          }),
        );

        await ensureFirebaseSeedData().catch((error) => {
          console.warn('Firebase seed data could not be written.', error);
        });

        if (!isActive) {
          return;
        }

        unsubscribeHandlers.push(
          subscribeToEvents((events) => {
            useEventStore.getState().replaceEvents(events);
          }),
        );
        unsubscribeHandlers.push(
          subscribeToReservations((reservations) => {
            useEventStore.getState().replaceReservations(reservations);
          }),
        );
      } catch (error) {
        console.warn('Firebase data sync could not start.', error);
      }
    })();

    return () => {
      isActive = false;
      unsubscribeHandlers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
}
