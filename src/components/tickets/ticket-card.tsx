import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useId } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Defs, Mask, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { EditableText } from '@/components/tickets/EditableText';
import { TicketAztecCode } from '@/components/tickets/ticket-aztec-code';
import type { Seat } from '@/components/tickets/ticketFlowTypes';
import { useTicketFlowData } from '@/components/tickets/useTicketFlowData';
import { Text } from '@/components/ui/app-text';
import type { TicketTilt } from '@/hooks/ticket-tilt-types';
import { TicketTiltSurface } from '@/components/tickets/ticket-tilt-surface';

const AnimatedRadialGradient = Animated.createAnimatedComponent(RadialGradient);

export function TicketCard({ cardWidth, seat, onLayout, motion }: {
  cardWidth: number;
  index: number;
  seat: Seat;
  onLayout?: (event: LayoutChangeEvent) => void;
  motion?: TicketTilt;
}) {
  const { event } = useTicketFlowData();
  const seatLabel = (seat.label?.trim() || 'Standard Seat Ticket').replace(/^artist presale$/i, 'Artist Presale');
  const entryInstructions = seat.entryInstructions?.trim();
  const tiltX = motion?.x;
  const tiltY = motion?.y;
  const sheenStyle = useAnimatedStyle(() => ({ transform: [
    { translateX: (tiltX?.value ?? 0) * cardWidth * 0.28 },
    { translateY: (tiltY?.value ?? 0) * cardWidth * 0.12 },
    { rotateZ: `${-24 + (tiltX?.value ?? 0) * 10 + (tiltY?.value ?? 0) * 4}deg` },
  ] }));
  return (
    <View onLayout={onLayout} style={[styles.card, { width: cardWidth }]}>
      <TicketTiltSurface motion={motion}>
      <View style={styles.brandBar}><Text style={styles.brand}>ticketmaster</Text></View>
      <View style={[styles.media, { height: cardWidth * 1.16 }]}>
        <View style={styles.artwork}>
          <Image source={event.heroImage} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFillObject} />
          <LinearGradient pointerEvents="none" colors={['#08090E', 'transparent']} style={styles.artworkFade} />
        </View>
        <TicketHologram motion={motion} cardWidth={cardWidth} mediaHeight={cardWidth * 1.16} />
        <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.sheen, sheenStyle]}><LinearGradient colors={['transparent', 'rgba(163,203,255,0.01)', 'rgba(230,239,255,0.06)', 'rgba(202,184,238,0.02)', 'transparent']} locations={[0, 0.35, 0.5, 0.65, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} /></Animated.View>
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
      <View style={styles.codePosition}><TicketAztecCode value={seat.barcodeValue?.trim() ? seat.barcodeValue : seat.id} size={cardWidth * 0.64} isReference={!seat.barcodeValue?.trim()} /></View>
      </TicketTiltSurface>
    </View>
  );
}

function SeatDetail({ label, field, value }: { label: string; field?: 'section' | 'row'; value: string }) {
  return <View style={styles.seatDetail}><Text style={styles.seatLabel}>{label}</Text><EditableText field={field} value={value || '—'} style={styles.seatValue} /></View>;
}

function TicketHologram({ motion, cardWidth, mediaHeight }: { motion?: TicketTilt; cardWidth: number; mediaHeight: number }) {
  const patternId = `ticket-hologram-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tiltX = motion?.x;
  const tiltY = motion?.y;
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.55,
    transform: [{ translateX: (tiltX?.value ?? 0) * cardWidth * 0.035 }, { translateY: (tiltY?.value ?? 0) * 18 }],
  }));
  // The reflection travels farther than the texture, uncovering a different
  // patch of stars as the viewing angle changes. It never reaches the details.
  const reflectionProps = useAnimatedProps(() => ({
    cx: 32 + cardWidth * (0.18 + (tiltX?.value ?? 0) * 0.64) - (tiltX?.value ?? 0) * cardWidth * 0.035,
    cy: 32 + mediaHeight * (0.15 + (tiltY?.value ?? 0) * 0.65) - (tiltY?.value ?? 0) * 18,
  }));
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.hologram}>
    <Animated.View style={[styles.starTexture, animatedStyle]}>
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse"><Path d="M12 0Q12 12 24 12Q12 12 12 24Q12 12 0 12Q12 12 12 0" fill="#BBC0CE" /></Pattern>
        <AnimatedRadialGradient id={`${patternId}-fade`} gradientUnits="userSpaceOnUse" animatedProps={reflectionProps} rx={cardWidth * 0.5} ry={mediaHeight * 0.46}><Stop offset="0%" stopColor="white" stopOpacity={0.8} /><Stop offset="35%" stopColor="white" stopOpacity={0.55} /><Stop offset="70%" stopColor="white" stopOpacity={0.15} /><Stop offset="100%" stopColor="white" stopOpacity={0} /></AnimatedRadialGradient>
        <Mask id={`${patternId}-mask`} x="0" y="0" width="100%" height="100%"><Rect width="100%" height="100%" fill={`url(#${patternId}-fade)`} /></Mask>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${patternId})`} mask={`url(#${patternId}-mask)`} />
    </Svg>
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  card: { marginRight: 12, overflow: 'hidden', backgroundColor: '#242225', borderRadius: 2 },
  brandBar: { height: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0452FF' },
  brand: { color: '#FFFFFF', fontSize: 12, lineHeight: 16, fontStyle: 'italic', fontWeight: '700', letterSpacing: -0.5 },
  media: { backgroundColor: '#08090E', overflow: 'hidden' },
  artwork: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', overflow: 'hidden' },
  artworkFade: { position: 'absolute', top: 0, left: 0, right: 0, height: '24%' },
  sheen: { position: 'absolute', top: '-50%', bottom: '-50%', left: '-70%', right: '-70%', zIndex: 1 },
  codePosition: { position: 'absolute', top: 30, left: 0, right: 0, alignItems: 'center', zIndex: 2 },
  hologram: { ...StyleSheet.absoluteFillObject, zIndex: 1, overflow: 'hidden' },
  starTexture: { position: 'absolute', top: -32, bottom: -32, left: -32, right: -32 },
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
