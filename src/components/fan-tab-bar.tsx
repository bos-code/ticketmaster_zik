import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useLinkBuilder } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';
import { TicketmasterTabIcon, type TicketmasterTabIconName } from '@/components/ticketmaster-tab-icon';
import { Text } from '@/components/ui/app-text';

const tabs: { route: string; label: string; icon: TicketmasterTabIconName }[] = [
  { route: 'discover', label: 'Home', icon: 'discover' },
  { route: 'for-you', label: 'Watchlist', icon: 'for-you' },
  { route: 'my-tickets', label: 'My Tickets', icon: 'my-tickets' },
  { route: 'my-account', label: 'Account', icon: 'my-account' },
];

export function FanTabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const insets = useImmersiveSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { buildHref } = useLinkBuilder();
  const wide = width >= 768;
  if (state.routes[state.index]?.name === 'add-event') return null;
  return <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8), paddingLeft: Math.max(insets.left, 8), paddingRight: Math.max(insets.right, 8) }]}>
    {tabs.map((tab) => {
      const route = state.routes.find((item) => item.name === tab.route);
      if (!route) return null;
      const focused = state.routes[state.index]?.key === route.key;
      return <PlatformPressable key={route.key} href={buildHref(route.name, route.params)}
        accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={tab.label}
        testID={descriptors[route.key].options.tabBarButtonTestID}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }}
        onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
        style={[styles.tab, wide && styles.wideTab]}>
        <TicketmasterTabIcon name={tab.icon} focused={focused} size={26} />
        <Text maxFontSizeMultiplier={1.5} numberOfLines={2} style={[styles.label, wide && styles.wideLabel, focused && styles.activeLabel]}>{tab.label}</Text>
      </PlatformPressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', flexShrink: 0, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#242424', paddingTop: 8 },
  tab: { flex: 1, minHeight: 48, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', gap: 4 },
  wideTab: { flexDirection: 'row', gap: 10 },
  label: { color: '#BDBDBD', fontSize: 11, lineHeight: 15, textAlign: 'center', flexShrink: 1 },
  wideLabel: { fontSize: 14, lineHeight: 20 },
  activeLabel: { color: '#FFFFFF', fontWeight: '700' },
});
