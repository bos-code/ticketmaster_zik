import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from 'react-native';

import { premiumMapPalette } from '@/constants/premium-map-style';
import { ticketRadii } from '@/constants/ticket-theme';

export function VenueMapMarker() {
  const pulseScale = useRef(new Animated.Value(0.92)).current;
  const pulseOpacity = useRef(new Animated.Value(0.24)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.12,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 0.92,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.08,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.24,
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [pulseOpacity, pulseScale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.halo,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

      <View style={styles.dot}>
        <Ionicons color="#FFFFFF" name="location-sharp" size={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  halo: {
    backgroundColor: premiumMapPalette.venueMarkerGlow,
    borderRadius: ticketRadii.pill,
    height: 42,
    position: 'absolute',
    width: 42,
  },
  dot: {
    alignItems: 'center',
    backgroundColor: premiumMapPalette.venueMarkerFill,
    borderColor: '#FFFFFF',
    borderRadius: ticketRadii.pill,
    borderWidth: 3,
    height: 28,
    justifyContent: 'center',
    shadowColor: premiumMapPalette.venueMarkerShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    width: 28,
  },
});
