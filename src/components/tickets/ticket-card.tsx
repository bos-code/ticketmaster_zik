import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { EditableText } from '@/components/tickets/EditableText';
import { TicketAztecCode } from '@/components/tickets/ticket-aztec-code';
import type { Seat } from '@/components/tickets/ticketFlowTypes';
import { useTicketFlowData } from '@/components/tickets/useTicketFlowData';
import { Text } from '@/components/ui/app-text';

export function TicketCard({ cardWidth, seat, onLayout }: {
  cardWidth: number;
  index: number;
  seat: Seat;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const { event } = useTicketFlowData();
  const seatLabel = (seat.label?.trim() || 'Standard Seat Ticket').replace(/^artist presale$/i, 'Artist Presale');
  const entryInstructions = seat.entryInstructions?.trim();
  return (
    <View onLayout={onLayout} style={[styles.card, { width: cardWidth }]}>
      <View style={styles.brandBar}><Text style={styles.brand}>ticketmaster</Text></View>
      <View style={[styles.media, { height: cardWidth * 1.16 }]}>
        <View style={styles.artwork}>
          <Image source={event.heroImage} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFillObject} />
          <LinearGradient pointerEvents="none" colors={['#08090E', 'transparent']} style={styles.artworkFade} />
        </View>
        <TicketHologram />
        <View style={styles.codePosition}><TicketAztecCode value={seat.barcodeValue?.trim() ? seat.barcodeValue : seat.id} size={cardWidth * 0.64} isReference={!seat.barcodeValue?.trim()} /></View>
      </View>
      <View style={styles.details}>
        <EditableText field="seatLabel" value={seatLabel} style={styles.ticketType} />
        <EditableText field="ticketNote" value={seat.note?.trim() || 'Standard seating'} style={styles.ticketNote} />
        <View style={styles.seatRow}>
          <SeatDetail label="SECTION" field="section" value={seat.section} />
          <SeatDetail label="ROW" field="row" value={seat.row} />
          <SeatDetail label="SEAT" value={seat.seat} />
        </View>
        <View style={styles.entryStrip}>
          <EditableText field="entryInstructions" value={entryInstructions || 'See Ticket Info for entry details'} style={styles.entryText} />
        </View>
      </View>
    </View>
  );
}

function SeatDetail({ label, field, value }: { label: string; field?: 'section' | 'row'; value: string }) {
  return <View style={styles.seatDetail}><Text style={styles.seatLabel}>{label}</Text><EditableText field={field} value={value || '—'} style={styles.seatValue} /></View>;
}

function TicketHologram() {
  const opacity = useSharedValue(0.25);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    opacity.value = reduceMotion ? 0.3 : withRepeat(withTiming(0.55, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity, reduceMotion]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.hologram, animatedStyle]}>
    <Svg width="100%" height="100%">
      <Defs><Pattern id="ticket-hologram" width="24" height="24" patternUnits="userSpaceOnUse"><Path d="M12 0Q12 12 24 12Q12 12 12 24Q12 12 0 12Q12 12 12 0" fill="#BBC0CE" /></Pattern></Defs>
      <Rect width="100%" height="100%" fill="url(#ticket-hologram)" />
    </Svg>
    <LinearGradient colors={['transparent', '#08090E']} style={StyleSheet.absoluteFillObject} />
  </Animated.View>;
}

const styles = StyleSheet.create({
  card: { marginRight: 12, overflow: 'hidden', backgroundColor: '#242225', borderRadius: 2 },
  brandBar: { height: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0452FF' },
  brand: { color: '#FFFFFF', fontSize: 12, lineHeight: 16, fontStyle: 'italic', fontWeight: '700', letterSpacing: -0.5 },
  media: { backgroundColor: '#08090E', overflow: 'hidden' },
  artwork: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },
  artworkFade: { position: 'absolute', top: 0, left: 0, right: 0, height: '24%' },
  codePosition: { position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center' },
  hologram: { position: 'absolute', top: 0, left: 0, width: '35%', height: '48%' },
  details: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  ticketType: { color: '#FFFFFF', fontSize: 17, lineHeight: 23, fontWeight: '700' },
  ticketNote: { color: '#B8B5BA', fontSize: 13, lineHeight: 19, marginTop: 1 },
  seatRow: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#777279', marginTop: 14, paddingTop: 12, paddingBottom: 14 },
  seatDetail: { flex: 1, minWidth: 0, gap: 3 },
  seatLabel: { color: '#B8B5BA', fontSize: 10, lineHeight: 15, fontWeight: '700', letterSpacing: 0.4 },
  seatValue: { color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontWeight: '700' },
  entryStrip: { minHeight: 44, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10 },
  entryText: { color: '#151316', fontSize: 13, lineHeight: 18, fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' },
});
