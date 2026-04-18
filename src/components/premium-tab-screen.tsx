import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type PremiumTabScreenProps = {
  accentColor: string;
  eyebrow: string;
  icon: IconName;
  title: string;
  body: string;
  primaryMetric: string;
  secondaryMetric: string;
  actions: string[];
};

export function PremiumTabScreen({
  accentColor,
  eyebrow,
  icon,
  title,
  body,
  primaryMetric,
  secondaryMetric,
  actions,
}: PremiumTabScreenProps) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={[styles.spotlight, { backgroundColor: accentColor }]} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.iconShell}>
              <View style={[styles.iconGlow, { backgroundColor: accentColor }]} />
              <Ionicons name={icon} color={ticketColors.text} size={26} />
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.body}>{body}</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelLabel}>Live Signal</Text>
            <Text style={styles.metric}>{primaryMetric}</Text>
            <Text style={styles.metricSub}>{secondaryMetric}</Text>
          </View>

          <View style={styles.actionGrid}>
            {actions.map((action) => (
              <View key={action} style={styles.actionItem}>
                <View style={[styles.actionDot, { backgroundColor: accentColor }]} />
                <Text style={styles.actionText}>{action}</Text>
              </View>
            ))}
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
    overflow: 'hidden',
  },
  iconGlow: {
    position: 'absolute',
    right: -18,
    bottom: -20,
    width: 58,
    height: 58,
    borderRadius: 29,
    opacity: 0.36,
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
  body: {
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
  actionGrid: {
    gap: ticketSpacing.sm,
  },
  actionItem: {
    minHeight: 52,
    borderRadius: ticketRadii.md,
    paddingHorizontal: ticketSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ticketColors.chromeElevated,
    borderWidth: 1,
    borderColor: ticketColors.border,
    gap: ticketSpacing.sm,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionText: {
    color: ticketColors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
