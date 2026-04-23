import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { selectEventById, useEventStore } from '@/store/use-event-store';

export function EventDirectionsScreen({ eventId }: { eventId: string }) {
  const event = useEventStore((state) => selectEventById(state, eventId));

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Directions</Text>
        <Text style={styles.title}>{event ? event.title : 'Event unavailable'}</Text>
        <Text style={styles.body}>
          {event
            ? 'The full in-app directions map is available on iOS and Android. On web, venue directions stay connected to the event details flow through the native app experience.'
            : 'We could not load this event, so the native directions experience is unavailable right now.'}
        </Text>

        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: ticketColors.background,
    flex: 1,
    justifyContent: 'center',
    padding: ticketSpacing.lg,
  },
  card: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.border,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.sm,
    maxWidth: 460,
    padding: ticketSpacing.lg,
    width: '100%',
  },
  eyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: ticketColors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  body: {
    color: ticketColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  button: {
    alignItems: 'center',
    backgroundColor: ticketColors.primary,
    borderRadius: ticketRadii.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: ticketSpacing.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
});
