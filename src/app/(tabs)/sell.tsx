import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { StatusBarChrome } from '@/components/status-bar-chrome';

const fontStack = Platform.select({
  ios: 'SF Pro Display',
  android: 'sans-serif',
  web: 'SF Pro Display, -apple-system, sans-serif',
});

const C = {
  bg: '#000000',
  white: '#FFFFFF',
  greyText: '#A1A1AA',
  blue: '#026CDF',
  dotInactive: '#555555',
};

function SellIllustration() {
  return (
    <View style={styles.illustrationWrapper}>
      <Svg width="180" height="180" viewBox="0 0 180 180">
        <Circle cx="50" cy="120" r="24" fill={C.blue} />
        <Path 
          d="M 32 130 A 20 20 0 0 0 50 140" 
          fill="none" 
          stroke={C.white} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        <Path 
          d="M 60 70 C 60 10, 120 10, 135 40" 
          fill="none" 
          stroke={C.white} 
          strokeWidth="5" 
          strokeLinecap="round" 
        />
        <Path d="M 122 26 L 145 42 L 122 54 Z" fill={C.white} />
        <Path 
          d="M 135 80 C 145 140, 90 150, 75 115" 
          fill="none" 
          stroke={C.blue} 
          strokeWidth="5" 
          strokeLinecap="round" 
        />
        <Path d="M 88 132 L 63 112 L 88 100 Z" fill={C.blue} />
        <G transform="translate(105, 125) rotate(-15)">
          <Rect x="0" y="0" width="50" height="14" fill={C.white} rx="7" />
          <Rect x="12" y="0" width="3" height="14" fill={C.blue} />
          <Rect x="18" y="0" width="3" height="14" fill={C.blue} />
          <Rect x="0" y="0" width="50" height="14" fill="none" stroke={C.bg} strokeWidth="2" rx="7" />
        </G>
        <G transform="translate(65, 35) rotate(-10)">
          <Rect x="0" y="0" width="60" height="85" fill={C.white} rx="2" />
          <Rect x="8" y="8" width="44" height="24" fill={C.blue} rx="1" />
          <Rect x="8" y="38" width="44" height="4" fill={C.blue} rx="1" />
          <Rect x="8" y="46" width="28" height="4" fill={C.blue} rx="1" />
          <Path 
            transform="translate(30, 65) scale(0.9)" 
            d="M 0 -10 L 2.25 -3 L 10 -3 L 4 1.5 L 6.5 9 L 0 5 L -6.5 9 L -4 1.5 L -10 -3 L -2.25 -3 Z" 
            fill={C.blue} 
          />
        </G>
      </Svg>
    </View>
  );
}

export default function SellScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <StatusBarChrome backgroundColor={C.bg} style="light" />
      <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
        <View style={styles.spacer} />
        
        <SellIllustration />
        
        <Text style={styles.title}>SELL TICKETS FROM ANY SITE</Text>
        <Text style={styles.subtitle}>
          Get access to millions of fans, even if you did not buy tickets{'\n'}on Ticketmaster.
        </Text>

        <View style={styles.paginationDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        <TouchableOpacity style={styles.learnMoreBtn} activeOpacity={0.8}>
          <Text style={styles.learnMoreText}>Learn How It Works</Text>
        </TouchableOpacity>

        <View style={styles.spacerFlexible} />

        <View style={styles.bottomAction}>
          <TouchableOpacity style={styles.sellBtn} activeOpacity={0.8}>
            <Text style={styles.sellBtnText}>Sell Your Tickets</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 0.8,
  },
  spacerFlexible: {
    flex: 1.2,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 44,
  },
  title: {
    fontFamily: fontStack,
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontStack,
    color: C.greyText,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: C.white,
  },
  dotInactive: {
    backgroundColor: C.dotInactive,
  },
  learnMoreBtn: {
    borderWidth: 1,
    borderColor: C.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreText: {
    fontFamily: fontStack,
    color: C.white,
    fontSize: 15,
    fontWeight: '600',
  },
  bottomAction: {
    width: '100%',
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },
  sellBtn: {
    backgroundColor: C.blue,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellBtnText: {
    fontFamily: fontStack,
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
