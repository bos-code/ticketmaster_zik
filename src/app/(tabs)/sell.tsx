import React from 'react';

import { PremiumTabScreen } from '@/components/premium-tab-screen';
import { ticketColors } from '@/constants/ticket-theme';

export default function SellScreen() {
  return (
    <PremiumTabScreen
      accentColor={ticketColors.warning}
      actions={['Create listing', 'Active listings', 'Payouts']}
      body="Resale tools, pricing signals, and payout status can plug into this screen."
      eyebrow="Sell"
      icon="pricetag"
      primaryMetric="Sell smarter"
      secondaryMetric="Keep listings clear, verified, and easy to manage."
      title="List seats with confidence."
    />
  );
}
