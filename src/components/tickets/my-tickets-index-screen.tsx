import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useImmersiveSafeAreaInsets } from "@/components/immersive/edge-to-edge-hero";
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { USCountryIcon } from '@/components/ui/us-country-icon';
import { TicketStackIcon } from '@/components/ticketmaster-tab-icon';
import { fanColors as C } from '@/constants/fan-theme';
import { useTicketOrder } from '@/hooks/useTicketOrder';
import { fetchTickets } from '@/lib/firebase-data';
import { useTicketStore } from '@/store/ticketStore';
import type { TicketSummaryViewModel } from '@/types/ticket';

export function MyTicketsIndexScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const insets = useImmersiveSafeAreaInsets();
  const { pastSummaryViewModels, upcomingSummaryViewModels } = useTicketOrder();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const events = activeTab === 'upcoming' ? upcomingSummaryViewModels : pastSummaryViewModels;
  async function refresh() {
    if (refreshing) return;
    setRefreshing(true); setError('');
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const tickets = await Promise.race([fetchTickets(), new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Unable to refresh tickets. Check your connection and try again.')), 12000); })]);
      useTicketStore.getState().replaceTickets(tickets);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to refresh tickets. Please try again.'); }
    finally { clearTimeout(timeout); setRefreshing(false); }
  }
  return <View style={styles.root}>
    <Head><meta name="theme-color" content={C.background} /><meta name="color-scheme" content="dark" /></Head>
    <StatusBar style="light" backgroundColor={C.background} />
    <View style={[styles.header, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
      <View style={styles.titleRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.titleAnchor, { maxWidth: Math.max(0, layout.width - 144) }]}>
            <Text style={styles.title}>My Events</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Change country and location" onPress={() => router.push('/account/location')} style={styles.flag}>
              <USCountryIcon size={26} />
            </Pressable>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/account/help')} style={styles.help}><Text style={styles.helpLabel}>Help</Text></Pressable>
      </View>
      <View style={styles.tabs}>{(['upcoming', 'past'] as const).map((tab) => <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: activeTab === tab }} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}><Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>{tab.toUpperCase()} ({tab === 'upcoming' ? upcomingSummaryViewModels.length : pastSummaryViewModels.length})</Text></Pressable>)}</View>
    </View>
    <ScrollView onLayout={layout.onLayout} style={[styles.scroll, { marginLeft: insets.left, marginRight: insets.right }]} contentContainerStyle={[styles.content, { paddingHorizontal: layout.padding }, !events.length && styles.emptyContent]} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={C.blue} />}>
      {events.length ? <View style={styles.grid}>{events.map((ticket) => <TicketIndexCard key={ticket.orderId} width={layout.columnWidth} ticket={ticket} onPress={() => router.push({ pathname: '/tickets', params: { orderId: ticket.orderId } })} />)}</View> : <View style={styles.empty}>
        <View style={styles.emptyIcon}><TicketStackIcon size={44} /></View>
        <Text style={styles.emptyTitle}>{activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}</Text>
        <Text style={styles.emptyBody}>{activeTab === 'upcoming' ? 'Tickets you buy will automatically\nappear here' : 'Your past events will appear here'}</Text>
        <Pressable accessibilityRole="button" disabled={refreshing} onPress={() => void refresh()} style={styles.refresh}>{refreshing ? <ActivityIndicator color="#111111" /> : <Text style={styles.refreshLabel}>Refresh</Text>}</Pressable>
      </View>}
      {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </ScrollView>
  </View>;
}
function TicketIndexCard({ ticket, onPress, width }: { width: number; ticket: TicketSummaryViewModel; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View tickets for ${ticket.eventTitle}`} onPress={onPress} style={[styles.card, { width }]}>
    <View><Image source={ticket.heroImage} resizeMode="cover" style={styles.cardImage} /><View style={styles.cardDate}><Text style={styles.cardDateLabel}>{ticket.eventFullDateTimeLabel.toUpperCase()}</Text></View></View>
    <View style={styles.cardCopy}><Text style={styles.cardTitle}>{ticket.eventTitle.toUpperCase()}</Text><Text style={styles.cardVenue}>{ticket.eventVenue}</Text><View style={styles.cardCount}><TicketStackIcon size={16} /><Text style={styles.cardVenue}>x{ticket.ticketCount}</Text></View></View>
  </Pressable>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' }, header: { backgroundColor: C.background }, titleRow: { minHeight: 56, flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6, alignItems: 'center', marginTop: 3 }, titleGroup: { flex: 1, minWidth: 0, alignItems: 'center' }, titleAnchor: { flexDirection: 'row', alignItems: 'center', gap: 0 }, title: { flexShrink: 1, color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }, flag: { flexShrink: 0, height: 44, width: 44, alignItems: 'center', justifyContent: 'center' }, help: { position: 'absolute', right: 8, top: 0, bottom: 0, width: 52, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, helpLabel: { color: 'white', fontSize: 15, fontWeight: '600', textAlign: 'center' }, tabs: { flexDirection: 'row' }, tab: { flex: 1, minHeight: 48, borderBottomWidth: 4, borderBottomColor: 'transparent', justifyContent: 'center', alignItems: 'center' }, activeTab: { borderBottomColor: 'white' }, tabLabel: { color: '#BDBDBD', fontSize: 14 }, activeTabLabel: { color: 'white', fontWeight: '700' },
  scroll: { flex: 1, backgroundColor: 'white' }, content: { padding: 15, paddingTop: 20, paddingBottom: 25, gap: 16, flexGrow: 1 }, emptyContent: { justifyContent: 'center', paddingBottom: 45 }, empty: { maxWidth: 560, alignSelf: 'center', width: '100%', alignItems: 'center' }, emptyIcon: { width: 88, height: 88, borderRadius: 50, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center', marginBottom: 35 }, emptyTitle: { color: '#111111', fontSize: 21, fontWeight: '700', textAlign: 'center' }, emptyBody: { color: '#111111', fontSize: 18, lineHeight: 23, textAlign: 'center', marginTop: 26 }, refresh: { width: '100%', minHeight: 45, borderColor: '#111111', borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 28 }, refreshLabel: { color: '#111111', fontSize: 14, fontWeight: '600' }, error: { color: '#B42318', fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 }, card: { backgroundColor: '#242424' }, cardImage: { width: '100%', aspectRatio: 1.8 }, cardDate: { position: 'absolute', bottom: 0, left: 0, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#242424' }, cardDateLabel: { color: 'white', fontSize: 12, fontWeight: '600', letterSpacing: 0.6 }, cardCopy: { padding: 12, gap: 7 }, cardTitle: { color: 'white', fontSize: 18, fontWeight: '700' }, cardVenue: { color: 'white', fontSize: 15, lineHeight: 21 }, cardCount: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
});
