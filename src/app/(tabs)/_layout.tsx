import React from 'react';
import { Tabs } from 'expo-router';
import { FanTabBar } from '@/components/fan-tab-bar';

export default function PremiumTabsLayout() {
  return <Tabs initialRouteName="discover" tabBar={(props) => <FanTabBar {...props} />} screenOptions={{ headerShown: false, lazy: true, sceneStyle: { backgroundColor: '#111111' } }}>
    <Tabs.Screen name="index" options={{ href: null }} />
    <Tabs.Screen name="discover" options={{ title: 'Home' }} />
    <Tabs.Screen name="for-you" options={{ title: 'Watchlist' }} />
    <Tabs.Screen name="my-tickets" options={{ title: 'My Tickets' }} />
    <Tabs.Screen name="my-account" options={{ title: 'Account' }} />
    <Tabs.Screen name="add-event" options={{ href: null }} />
    <Tabs.Screen name="sell" options={{ href: null }} />
  </Tabs>;
}
