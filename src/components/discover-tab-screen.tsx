import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';

import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';

const fontStack = Platform.select({
  ios: 'SF Pro Display',
  android: 'sans-serif',
  web: 'SF Pro Display, -apple-system, sans-serif',
});

const DC = {
  black: '#000000',
  white: '#FFFFFF',
  greyText: '#A1A1AA',
  searchBg: '#FFFFFF',
  purpleBtn: '#9C6AD3',
  blueBtn: '#004CD7',
  filterBorder: '#555555',
};

export function DiscoverTabScreen() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <ScreenWrapper backgroundColor="#000000">
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
      </Head>
      <StatusBar backgroundColor="#000000" style="light" />

      {/* Top Black Area */}
      <View style={styles.darkHeaderBg}>
        
        {/* Logo and New Button Row */}
        <View style={styles.topNavRow}>
          <View style={{ flex: 1 }} />
          <Text style={styles.logoText}>ticketmaster</Text>
          <View style={styles.topRightActions}>
            <View style={styles.speechBubble}>
              <View style={styles.speechBubbleTail} />
              <View style={styles.newPill}>
                <Text style={styles.newPillText}>NEW!</Text>
              </View>
              <View style={styles.usFlagCircle}>
                <Text style={{ fontSize: 13, lineHeight: 16 }}>🇺🇸</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location & Dates Selector */}
        <View style={styles.locDateContainer}>
          <Pressable style={styles.locBlock}>
            <Ionicons name="location-outline" size={24} color={DC.white} />
            <View style={styles.locDateCopy}>
              <Text style={styles.locDateLabel}>LOCATION</Text>
              <Text style={styles.locDateValue} numberOfLines={1}>Los Angeles,...</Text>
            </View>
            <Ionicons name="close-circle-outline" size={20} color={DC.white} style={styles.iconRight} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.dateBlock}>
            <Ionicons name="calendar-outline" size={24} color={DC.white} />
            <View style={styles.locDateCopy}>
              <Text style={styles.locDateLabel}>DATES</Text>
              <Text style={styles.locDateValue} numberOfLines={1}>All Dates</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={DC.white} style={styles.iconRight} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchInner}>
            <View style={styles.searchCopy}>
              <Text style={styles.searchLabel}>SEARCH</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Artist, Event or Venue"
                placeholderTextColor="#666666"
                value={searchValue}
                onChangeText={setSearchValue}
              />
            </View>
            <Ionicons name="search-outline" size={22} color={DC.blueBtn} />
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterContainer}
        >
          {['Concerts', 'Sports', 'Arts, Theater & Comedy'].map((cat, idx) => (
            <Pressable key={cat} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.contentScroll}>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionIndicator} />
          <Text style={styles.sectionTitle}>SPONSORED PRESALES AND{'\n'}OFFERS</Text>
          
          <View style={styles.nearRow}>
             <Ionicons name="location-outline" size={20} color="#000" />
             <Text style={styles.nearText}>Near </Text>
             <Pressable style={styles.nearAction}>
               <Text style={styles.nearLink}>Los Angeles, CA</Text>
               <Ionicons name="chevron-down" size={18} color="#0066FF" />
             </Pressable>
          </View>

          {/* Presale Featured Card */}
          <View style={styles.presaleCard}>
            <View style={styles.presaleImageWrapper}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?auto=format&fit=crop&w=1200' }} 
                style={styles.presaleImage} 
                contentFit="cover"
              />
              <View style={styles.presaleTag}>
                <Text style={styles.presaleTagText}>PRESALE</Text>
              </View>
              {/* Carousel Arrows */}
              <View style={styles.arrowLeft}>
                <Ionicons name="arrow-back" size={24} color="#888" />
              </View>
              <View style={styles.arrowRight}>
                <Ionicons name="arrow-forward" size={24} color="#FFF" />
              </View>
            </View>

            <View style={styles.presaleInfo}>
              <Text style={styles.presaleDate}>THU • AUG 13 • 7:00 PM</Text>
              <Text style={styles.presaleName}>Santana & The Doobie Brothers - Oneness Tour 2026</Text>
              <Text style={styles.presaleLocation}>Hollywood, CA • Hollywood Bowl</Text>
            </View>
            
            <View style={styles.sponsorRow}>
               <View style={styles.citiLogo}>
                 <Text style={styles.citiLogoText}>citi</Text>
               </View>
               <View style={styles.sponsorDetails}>
                 <Text style={styles.sponsorName}>Citi</Text>
                 <Text style={styles.sponsorDate}>TUE • FEB 17 • 10:00 AM</Text>
               </View>
            </View>
          </View>
        </View>

        <View style={[styles.sectionContainer, styles.sectionContainerDivider]}>
          <View style={styles.sectionIndicator} />
          <Text style={styles.sectionTitle}>POPULAR NEAR YOU</Text>
          {/* Placeholder for standard list continuation */}
          <View style={{ height: 100 }} />
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8', // Standard light gray backdrop matches image
  },
  darkHeaderBg: {
    backgroundColor: DC.black,
    paddingBottom: 16,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
  },
  logoText: {
    flex: 2,
    color: DC.white,
    fontFamily: fontStack,
    fontSize: 22,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  topRightActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  speechBubble: {
    backgroundColor: DC.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
    position: 'relative',
  },
  speechBubbleTail: {
    position: 'absolute',
    left: -5,
    top: '50%',
    marginTop: -5,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: DC.white,
  },
  newPill: {
    backgroundColor: '#8B5CF6', // Purple color matching the design
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newPillText: {
    color: DC.white,
    fontWeight: '800',
    fontSize: 10,
  },
  usFlagCircle: {
    width: 20,
    height: 20,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  locDateContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locBlock: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 12,
  },
  locDateCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  locDateLabel: {
    color: DC.greyText,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  locDateValue: {
    color: DC.white,
    fontSize: 15,
    fontWeight: '500',
  },
  iconRight: {
    marginLeft: 'auto',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  searchInner: {
    backgroundColor: DC.searchBg,
    borderRadius: 3,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchCopy: {
    flex: 1,
  },
  searchLabel: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    padding: 0,
  },
  filterContainer: {
    marginTop: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: DC.white,
    borderRadius: 3,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterChipText: {
    color: DC.white,
    fontSize: 15,
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  sectionContainerDivider: {
    paddingTop: 12,
  },
  sectionIndicator: {
    width: 26,
    height: 4,
    backgroundColor: '#000000',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  nearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  nearText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  nearAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#0066FF',
    paddingBottom: 2,
    marginLeft: 2,
  },
  nearLink: {
    color: '#0066FF',
    fontSize: 15,
    fontWeight: '700',
  },
  presaleCard: {
    marginBottom: 24,
  },
  presaleImageWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#EAEAEA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  presaleImage: {
    width: '100%',
    height: '100%',
  },
  presaleTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#9534FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 2,
  },
  presaleTagText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  arrowLeft: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowRight: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    backgroundColor: '#005CEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  presaleInfo: {
    paddingVertical: 16,
  },
  presaleDate: {
    color: '#767676',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presaleName: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 6,
  },
  presaleLocation: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '500',
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDDDDD',
    paddingVertical: 16,
  },
  citiLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#005CEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  citiLogoText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    fontStyle: 'italic',
  },
  sponsorDetails: {
    marginLeft: 12,
  },
  sponsorName: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  sponsorDate: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '600',
  },
});
