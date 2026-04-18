import React from 'react';

import { PremiumTabScreen } from '@/components/premium-tab-screen';
import { ticketColors } from '@/constants/ticket-theme';

export default function DiscoverScreen() {
  return (
    <PremiumTabScreen
      accentColor={ticketColors.primary}
      icon="search"
      eyebrow="Discover"
      title="Find your next live moment."
      body="Concerts, sports, theater, and festivals with a sharp feed built for quick browsing."
      primaryMetric="Tonight near you"
      secondaryMetric="Fresh drops, verified seats, and late releases."
      actions={['Just announced', 'Top venues', 'Weekend plans']}
    />
  );
}
