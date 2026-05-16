import React, { useRef, useState, useCallback } from 'react';
import { 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';
import { BOTTOM_TAB_BAR_CONTENT_HEIGHT } from '@/constants/theme';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';

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

function SellIllustrationStep1() {
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

function SellIllustrationStep2() {
  return (
    <View style={styles.illustrationWrapper}>
      <Svg width="180" height="180" viewBox="0 0 180 180">
        <Rect x="20" y="20" width="30" height="12" fill={C.white} transform="rotate(-5, 35, 26)" />
        <G transform="translate(70, 15) rotate(-15)">
          <Rect x="0" y="0" width="40" height="14" fill={C.white} rx="7" />
          <Rect x="10" y="0" width="3" height="14" fill={C.blue} />
          <Rect x="16" y="0" width="3" height="14" fill={C.blue} />
        </G>
        <G transform="translate(90, 45) rotate(15)">
          <Rect x="0" y="0" width="80" height="50" fill={C.blue} rx="4" />
          <Rect x="0" y="10" width="80" height="10" fill={C.white} />
          <Rect x="10" y="28" width="60" height="6" fill={C.bg} opacity={0.5} />
        </G>
        <G transform="translate(50, 70) rotate(-10)">
          <Rect x="0" y="0" width="65" height="90" fill={C.white} rx="2" />
          <Rect x="8" y="8" width="49" height="16" fill="none" stroke={C.blue} strokeWidth="2" />
          <Rect x="8" y="32" width="40" height="3" fill={C.blue} />
          <Rect x="8" y="39" width="30" height="3" fill={C.blue} />
          <Rect x="8" y="46" width="35" height="3" fill={C.blue} />
          <Path 
            transform="translate(32.5, 68) scale(1.1)" 
            d="M 0 -10 L 2.25 -3 L 10 -3 L 4 1.5 L 6.5 9 L 0 5 L -6.5 9 L -4 1.5 L -10 -3 L -2.25 -3 Z" 
            fill={C.blue} 
          />
        </G>
        <Rect x="120" y="140" width="40" height="12" fill={C.blue} transform="rotate(2, 140, 146)" />
      </Svg>
    </View>
  );
}

function ListIcon({ name, color = '#7F8280' }: { name: string; color?: string }) {
  if (name === 'ticket') {
    return (
      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <Path d="M13 5v2" />
        <Path d="M13 17v2" />
        <Path d="M13 11v2" />
      </Svg>
    );
  }
  if (name === 'sold') {
    return (
      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Rect width="20" height="12" x="2" y="6" rx="2" />
        <Circle cx="12" cy="12" r="2" />
        <Path d="M6 12h.01M18 12h.01" />
      </Svg>
    );
  }
  if (name === 'expired') {
    return (
      <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <Path d="M12 9v4" />
        <Path d="M12 17h.01" />
      </Svg>
    );
  }
  return null;
}

const STEP_DATA = [
  {
    title: 'SELL TICKETS FROM ANY SITE',
    subtitle: 'Get access to millions of fans, even if you did not buy tickets on Ticketmaster.',
    Illustration: SellIllustrationStep1,
  },
  {
    title: 'QUICK AND EASY',
    subtitle: "List, sell and get paid — it's all here, right in one convenient place.",
    Illustration: SellIllustrationStep2,
  },
];

export default function SellScreen() {
  const insets = useImmersiveSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  
  const verticalScrollRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);

  const handleHorizontalScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const step = Math.round(offsetX / windowWidth);
    if (step !== currentStep) {
      setCurrentStep(step);
    }
  }, [currentStep, windowWidth]);

  const handleSellPress = () => {
    verticalScrollRef.current?.scrollTo({
      y: 400, // Reasonable scroll to reveal white section
      animated: true,
    });
  };

  return (
    <View style={styles.root}>
      <Head>
        <meta name="theme-color" content={C.bg} />
        <meta name="color-scheme" content="dark" />
      </Head>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      
      <ScrollView 
        ref={verticalScrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.mainContainer, { flex: 1, paddingTop: insets.top }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.carouselContainer}>
              <ScrollView
                ref={horizontalScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleHorizontalScroll}
                scrollEventThrottle={16}
                style={{ width: windowWidth }}
              >
                {STEP_DATA.map((item, index) => (
                  <View key={index} style={[styles.stepItem, { width: windowWidth }]}>
                    <View style={styles.spacer} />
                    <item.Illustration />
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.paginationDots}>
              {STEP_DATA.map((_, index) => (
                <View 
                  key={index} 
                  style={[styles.dot, currentStep === index ? styles.dotActive : styles.dotInactive]} 
                />
              ))}
            </View>

            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity style={styles.learnMoreBtn} activeOpacity={0.8}>
                <Text style={styles.learnMoreText}>Learn How It Works</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ paddingBottom: 20 }}>
            <View style={styles.bottomAction}>
              <TouchableOpacity 
                style={styles.sellBtn} 
                activeOpacity={0.8}
                onPress={handleSellPress}
              >
                <Text style={styles.sellBtnText}>Sell Your Tickets</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.whiteSection,
            {
              minHeight: 400,
              paddingBottom:
                BOTTOM_TAB_BAR_CONTENT_HEIGHT + insets.bottom + 40,
            },
          ]}
        >
          <View style={styles.whiteSectionHeader}>
            <Text style={styles.whiteSectionTitle}>Manage Listings</Text>
          </View>

          <TouchableOpacity style={styles.listItem} activeOpacity={0.6}>
            <View style={styles.listItemLeft}>
              <ListIcon name="ticket" />
              <Text style={styles.listItemText}>Tickets I&apos;m Selling</Text>
            </View>
            <View style={styles.chevron} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.listItem} activeOpacity={0.6}>
            <View style={styles.listItemLeft}>
              <ListIcon name="sold" />
              <Text style={styles.listItemText}>Sold Tickets</Text>
            </View>
            <View style={styles.chevron} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.listItem} activeOpacity={0.6}>
            <View style={styles.listItemLeft}>
              <ListIcon name="expired" />
              <Text style={styles.listItemText}>Expired Tickets</Text>
            </View>
            <View style={styles.chevron} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    alignItems: 'center',
    backgroundColor: C.bg,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  carouselContainer: {
    flex: 1,
  },
  stepItem: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  spacer: {
    height: 40,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 180,
  },
  title: {
    fontFamily: fontStack,
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: fontStack,
    color: C.greyText,
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
    paddingHorizontal: 28,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  learnMoreText: {
    fontFamily: fontStack,
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomAction: {
    width: '100%',
    paddingHorizontal: 24,
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
  whiteSection: {
    backgroundColor: C.white,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  whiteSectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 8,
  },
  whiteSectionTitle: {
    fontFamily: fontStack,
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 22,
    paddingHorizontal: 24,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listItemText: {
    fontFamily: fontStack,
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#D1D1D6',
    transform: [{ rotate: '45deg' }],
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginLeft: 60,
  },
});

