import React from 'react';

import { PremiumTabScreen } from '@/components/premium-tab-screen';
import { ticketColors } from '@/constants/ticket-theme';

export default function MyTicketsScreen() {
  return (
    <PremiumTabScreen
      accentColor={ticketColors.success}
      icon="ticket"
      eyebrow="My Tickets"
      title="Ready when doors open."
      body="Upcoming passes, transfer status, and entry details have a dedicated home."
      primaryMetric="No tickets yet"
      secondaryMetric="Your next event will appear here after checkout."
      actions={['Upcoming events', 'Past tickets', 'Transfers']}
    />
  );
}
