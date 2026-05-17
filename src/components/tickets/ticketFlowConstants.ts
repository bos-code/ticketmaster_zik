import type { ExtraCard, Seat } from '@/components/tickets/ticketFlowTypes';

export const EMPTY_SEATS: Seat[] = [];

export const EXTRA_CARDS: ExtraCard[] = [
  {
    id: 'entry',
    icon: 'walk-outline',
    title: 'Entry Tips',
    body: 'Bring a charged phone, your active ticket, and a matching photo ID for faster entry.',
  },
  {
    id: 'delivery',
    icon: 'phone-portrait-outline',
    title: 'Mobile Delivery',
    body: 'Tickets stay live in-app and refresh automatically, so screenshots will not be accepted.',
  },
  {
    id: 'policy',
    icon: 'shield-checkmark-outline',
    title: 'Venue Policy',
    body: 'Bag rules and door times can change. Check venue updates before you leave.',
  },
];

export const HERO_IMAGE_HEIGHT = 240;
export const HERO_DETAIL_PANEL_HEIGHT = 122;
export const HERO_EXPANDED_HEIGHT =
  HERO_IMAGE_HEIGHT + HERO_DETAIL_PANEL_HEIGHT;
export const HERO_COLLAPSED_HEIGHT = 128;
export const HERO_COLLAPSE_DISTANCE =
  HERO_EXPANDED_HEIGHT - HERO_COLLAPSED_HEIGHT;

export const absoluteFill = {
  bottom: 0,
  left: 0,
  position: 'absolute' as const,
  right: 0,
  top: 0,
};

export const floatingShadow = {
  elevation: 12,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.14,
  shadowRadius: 22,
};

export const softPillShadow = {
  elevation: 6,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
};
