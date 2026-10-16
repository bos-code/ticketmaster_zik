import { Ionicons } from '@expo/vector-icons';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';
import { Text } from '@/components/ui/app-text';
import { BottomDrawer } from '@/components/ui/bottom-drawer';
import { TicketCard } from '@/components/tickets/ticket-card';
import { useTicketFlowData } from '@/components/tickets/useTicketFlowData';
import type { Seat } from '@/components/tickets/ticketFlowTypes';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { getViewerLayout } from '@/lib/fan-layout';
import { getTicketPositionLabel } from '@/utils/ticketUtils';
import { useIsFocused } from '@react-navigation/native';
import { useTicketTilt } from '@/hooks/use-ticket-tilt';

export function TicketTransferViewerScreen({ onBack, onViewerIndexChange, seats, viewerIndex }: {
  carouselCardWidth: number;
  carouselSnapInterval: number;
  onBack: () => void;
  onViewerIndexChange: (index: number) => void;
  seats: Seat[];
  viewerIndex: number;
}) {
  const { event, order } = useTicketFlowData();
  const insets = useImmersiveSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { cardWidth, sidePadding, snapInterval } = getViewerLayout(layout.width);
  const viewerListRef = useRef<FlatList<Seat>>(null);
  const scrollIndexRef = useRef(viewerIndex);
  const alignedIntervalRef = useRef<number | null>(null);
  const [cardHeight, setCardHeight] = useState(550);
  const [isTicketInfoOpen, setIsTicketInfoOpen] = useState(false);
  const [isWalletInfoOpen, setIsWalletInfoOpen] = useState(false);
  const focused = useIsFocused();
  const motion = useTicketTilt(focused && !isTicketInfoOpen && !isWalletInfoOpen);
  const activeIndex = Math.max(0, Math.min(seats.length - 1, viewerIndex));
  const activeSeat = seats[activeIndex];
  useEffect(() => {
    // A swipe already moved the list. Only align for external navigation or
    // changed geometry; scrolling again on every swipe would interrupt it.
    if (alignedIntervalRef.current === snapInterval && scrollIndexRef.current === activeIndex) return;
    const frame = requestAnimationFrame(() => {
      alignedIntervalRef.current = snapInterval;
      scrollIndexRef.current = activeIndex;
      viewerListRef.current?.scrollToOffset({ animated: false, offset: activeIndex * snapInterval });
    });
    return () => cancelAnimationFrame(frame);
  }, [snapInterval, activeIndex]);
  function updateIndex(event: NativeSyntheticEvent<NativeScrollEvent>) {
    // Ignore offsets from the old geometry until the resized list is aligned.
    if (!seats.length || alignedIntervalRef.current !== snapInterval ||
      Math.abs(event.nativeEvent.layoutMeasurement.width - layout.width) > 1) return;
    const index = Math.max(0, Math.min(seats.length - 1, Math.round(event.nativeEvent.contentOffset.x / snapInterval)));
    if (index !== scrollIndexRef.current) {
      scrollIndexRef.current = index;
      onViewerIndexChange(index);
    }
  }
  return <View style={[styles.root, { paddingTop: Math.max(insets.top, 12), paddingLeft: insets.left, paddingRight: insets.right }]}>
    <Head><meta name="theme-color" content="#111111" /><meta name="color-scheme" content="dark" /></Head>
    <StatusBar style="light" backgroundColor="#111111" />
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 16) }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to event" onPress={onBack} style={styles.iconButton}><Ionicons name="arrow-back" size={25} color="#FFFFFF" /></Pressable>
        <View style={styles.headerCopy}><Text numberOfLines={2} style={styles.title}>{event.shortTitle}</Text><Text numberOfLines={1} style={styles.subtitle}>{event.dateTime} · {event.venue}</Text></View>
        <View style={styles.headerSpacer} />
      </View>
      <View onLayout={layout.onLayout}>
        <FlatList ref={viewerListRef} data={seats} horizontal nestedScrollEnabled
          style={{ height: cardHeight + 24, flexGrow: 0 }}
          contentContainerStyle={{ paddingLeft: sidePadding, paddingRight: Math.max(0, sidePadding - 12), paddingTop: 12, paddingBottom: 12, alignItems: 'flex-start' }}
          keyExtractor={(seat) => seat.id}
          getItemLayout={(_, index) => ({ index, length: snapInterval, offset: snapInterval * index })}
          renderItem={({ item, index }) => <TicketCard cardWidth={cardWidth} seat={item} index={index} motion={motion} onLayout={(e) => setCardHeight((current) => Math.max(index === 0 ? 0 : current, e.nativeEvent.layout.height))} />}
          onScroll={updateIndex} scrollEventThrottle={16}
          onMomentumScrollEnd={updateIndex} onScrollEndDrag={updateIndex} decelerationRate="fast"
          showsHorizontalScrollIndicator={false} snapToInterval={snapInterval} snapToAlignment="start" />
      </View>
      <View style={styles.footer}>
        <View style={styles.pagination}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous ticket" disabled={!seats.length || activeIndex === 0} onPress={() => onViewerIndexChange(activeIndex - 1)} style={styles.iconButton}><Ionicons name="chevron-back" size={22} color={activeIndex === 0 ? '#666666' : '#FFFFFF'} /></Pressable>
          <Text accessibilityLiveRegion="polite" style={[styles.position, styles.positionPill]}>{getTicketPositionLabel(activeIndex, seats.length)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Next ticket" disabled={activeIndex >= seats.length - 1} onPress={() => onViewerIndexChange(activeIndex + 1)} style={styles.iconButton}><Ionicons name="chevron-forward" size={22} color={activeIndex >= seats.length - 1 ? '#666666' : '#FFFFFF'} /></Pressable>
        </View>
        <View style={[styles.footerActions, layout.width < 360 && { gap: 12 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Apple Wallet availability" onPress={() => setIsWalletInfoOpen(true)} style={styles.walletButton}>
            <View style={styles.walletMark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><View style={{ height: 5, backgroundColor: '#79B5C4' }} /><View style={{ height: 5, backgroundColor: '#E0BC54' }} /><View style={{ height: 5, backgroundColor: '#CF737E' }} /></View><Text style={styles.walletLabel}><Text style={styles.walletSmall}>Add to{String.fromCharCode(10)}</Text>Apple Wallet</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setIsTicketInfoOpen(true)} style={styles.infoButton}><Ionicons name="information-circle" size={24} color="#FFFFFF" /><Text style={styles.position}>Ticket Info</Text></Pressable>
        </View>
      </View>
    </ScrollView>
    <BottomDrawer minHeight="55%" onClose={() => setIsTicketInfoOpen(false)} visible={isTicketInfoOpen}>
      <View style={styles.drawer}>
        <Text style={styles.drawerTitle}>Ticket Info</Text>
        <Text style={styles.drawerEvent}>{event.title}</Text>
        <Text style={styles.drawerBody}>{event.dateTime}{String.fromCharCode(10)}{event.venue}</Text>
        <Text style={styles.drawerBody}>{`Order ${order.orderNumber}`}</Text>
        {activeSeat && <>
          <Text style={styles.drawerEvent}>{activeSeat.label || 'Standard seating'}</Text>
          <Text style={styles.drawerBody}>{`Section ${activeSeat.section} • Row ${activeSeat.row} • Seat ${activeSeat.seat}`}</Text>
          <Text style={styles.drawerBody}>{activeSeat.note}</Text>
          {activeSeat.entryInstructions?.trim() ? <Text style={styles.drawerBody}>{activeSeat.entryInstructions}</Text> : null}
          <Text style={styles.drawerBody}>{activeSeat.canTransfer ? 'Eligible for transfer' : 'Transfer unavailable'}</Text>
        </>}
        <Pressable accessibilityRole="button" style={styles.closeButton} onPress={() => setIsTicketInfoOpen(false)}><Text style={styles.closeLabel}>Close</Text></Pressable>
      </View>
    </BottomDrawer>
    <BottomDrawer minHeight="40%" onClose={() => setIsWalletInfoOpen(false)} visible={isWalletInfoOpen}>
      <View style={styles.drawer}>
        <Text style={styles.drawerTitle}>Apple Wallet</Text>
        <Text style={styles.drawerBody}>Wallet passes aren&apos;t available in this app. You can view your tickets here.</Text>
        <Pressable accessibilityRole="button" style={styles.closeButton} onPress={() => setIsWalletInfoOpen(false)}><Text style={styles.closeLabel}>Back to Tickets</Text></Pressable>
      </View>
    </BottomDrawer>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111111' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 4, paddingBottom: 8 },
  headerSpacer: { width: 44 },
  iconButton: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontSize: 17, lineHeight: 23, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 12, lineHeight: 18, color: '#AAAAAA', textAlign: 'center' },
  footer: { marginTop: 'auto', alignSelf: 'center', width: '100%', maxWidth: 560, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  pagination: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  position: { fontSize: 14, lineHeight: 20, fontWeight: '700', color: '#FFFFFF' },
  positionPill: { minWidth: 72, paddingHorizontal: 14, paddingVertical: 5, textAlign: 'center', backgroundColor: '#1D1B20', borderRadius: 20, overflow: 'hidden' },
  infoButton: { flex: 1, minHeight: 46, borderRadius: 28, paddingHorizontal: 10, borderWidth: 1, borderColor: '#716C76', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  footerActions: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 28 },
  walletButton: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: '#716C76', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  walletLabel: { color: '#FFFFFF', fontSize: 15, lineHeight: 17 },
  walletSmall: { color: '#FFFFFF', fontSize: 10, lineHeight: 12 },
  walletMark: { width: 28, height: 23, borderRadius: 3, borderWidth: 1, borderColor: '#B8B5BA', overflow: 'hidden', backgroundColor: '#ECE7DA' },
  drawer: { padding: 24, gap: 14 },
  drawerTitle: { fontSize: 22, fontWeight: '700', color: '#111111' },
  drawerEvent: { fontSize: 17, fontWeight: '700', color: '#111111' },
  drawerBody: { fontSize: 15, lineHeight: 23, color: '#626262' },
  closeButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  closeLabel: { fontSize: 16, fontWeight: '700', color: '#0452D5' },
});
