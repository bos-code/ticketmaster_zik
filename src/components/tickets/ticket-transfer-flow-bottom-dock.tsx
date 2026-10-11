import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';
import { BottomDrawer } from '@/components/ui/bottom-drawer';
import { useTicketFlowData } from '@/components/tickets/useTicketFlowData';

export function BottomDock({ onTransfer }: { onTransfer: () => void }) {
  const insets = useImmersiveSafeAreaInsets();
  const { event, seats } = useTicketFlowData();
  const router = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const canTransfer = seats.some((seat) => seat.canTransfer);
  return <><View pointerEvents="box-none" style={[styles.dock, { bottom: Math.max(insets.bottom, 25) }]}><View style={styles.pill}>
    <Pressable accessibilityRole="button" accessibilityLabel="Ticket upgrade options" onPress={() => setShowUpgrade(true)} style={styles.action}><Ionicons name="arrow-up-outline" size={22} color="#176AC7" /><Text style={styles.label}>Upgrade</Text></Pressable>
    <View style={styles.divider} />
    <Pressable accessibilityRole="button" accessibilityLabel="Transfer Tickets" accessibilityState={{ disabled: !canTransfer }} disabled={!canTransfer} onPress={onTransfer} style={styles.action}><Ionicons name="arrow-up-outline" size={22} color={canTransfer ? '#176AC7' : '#CCCCCC'} style={{ transform: [{ rotate: '45deg' }] }} /><Text style={[styles.label, !canTransfer && styles.disabled]}>Transfer</Text></Pressable>
    <View style={styles.divider} />
    <Pressable accessibilityRole="button" accessibilityLabel="Sell unavailable for these tickets" accessibilityState={{ disabled: true }} disabled style={styles.action}><Ionicons name="sync-outline" size={22} color="#CCCCCC" /><Text style={[styles.label, styles.disabled]}>Sell</Text></Pressable>
  </View></View>
    <BottomDrawer minHeight="42%" visible={showUpgrade} onClose={() => setShowUpgrade(false)}>
      <View style={styles.upgradePanel}>
        <Text style={styles.upgradeTitle}>Ticket upgrades</Text>
        <Text style={styles.upgradeEvent}>{event.title}</Text>
        <Text style={styles.upgradeBody}>Upgrades aren&apos;t available in this app. Contact support to check options for your order.</Text>
        <Pressable accessibilityRole="button" style={styles.helpButton} onPress={() => { setShowUpgrade(false); router.push('/account/help'); }}><Text style={styles.helpLabel}>Get Help</Text></Pressable>
        <Pressable accessibilityRole="button" style={styles.helpButton} onPress={() => setShowUpgrade(false)}><Text style={styles.helpLabel}>Close</Text></Pressable>
      </View>
    </BottomDrawer>
  </>;
}
const styles = StyleSheet.create({ dock: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 16, alignItems: 'center', zIndex: 30 }, pill: { width: '100%', maxWidth: 300, minHeight: 64, flexDirection: 'row', alignItems: 'center', borderRadius: 35, backgroundColor: 'white', boxShadow: '0px 4px 25px rgba(0, 0, 0, 0.10)', elevation: 8 }, action: { flex: 1, minHeight: 64, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', gap: 3 }, divider: { width: 1, height: 30, backgroundColor: '#EEEEEE' }, label: { color: '#626262', fontSize: 14, fontWeight: '500' }, disabled: { color: '#CCCCCC' }, upgradePanel: { padding: 24, gap: 14 }, upgradeTitle: { color: '#111111', fontSize: 22, fontWeight: '700' }, upgradeEvent: { fontSize: 16, color: '#111111' }, upgradeBody: { fontSize: 15, lineHeight: 22, color: '#626262' }, helpButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' }, helpLabel: { color: '#0452D5', fontSize: 16, fontWeight: '700' } });
