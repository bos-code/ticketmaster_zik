import React from 'react';
import type { CSSProperties } from 'react';
import {
  IoAppsOutline,
  IoCardOutline,
  IoChatbubbleOutline,
  IoChevronForward,
  IoCreateOutline,
  IoDocumentTextOutline,
  IoFlagOutline,
  IoHelpCircleOutline,
  IoLocationOutline,
  IoMailOutline,
  IoNotificationsOutline,
  IoPaperPlaneOutline,
  IoPencilOutline,
  IoPerson,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
  IoShieldOutline,
  IoTicketOutline,
  IoWalletOutline,
} from 'react-icons/io5';
import type { IconType } from 'react-icons';

export type AccountIconName =
  | 'apps-outline'
  | 'bell-outline'
  | 'card-outline'
  | 'chatbubble-outline'
  | 'chevron-forward'
  | 'create-outline'
  | 'document-text-outline'
  | 'edit-outline'
  | 'envelope-outline'
  | 'flag-outline'
  | 'heart-outline'
  | 'help-circle-outline'
  | 'location-outline'
  | 'paper-plane-outline'
  | 'person'
  | 'search-outline'
  | 'shield-checkmark-outline'
  | 'shield-outline'
  | 'ticket-outline'
  | 'wallet-outline';

type WebMappedAccountIconName = Exclude<AccountIconName, 'heart-outline'>;

const webIconByAccountIcon: Record<WebMappedAccountIconName, IconType> = {
  'apps-outline': IoAppsOutline,
  'bell-outline': IoNotificationsOutline,
  'card-outline': IoCardOutline,
  'chatbubble-outline': IoChatbubbleOutline,
  'chevron-forward': IoChevronForward,
  'create-outline': IoCreateOutline,
  'document-text-outline': IoDocumentTextOutline,
  'edit-outline': IoPencilOutline,
  'envelope-outline': IoMailOutline,
  'flag-outline': IoFlagOutline,
  'help-circle-outline': IoHelpCircleOutline,
  'location-outline': IoLocationOutline,
  'paper-plane-outline': IoPaperPlaneOutline,
  person: IoPerson,
  'search-outline': IoSearchOutline,
  'shield-checkmark-outline': IoShieldCheckmarkOutline,
  'shield-outline': IoShieldOutline,
  'ticket-outline': IoTicketOutline,
  'wallet-outline': IoWalletOutline,
};

const iconStyle: CSSProperties = {
  display: 'block',
  flexShrink: 0,
  overflow: 'visible',
};

type AccountIconProps = {
  color: string;
  name: AccountIconName;
  size: number;
};

export function AccountIcon({ color, name, size }: AccountIconProps) {
  if (name === 'heart-outline') {
    return (
      <svg
        fill="none"
        height={size}
        style={iconStyle}
        viewBox="0 0 24 24"
        width={size}
      >
        <path
          d="M12 21L4 13.5L3 9L6 5L10 6L12 8L14 6L18 5L21 9L20 13.5L12 21Z"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  const Icon = webIconByAccountIcon[name];

  return <Icon color={color} size={size} style={iconStyle} />;
}
