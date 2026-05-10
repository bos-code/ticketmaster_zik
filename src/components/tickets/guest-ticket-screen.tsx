import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { GradientSurface } from '@/components/ui/gradient-surface';
import { shellColors, shellGradients } from '@/constants/shell-theme';
import { selectDiscoverEvents, useEventStore } from '@/store/use-event-store';

export function GuestTicketScreen() {
  const discoverEvents = useEventStore(selectDiscoverEvents);
  const ticketHeroImage = discoverEvents[0]?.imageUrl;

  function handleAuthPress() {
    Alert.alert('Sign-in flow next', 'This guest tickets screen is ready to connect to real auth.');
  }

  return (
    <View style={styles.root}>
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
      </Head>
      <StatusBar backgroundColor="#000000" style="light" />
      {ticketHeroImage ? (
        <Image contentFit="cover" source={{ uri: ticketHeroImage }} style={styles.backgroundImage} />
      ) : null}
      <View style={styles.backgroundOverlay} />
      <GradientSurface colors={shellGradients.ticket} style={styles.bottomFade} />

      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/discover')} style={styles.closeButton}>
          <Ionicons color="#FFFFFF" name="close" size={30} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.brandWrap}>
            <Text style={styles.brandWordmark}>zik</Text>
            <Text style={styles.brandTagline}>Events. Tickets. Moments.</Text>
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={handleAuthPress} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Log In</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={handleAuthPress} style={styles.secondaryButton}>
              <Ionicons color="#FFFFFF" name="logo-facebook" size={24} />
              <Text style={styles.secondaryButtonText}>Continue with Facebook</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={handleAuthPress} style={styles.secondaryButton}>
              <Ionicons color="#FFFFFF" name="logo-apple" size={24} />
              <Text style={styles.secondaryButtonText}>Continue with Apple</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={handleAuthPress} style={styles.tertiaryButton}>
              <Text style={styles.tertiaryButtonText}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: shellColors.background,
  },
  backgroundImage: {
    height: 340,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backgroundOverlay: {
    backgroundColor: 'rgba(4, 16, 51, 0.68)',
    height: 340,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bottomFade: {
    bottom: 0,
    height: 420,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  safeArea: {
    flex: 1,
  },
  closeButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    marginLeft: ticketSpacing.lg,
    marginTop: ticketSpacing.sm,
    width: 42,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: ticketSpacing.xxl,
    paddingHorizontal: ticketSpacing.lg,
  },
  brandWrap: {
    alignItems: 'center',
    marginTop: 148,
  },
  brandWordmark: {
    color: '#FFFFFF',
    fontSize: 78,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 82,
    textTransform: 'lowercase',
  },
  brandTagline: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: ticketSpacing.md,
  },
  actions: {
    gap: ticketSpacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: shellColors.accent,
    borderRadius: ticketRadii.pill,
    justifyContent: 'center',
    minHeight: 60,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: shellColors.accent,
    borderRadius: ticketRadii.pill,
    borderWidth: 2,
    flexDirection: 'row',
    gap: ticketSpacing.md,
    justifyContent: 'center',
    minHeight: 60,
    paddingHorizontal: ticketSpacing.lg,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  tertiaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tertiaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
});
