import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { ticketSpacing } from '@/constants/ticket-theme';
import { shellColors } from '@/constants/shell-theme';
import { useAppStore, type DistanceUnit, type ThemePreference } from '@/store/use-app-store';

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: 'Automatic (Follow System Settings)', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const distanceOptions: { label: string; value: DistanceUnit }[] = [
  { label: 'Miles (mi)', value: 'mi' },
  { label: 'Kilometers (km)', value: 'km' },
];

export function AppSettingsScreen() {
  const router = useRouter();
  const themePreference = useAppStore((state) => state.themePreference);
  const distanceUnit = useAppStore((state) => state.distanceUnit);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const setDistanceUnit = useAppStore((state) => state.setDistanceUnit);

  return (
    <View style={styles.root}>
      <Head>
        <meta name="theme-color" content={shellColors.lightSurface} />
        <meta name="color-scheme" content="light" />
      </Head>
      <StatusBar backgroundColor={shellColors.lightSurface} style="dark" />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color="#1F2937" name="arrow-back" size={26} />
          </Pressable>
          <Text style={styles.headerTitle}>App Settings</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <PreferenceGroup title="Theme">
            {themeOptions.map((option) => (
              <RadioRow
                active={themePreference === option.value}
                key={option.value}
                label={option.label}
                onPress={() => setThemePreference(option.value)}
              />
            ))}
          </PreferenceGroup>

          <PreferenceGroup title="Distance">
            {distanceOptions.map((option) => (
              <RadioRow
                active={distanceUnit === option.value}
                key={option.value}
                label={option.label}
                onPress={() => setDistanceUnit(option.value)}
              />
            ))}
          </PreferenceGroup>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function PreferenceGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupOptions}>{children}</View>
    </View>
  );
}

function RadioRow({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.optionRow}>
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: shellColors.lightSurface,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.sm,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    width: 40,
  },
  headerTitle: {
    color: shellColors.lightText,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: ticketSpacing.xl,
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.xl,
    paddingBottom: ticketSpacing.xxl,
  },
  group: {
    gap: ticketSpacing.lg,
  },
  groupTitle: {
    color: '#2C2C2C',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  groupOptions: {
    gap: ticketSpacing.lg,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: ticketSpacing.md,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: '#A3A3A3',
    borderRadius: 999,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  radioOuterActive: {
    borderColor: shellColors.accent,
  },
  radioInner: {
    backgroundColor: shellColors.accent,
    borderRadius: 999,
    height: 16,
    width: 16,
  },
  optionLabel: {
    color: '#444444',
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
});
