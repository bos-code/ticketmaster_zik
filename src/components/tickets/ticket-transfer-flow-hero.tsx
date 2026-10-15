import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Text } from '@/components/ui/app-text';
import { TicketStackIcon } from '@/components/ticketmaster-tab-icon';
import { HERO_COLLAPSED_HEIGHT, HERO_EXPANDED_HEIGHT } from '@/components/tickets/ticketFlowConstants';
import { useTicketFlowData } from '@/components/tickets/useTicketFlowData';

export function CollapsibleEventHero({ isHeroCollapsed, onBack, onOpenViewer, scrollY, collapseDistance, onHeightChange, height = HERO_EXPANDED_HEIGHT, topInset = 0 }: { isHeroCollapsed: boolean; onBack: () => void; onOpenViewer: () => void; scrollY: SharedValue<number>; collapseDistance: SharedValue<number>; onHeightChange?: (height: number) => void; height?: number; topInset?: number }) {
  const { event, order } = useTicketFlowData();
  const router = useRouter();
  const { width, height: windowHeight } = useWindowDimensions();
  // Artwork fills the status-bar area; only interactive content avoids the notch.
  const imageHeight = topInset + Math.max(100, Math.min(360, width * 0.435, windowHeight * 0.4));
  const expandedStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [0, collapseDistance.value], [1, 0], Extrapolation.CLAMP), transform: [{ translateY: -Math.min(Math.max(0, scrollY.value), collapseDistance.value) }] }));
  const collapsedStyle = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.value, [collapseDistance.value * 0.3, collapseDistance.value * 0.8], [0, 1], Extrapolation.CLAMP) }));
  return <View pointerEvents="box-none" style={[styles.hero, { height }]}>
    <Animated.View pointerEvents={isHeroCollapsed ? 'box-none' : 'none'} style={[styles.collapsed, { height: HERO_COLLAPSED_HEIGHT + topInset, paddingTop: topInset }, collapsedStyle]}>
      <Image source={event.heroImage} contentFit="cover" style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.48)' }]} />
      <Pressable accessibilityRole="button" accessibilityLabel="Back to My Tickets" onPress={onBack} style={styles.back}><Ionicons name="arrow-back" color="white" size={23} /></Pressable>
      <View style={styles.collapsedCopy}><Text numberOfLines={1} style={styles.collapsedTitle}>{event.title}</Text><Text numberOfLines={1} style={styles.collapsedVenue}>{event.venue}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="View Tickets" onPress={onOpenViewer} style={styles.collapsedViewer}><Ionicons name="barcode-outline" color="white" size={24} /></Pressable>
    </Animated.View>
    <Animated.View pointerEvents={isHeroCollapsed ? 'none' : 'box-none'} style={[styles.expanded, { height }, expandedStyle]}>
      <Image source={event.heroImage} contentFit="cover" style={[styles.image, { height: imageHeight }]} />
      <View style={[styles.heroActions, { top: topInset + 8 }]}><Pressable accessibilityRole="button" accessibilityLabel="Back to My Tickets" onPress={onBack} style={styles.back}><Ionicons name="arrow-back" color="white" size={23} /></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/account/help')} style={styles.help}><Text style={styles.helpText}>Help</Text></Pressable></View>
      <View style={[styles.eventCard, { top: imageHeight }]} onLayout={(event) => onHeightChange?.(imageHeight + event.nativeEvent.layout.height)}>
        <View style={styles.date}><Text style={styles.dateText}>{event.dateTime.toUpperCase()}</Text></View>
        <View style={styles.eventInfo}><Text numberOfLines={2} style={styles.title}>{event.title.toUpperCase()}</Text><View style={styles.venueRow}><Text numberOfLines={1} style={styles.venue}>{event.venue}</Text><TicketStackIcon size={19} color="#CCCCCC" /><Text style={styles.count}>x{order.ticketCount}</Text></View></View>
        <Pressable accessibilityRole="button" onPress={onOpenViewer} style={styles.viewTickets}><Ionicons name="barcode-outline" size={20} color="white" /><Text style={styles.viewTicketsLabel}>View Tickets</Text></Pressable>
      </View>
    </Animated.View>
  </View>;
}
const styles = StyleSheet.create({
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_EXPANDED_HEIGHT, zIndex: 20 }, expanded: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_EXPANDED_HEIGHT }, image: { height: 170, width: '100%' }, heroActions: { position: 'absolute', top: 8, left: 15, right: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }, help: { borderRadius: 22, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }, helpText: { color: 'white', fontSize: 16 },
  eventCard: { position: 'absolute', top: 170, left: 15, right: 15 }, date: { alignSelf: 'flex-start', maxWidth: '100%', marginTop: -25, paddingVertical: 4, paddingHorizontal: 10, minHeight: 25, justifyContent: 'center', backgroundColor: '#242424', zIndex: 1 }, dateText: { color: 'white', fontSize: 12, letterSpacing: 1, fontWeight: '600' }, eventInfo: { backgroundColor: '#242424', paddingHorizontal: 12, paddingTop: 14, paddingBottom: 17 }, title: { color: 'white', fontSize: 20, lineHeight: 27, fontWeight: '700' }, venueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }, venue: { flex: 1, color: '#CCCCCC', fontSize: 16, lineHeight: 23 }, count: { color: 'white', fontSize: 16, fontWeight: '600' }, viewTickets: { minHeight: 50, backgroundColor: '#0452D5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, viewTicketsLabel: { color: 'white', fontSize: 16, fontWeight: '600' },
  collapsed: { height: HERO_COLLAPSED_HEIGHT, overflow: 'hidden', backgroundColor: '#242424', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15 }, collapsedCopy: { flex: 1, minWidth: 0, gap: 5 }, collapsedTitle: { color: 'white', fontSize: 16, fontWeight: '700' }, collapsedVenue: { color: '#CCCCCC', fontSize: 14 }, collapsedViewer: { height: 44, width: 48, borderRadius: 22, backgroundColor: '#0452D5', alignItems: 'center', justifyContent: 'center' },
});
