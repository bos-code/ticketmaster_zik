import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TicketmasterTabIcon,
  type TicketmasterTabIconName,
} from '@/components/ticketmaster-tab-icon';


type TabRouteName = 'discover' | 'for-you' | 'my-tickets' | 'add-event' | 'sell' | 'my-account';

type TabConfig = {
  title: string;
  icon: TicketmasterTabIconName;
};

const C = {
  active: '#0F56F4',
  inactive: '#7F8280',
  background: '#F2F2F7',
  border: '#D1D1D6', // Standard iOS separator color
} as const;

const accountFont = Platform.select({
  ios: 'SF Pro Text',
  android: 'sans-serif',
  web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  default: undefined,
});

const TAB_CONFIG: Record<TabRouteName, TabConfig> = {
  discover: {
    title: 'Discover',
    icon: 'discover',
  },
  'for-you': {
    title: 'For You',
    icon: 'for-you',
  },
  'my-tickets': {
    title: 'My Tickets',
    icon: 'my-tickets',
  },
  'add-event': {
    title: 'Admin',
    icon: 'my-account',
  },
  sell: {
    title: 'Sell',
    icon: 'sell',
  },
  'my-account': {
    title: 'Account',
    icon: 'my-account',
  },
};

export default function PremiumTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'web' ? 0 : insets.bottom;
  

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      initialRouteName="my-tickets"
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name as TabRouteName] ?? TAB_CONFIG.discover;

        return {
          headerShown: false,
          lazy: true,
          sceneStyle: { backgroundColor: C.background },
          tabBarAccessibilityLabel: config.title,
          tabBarInactiveTintColor: C.inactive,
          tabBarItemStyle: styles.tabItem,
          tabBarStyle: [
            styles.tabBar,
            {
              height: 49 + bottomInset,
              paddingBottom: bottomInset,
              backgroundColor: '#FFFFFF',
            },
          ],
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconWrap}>
              <TicketmasterTabIcon
                focused={focused}
                name={config.icon}
                size={25}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                styles.tabLabel,
                focused && styles.tabLabelActive,
                { color: focused ? C.active : C.inactive },
              ]}
            >
              {config.title}
            </Text>
          ),
        };
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="discover" options={{ title: TAB_CONFIG.discover.title }} />
      <Tabs.Screen name="for-you" options={{ title: TAB_CONFIG['for-you'].title }} />
      <Tabs.Screen name="my-tickets" options={{ title: TAB_CONFIG['my-tickets'].title }} />
      <Tabs.Screen name="add-event" options={{ href: null }} />
      <Tabs.Screen name="sell" options={{ title: TAB_CONFIG.sell.title }} />
      <Tabs.Screen name="my-account" options={{ title: TAB_CONFIG['my-account'].title }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    elevation: 8,
    paddingTop: 5,
  },
  tabItem: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
    minHeight: 28,
  },
  tabLabel: {
    marginTop: 1,
    fontFamily: accountFont,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 12,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
