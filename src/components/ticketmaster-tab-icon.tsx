import { ticketmasterTabIconSources } from "../../asset-sources";

import { Image, StyleSheet } from "react-native";

export type TicketmasterTabIconName =
  | 'discover'
  | 'for-you'
  | 'my-tickets'
  | 'sell'
  | 'my-account';

type TicketmasterTabIconProps = {
  focused?: boolean;
  name: TicketmasterTabIconName;
  size?: number;
};

export function TicketmasterTabIcon({
  focused = false,
  name,
  size = 25,
}: TicketmasterTabIconProps) {
  const source = focused
    ? ticketmasterTabIconSources[name].active
    : ticketmasterTabIconSources[name].inactive;

  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={source}
      style={[styles.icon, { height: size, width: size }]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    flexShrink: 0,
  },
});
