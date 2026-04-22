import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function MyAccountScreen() {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.spotlight} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.iconShell}>
              <Ionicons name="person" color={ticketColors.text} size={26} />
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>My Account</Text>
              <Text style={styles.title}>Guest mode</Text>
              <Text style={styles.subtitle}>Browse now. We can bring sign-in back once the core flow settles.</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelLabel}>Status</Text>
            <Text style={styles.metric}>No sign-in required</Text>
            <Text style={styles.metricSub}>Everything is open while we keep account work on the bench.</Text>
          </View>

          <View style={styles.card}>
            <DetailRow label="Access" value="Open browsing and discovery" />
            <DetailRow label="Saved profile" value="Coming back in a later pass" />
            <DetailRow label="Tickets" value="Ready for the next real account flow" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ticketColors.background,
  },
  spotlight: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.18,
    backgroundColor: ticketColors.primaryBright,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.xl,
    paddingBottom: ticketSpacing.xxl,
    gap: ticketSpacing.lg,
  },
  header: {
    gap: ticketSpacing.lg,
  },
  iconShell: {
    width: 56,
    height: 56,
    borderRadius: ticketRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderWidth: 1,
    borderColor: ticketColors.border,
  },
  titleBlock: {
    gap: ticketSpacing.sm,
  },
  eyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: ticketColors.text,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: ticketColors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0,
  },
  panel: {
    padding: ticketSpacing.lg,
    borderRadius: ticketRadii.md,
    backgroundColor: ticketColors.chrome,
    borderWidth: 1,
    borderColor: ticketColors.border,
    gap: ticketSpacing.xs,
  },
  panelLabel: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  metric: {
    color: ticketColors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  metricSub: {
    color: ticketColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0,
  },
  card: {
    padding: ticketSpacing.lg,
    borderRadius: ticketRadii.md,
    backgroundColor: ticketColors.chromeElevated,
    borderWidth: 1,
    borderColor: ticketColors.border,
    gap: ticketSpacing.md,
  },
  detailRow: {
    gap: ticketSpacing.xs,
  },
  detailLabel: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: ticketColors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
