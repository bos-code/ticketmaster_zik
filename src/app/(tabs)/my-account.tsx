import React from 'react';

import { PremiumTabScreen } from '@/components/premium-tab-screen';
import { ticketColors } from '@/constants/ticket-theme';

export default function MyAccountScreen() {
  return (
    <PremiumTabScreen
      accentColor={ticketColors.primaryBright}
      icon="person"
      eyebrow="My Account"
      title="Profile, payments, and preferences."
      body="Account controls can stay compact while keeping the premium ticketing feel."
      primaryMetric="Signed out"
      secondaryMetric="Connect auth here when the backend is ready."
      actions={['Profile details', 'Payment methods', 'Notifications']}
    />
  );
}
