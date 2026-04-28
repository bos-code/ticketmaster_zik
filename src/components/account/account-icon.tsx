import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { HeartIcon } from '@/components/heart-icon';

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

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const nativeIconNameByAccountIcon: Record<AccountIconName, IoniconsName> = {
  'apps-outline': 'apps-outline',
  'bell-outline': 'notifications-outline',
  'card-outline': 'card-outline',
  'chatbubble-outline': 'chatbubble-outline',
  'chevron-forward': 'chevron-forward',
  'create-outline': 'create-outline',
  'document-text-outline': 'document-text-outline',
  'edit-outline': 'pencil-outline',
  'envelope-outline': 'mail-outline',
  'flag-outline': 'flag-outline',
  'heart-outline': 'heart-outline',
  'help-circle-outline': 'help-circle-outline',
  'location-outline': 'location-outline',
  'paper-plane-outline': 'paper-plane-outline',
  person: 'person',
  'search-outline': 'search-outline',
  'shield-checkmark-outline': 'shield-checkmark-outline',
  'shield-outline': 'shield-outline',
  'ticket-outline': 'ticket-outline',
  'wallet-outline': 'wallet-outline',
};

type AccountIconProps = {
  color: string;
  name: AccountIconName;
  size: number;
};

export function AccountIcon({ color, name, size }: AccountIconProps) {
  if (name === 'heart-outline') {
    return (
      <HeartIcon
        color={color}
        size={size}
        style={{ overflow: 'visible', width: size + 4 }}
      />
    );
  }

  return (
    <Ionicons
      color={color}
      name={nativeIconNameByAccountIcon[name]}
      size={size}
      style={{ overflow: 'visible', width: size + 4, textAlign: 'center' }}
    />
  );
}
