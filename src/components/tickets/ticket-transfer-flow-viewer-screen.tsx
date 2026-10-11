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

export function TicketTransferViewerScreen({ onBack, onViewerIndexChange, positionLabel, seats, viewerIndex }: {
  carouselCardWidth: number;
  carouselSnapInterval: number;
  onBack: () => void;
  onViewerIndexChange: (index: number) => void;
  positionLabel?: string;
  seats: Seat[];
  viewerIndex: number;
}) {
  const { event, order } = useTicketFlowData();
  const insets = useImmersiveSafeAreaInsets();
  const layout = useResponsiveLayout();
  const { cardWidth, sidePadding, snapInterval } = getViewerLayout(layout.width);
  const viewerListRef = useRef<FlatList<Seat>>(null);
  const [cardHeight, setCardHeight] = useState(550);
  const [isTicketInfoOpen, setIsTicketInfoOpen] = useState(false);
  const [isWalletInfoOpen, setIsWalletInfoOpen] = useState(false);
  const activeSeat = seats[viewerIndex];
  useEffect(() => {
    const frame = requestAnimationFrame(() => viewerListRef.current?.scrollToOffset({ animated: false, offset: viewerIndex * snapInterval }));
    return () => cancelAnimationFrame(frame);
  }, [snapInterval, viewerIndex]);
  function updateIndex(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.max(0, Math.min(seats.length - 1, Math.round(event.nativeEvent.contentOffset.x / snapInterval)));
    if (index !== viewerIndex) onViewerIndexChange(index);
  }
  return <View style={[styles.root, { paddingTop: Math.max(insets.top, 12), paddingLeft: insets.left, paddingRight: insets.right }]}>
    <Head><meta name="theme-color" content="#111111" /><meta name="color-scheme" content="dark" /></Head>
    <StatusBar style="light" backgroundColor="#111111" />
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 16) }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to event" onPress={onBack} style={styles.iconButton}><Ionicons name="chevron-back" size={28} color="#FFFFFF" /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.title}>{event.shortTitle}</Text><Text style={styles.subtitle}>{event.headerSubtitle}</Text></View>
      </View>
      <View onLayout={layout.onLayout}>
        <FlatList ref={viewerListRef} data={seats} horizontal nestedScrollEnabled
          style={{ height: cardHeight + 48, flexGrow: 0 }}
          contentContainerStyle={{ paddingLeft: sidePadding, paddingRight: Math.max(0, sidePadding - 12), paddingTop: 16, paddingBottom: 32, alignItems: 'flex-start' }}
          keyExtractor={(seat) => seat.id}
          getItemLayout={(_, index) => ({ index, length: snapInterval, offset: snapInterval * index })}
          renderItem={({ item, index }) => <TicketCard cardWidth={cardWidth} seat={item} index={index} onLayout={(e) => setCardHeight((current) => Math.max(index === 0 ? 0 : current, e.nativeEvent.layout.height))} />}
          onMomentumScrollEnd={updateIndex} onScrollEndDrag={updateIndex} decelerationRate="fast"
          showsHorizontalScrollIndicator={false} snapToInterval={snapInterval} snapToAlignment="start" />
      </View>
      <View style={styles.footer}>
        <View style={styles.pagination}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous ticket" disabled={viewerIndex === 0} onPress={() => onViewerIndexChange(viewerIndex - 1)} style={styles.iconButton}><Ionicons name="chevron-back" size={22} color={viewerIndex === 0 ? '#666666' : '#FFFFFF'} /></Pressable>
          <Text accessibilityLiveRegion="polite" style={styles.position}>{positionLabel ?? `${viewerIndex + 1} of ${seats.length}`}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Next ticket" disabled={viewerIndex >= seats.length - 1} onPress={() => onViewerIndexChange(viewerIndex + 1)} style={styles.iconButton}><Ionicons name="chevron-forward" size={22} color={viewerIndex >= seats.length - 1 ? '#666666' : '#FFFFFF'} /></Pressable>
        </View>
        <View style={styles.footerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Apple Wallet availability" onPress={() => setIsWalletInfoOpen(true)} style={styles.walletButton}>
            <Ionicons name="wallet" size={24} color="#D6C79D" /><Text style={styles.walletLabel}>Add to{String.fromCharCode(10)}Apple Wallet</Text>
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
  root: { flex: 1, backgroundColor: '#111111' }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, paddingBottom: 12 }, iconButton: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, headerCopy: { flex: 1, minWidth: 0, gap: 5 }, title: { fontSize: 18, lineHeight: 25, fontWeight: '700', color: '#FFFFFF' }, subtitle: { fontSize: 14, lineHeight: 20, color: '#AAAAAA' }, footer: { marginTop: 'auto', alignSelf: 'center', width: '100%', maxWidth: 560, alignItems: 'center', padding: 16, gap: 16 }, pagination: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#242424', borderRadius: 30, paddingHorizontal: 4 }, position: { fontSize: 15, lineHeight: 21, fontWeight: '700', color: '#FFFFFF' }, infoButton: { flex: 1, minHeight: 48, borderRadius: 30, paddingHorizontal: 12, borderWidth: 1, borderColor: '#444444', backgroundColor: '#242424', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, footerActions: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 }, walletButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, walletLabel: { color: '#FFFFFF', fontSize: 14, lineHeight: 18, fontWeight: '700' }, drawer: { padding: 24, gap: 14 }, drawerTitle: { fontSize: 22, fontWeight: '700', color: '#111111' }, drawerEvent: { fontSize: 17, fontWeight: '700', color: '#111111' }, drawerBody: { fontSize: 15, lineHeight: 23, color: '#626262' }, closeButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' }, closeLabel: { fontSize: 16, fontWeight: '700', color: '#0452D5' },
});
