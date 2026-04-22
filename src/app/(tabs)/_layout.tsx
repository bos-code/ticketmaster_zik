import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ticketColors, ticketSpacing, ticketTypography } from '@/constants/ticket-theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type TabRouteName = 'discover' | 'for-you' | 'my-tickets' | 'sell' | 'my-account';

type TabConfig = {
  title: string;
  icon: IconName;
  activeIcon: IconName;
};

const TAB_CONFIG: Record<TabRouteName, TabConfig> = {
  discover: {
    title: 'Discover',
    icon: 'search-outline',
    activeIcon: 'search',
  },
  'for-you': {
    title: 'For You',
    icon: 'heart-outline',
    activeIcon: 'heart',
  },
  'my-tickets': {
    title: 'My Tickets',
    icon: 'ticket-outline',
    activeIcon: 'ticket',
  },
  sell: {
    title: 'Sell',
    icon: 'pricetag-outline',
    activeIcon: 'pricetag',
  },
  'my-account': {
    title: 'My Account',
    icon: 'person-outline',
    activeIcon: 'person',
  },
};

export default function PremiumTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 14);
  const tabBarHeight = 50 + bottomPadding;

  return (
    <Tabs
      initialRouteName="discover"
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name as TabRouteName] ?? TAB_CONFIG.discover;

        return {
          headerShown: false,
          lazy: true,
          sceneStyle: { backgroundColor: ticketColors.background },
          tabBarAccessibilityLabel: config.title,
          tabBarActiveTintColor: ticketColors.text,
          tabBarHideOnKeyboard: true,
          tabBarInactiveTintColor: ticketColors.textSubtle,
          tabBarItemStyle: styles.tabItem,
          tabBarStyle: [
            styles.tabBar,
            {
              height: tabBarHeight,
              paddingBottom: bottomPadding,
            },
          ],
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? config.activeIcon : config.icon}
                color={color}
                size={focused ? 22 : 20}
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                styles.tabLabel,
                focused && styles.tabLabelActive,
                { color },
              ]}>
              {config.title}
            </Text>
          ),
        };
      }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="discover" options={{ title: TAB_CONFIG.discover.title }} />
      <Tabs.Screen name="for-you" options={{ title: TAB_CONFIG['for-you'].title }} />
      <Tabs.Screen name="my-tickets" options={{ title: TAB_CONFIG['my-tickets'].title }} />
      <Tabs.Screen name="sell" options={{ title: TAB_CONFIG.sell.title }} />
      <Tabs.Screen name="my-account" options={{ title: TAB_CONFIG['my-account'].title }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: ticketColors.chrome,
    borderTopColor: ticketColors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    paddingTop: ticketSpacing.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    paddingHorizontal: 0,
    paddingTop: ticketSpacing.xxs,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 22,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: ticketTypography.labelSize,
    lineHeight: 12,
    fontWeight: '600',
    letterSpacing: ticketTypography.letterSpacing,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
