import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';

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

const tabIconSources: Record<
  TicketmasterTabIconName,
  { active: ImageSourcePropType; inactive: ImageSourcePropType }
> = {
  discover: {
    active: require('../../assets/tabicon/discover.png'),
    inactive: require('../../assets/tabicon/discover copy.png'),
  },
  'for-you': {
    active: require('../../assets/tabicon/for you_.png'),
    inactive: require('../../assets/tabicon/for you  copy.png'),
  },
  'my-tickets': {
    active: require('../../assets/tabicon/tickets.png'),
    inactive: require('../../assets/tabicon/tickets copy.png'),
  },
  sell: {
    active: require('../../assets/tabicon/sell.png'),
    inactive: require('../../assets/tabicon/sell copy.png'),
  },
  'my-account': {
    active: require('../../assets/tabicon/account_.png'),
    inactive: require('../../assets/tabicon/account  copy.png'),
  },
};

export function TicketmasterTabIcon({
  focused = false,
  name,
  size = 25,
}: TicketmasterTabIconProps) {
  const source = focused ? tabIconSources[name].active : tabIconSources[name].inactive;

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
