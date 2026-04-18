import React from 'react';

import { PremiumTabScreen } from '@/components/premium-tab-screen';

export default function ForYouScreen() {
  return (
    <PremiumTabScreen
      accentColor="#FF4D8D"
      icon="heart"
      eyebrow="For You"
      title="Your live list, tuned in."
      body="Saved artists, favorite teams, and event alerts can land here when you connect real data."
      primaryMetric="Matches waiting"
      secondaryMetric="Personal picks for the next city night."
      actions={['Favorite artists', 'Nearby picks', 'Price alerts']}
    />
  );
}
