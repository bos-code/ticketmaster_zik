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

export const REFERENCE_TICKET_SCREEN_WIDTH = 749;
export const MIN_IPHONE_LAYOUT_WIDTH = 375;
export const MAX_IPHONE_LAYOUT_WIDTH = 440;

export function scaleTicketReferenceMetric(
  width: number,
  referencePixels: number,
  minimum: number,
  maximum: number,
) {
  const iphoneWidth = Math.min(
    MAX_IPHONE_LAYOUT_WIDTH,
    Math.max(MIN_IPHONE_LAYOUT_WIDTH, Math.round(width)),
  );

  return Math.round(
    Math.min(
      maximum,
      Math.max(
        minimum,
        (iphoneWidth * referencePixels) / REFERENCE_TICKET_SCREEN_WIDTH,
      ),
    ),
  );
}

export const HERO_IMAGE_HEIGHT = 155;
export const HERO_DETAIL_PANEL_HEIGHT = 123;
export const HERO_EXPANDED_HEIGHT =
  HERO_IMAGE_HEIGHT + HERO_DETAIL_PANEL_HEIGHT;
export const HERO_COLLAPSED_HEIGHT = 128;
export const HERO_COLLAPSE_DISTANCE =
  HERO_EXPANDED_HEIGHT - HERO_COLLAPSED_HEIGHT;

export function getTicketFlowHorizontalGutter(width: number) {
  return scaleTicketReferenceMetric(width, 28, 14, 16);
}

export function getTicketSummaryHeroImageHeight(width: number) {
  return scaleTicketReferenceMetric(width, 310, 155, 182);
}

export function getTicketSummaryViewButtonHeight(width: number) {
  return scaleTicketReferenceMetric(width, 70, 35, 41);
}

export function getTicketFlowPanelTabHeight(width: number) {
  return scaleTicketReferenceMetric(width, 90, 45, 53);
}

export function getTicketFlowOrderHeaderHeight(width: number) {
  return scaleTicketReferenceMetric(width, 139, 70, 82);
}

export function getTicketCardHeaderHeight(width: number) {
  return scaleTicketReferenceMetric(width, 59, 30, 35);
}

export function getTicketCardBodyHeight(width: number) {
  return scaleTicketReferenceMetric(width, 117, 59, 69);
}

export function getTicketDockWidth(width: number) {
  return scaleTicketReferenceMetric(width, 337, 169, 198);
}

export function getTicketDockHeight(width: number) {
  return scaleTicketReferenceMetric(width, 94, 47, 55);
}

export function getSummaryPhoneHeroBottomSpace(_width: number) {
  return 0;
}

export function getSummaryPhoneHeroImageExtraHeight(_width: number) {
  return 0;
}

export function getTicketSummaryHeroExpandedHeight(width: number) {
  return getTicketSummaryHeroImageHeight(width) + HERO_DETAIL_PANEL_HEIGHT;
}

export function getTicketSummaryHeroCollapseDistance(width: number) {
  return getTicketSummaryHeroExpandedHeight(width) - HERO_COLLAPSED_HEIGHT;
}

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
