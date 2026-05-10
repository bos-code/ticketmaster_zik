import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { GradientSurface } from '@/components/ui/gradient-surface';
import { shellColors, shellGradients } from '@/constants/shell-theme';
import {
  getLocationPermissionStatus,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  resolveHomeLocation,
} from '@/lib/device-permissions';
import { useAppStore } from '@/store/use-app-store';

type BusyToggle = 'location' | 'notification' | null;

export function SettingsHomeScreen() {
  const router = useRouter();
  const homeLocationLabel = useAppStore((state) => state.homeLocationLabel);
  const locationEnabled = useAppStore((state) => state.locationEnabled);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const setHomeLocationLabel = useAppStore((state) => state.setHomeLocationLabel);
  const setLocationEnabled = useAppStore((state) => state.setLocationEnabled);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const [busyToggle, setBusyToggle] = useState<BusyToggle>(null);

  useEffect(() => {
    let isActive = true;

    async function syncPermissions() {
      const [locationStatus, notificationStatus] = await Promise.all([
        getLocationPermissionStatus(),
        getNotificationPermissionStatus(),
      ]);

      if (!isActive) {
        return;
      }

      if (locationStatus === 'granted') {
        setLocationEnabled(true);

        const locationResult = await resolveHomeLocation({ requestIfNeeded: false });

        if (!isActive) {
          return;
        }

        if (locationResult.granted && locationResult.label) {
          setHomeLocationLabel(locationResult.label);
        }
      } else if (locationStatus === 'denied') {
        setLocationEnabled(false);
      }

      if (notificationStatus === 'granted') {
        setNotificationsEnabled(true);
      } else if (notificationStatus === 'denied') {
        setNotificationsEnabled(false);
      }
    }

    void syncPermissions();

    return () => {
      isActive = false;
    };
  }, [setHomeLocationLabel, setLocationEnabled, setNotificationsEnabled]);

  async function handleLocationToggle(nextValue: boolean) {
    if (!nextValue) {
      setLocationEnabled(false);
      return;
    }

    setBusyToggle('location');
    const result = await resolveHomeLocation({ requestIfNeeded: true });

    if (result.granted) {
      setLocationEnabled(true);
      if (result.label) {
        setHomeLocationLabel(result.label);
      }
    } else {
      setLocationEnabled(false);
      Alert.alert('Location access', result.error ?? 'Unable to enable location access right now.');
    }

    setBusyToggle(null);
  }

  async function handleNotificationsToggle(nextValue: boolean) {
    if (!nextValue) {
      setNotificationsEnabled(false);
      return;
    }

    setBusyToggle('notification');
    const result = await requestNotificationPermission();

    if (result.granted) {
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
      Alert.alert(
        'Notifications',
        result.error ?? 'Unable to enable notifications right now.',
      );
    }

    setBusyToggle(null);
  }

  function handleClose() {
    router.back();
  }

  function handlePlaceholder(label: string) {
    Alert.alert(label, 'This item is ready for the next integration pass.');
  }

  return (
    <View style={styles.root}>
      <Head>
        <meta name="theme-color" content={shellGradients.hero[0]} />
        <meta name="color-scheme" content="dark" />
      </Head>
      <StatusBar backgroundColor={shellGradients.hero[0]} style="light" />
      <GradientSurface colors={shellGradients.hero} style={styles.hero}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.heroSafeArea}>
          <Pressable accessibilityRole="button" onPress={handleClose} style={styles.closeButton}>
            <Ionicons color="#FFFFFF" name="close" size={26} />
          </Pressable>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Welcome!</Text>
            <Text style={styles.heroSubtitle}>
              Sign in to see your account info and order history
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/my-tickets')}
              style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Log In or Sign Up</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GradientSurface>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <SettingSwitchRow
          busy={busyToggle === 'location'}
          icon="location"
          onValueChange={handleLocationToggle}
          subtitle={
            locationEnabled
              ? 'Discover will use your current location.'
              : 'Turn this on to detect nearby places and venues.'
          }
          title="Location Services"
          value={locationEnabled}
        />

        <SettingSwitchRow
          busy={busyToggle === 'notification'}
          icon="notifications"
          onValueChange={handleNotificationsToggle}
          subtitle={
            notificationsEnabled
              ? 'You will receive event and ticket updates.'
              : 'Turn this on for ticket alerts and reminders.'
          }
          title="Notifications"
          value={notificationsEnabled}
        />

        <SettingChevronRow
          icon="home"
          onPress={() => handleLocationToggle(true)}
          title="Home Location"
          value={homeLocationLabel}
        />

        <SettingChevronRow
          icon="settings"
          onPress={() => router.push('/settings/app')}
          title="App Settings"
        />

        <SettingChevronRow
          icon="options"
          onPress={() => handlePlaceholder('Cookie Preferences')}
          title="Cookie Preferences"
        />

        <Text style={[styles.sectionTitle, styles.helpSectionTitle]}>Help & More</Text>

        <SettingChevronRow
          icon="information-circle"
          onPress={() => handlePlaceholder('About')}
          title="About"
        />

        <SettingChevronRow
          icon="help-circle"
          onPress={() => handlePlaceholder('Help and Support')}
          title="Help and Support"
        />
      </ScrollView>
    </View>
  );
}

function SettingSwitchRow({
  busy,
  icon,
  onValueChange,
  subtitle,
  title,
  value,
}: {
  busy: boolean;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onValueChange: (value: boolean) => void | Promise<void>;
  subtitle: string;
  title: string;
  value: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIconWrap}>
        <Ionicons color="#262626" name={icon} size={24} />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      {busy ? (
        <ActivityIndicator color={shellColors.accent} size="small" />
      ) : (
        <Switch
          ios_backgroundColor="#D1D5DB"
          onValueChange={onValueChange}
          thumbColor="#FFFFFF"
          trackColor={{ false: '#D5D7DC', true: '#7CB5F7' }}
          value={value}
        />
      )}
    </View>
  );
}

function SettingChevronRow({
  icon,
  onPress,
  title,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  title: string;
  value?: string;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.rowIconWrap}>
        <Ionicons color="#262626" name={icon} size={24} />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>

      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons color="#1F2937" name="chevron-forward" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: shellColors.lightSurface,
  },
  hero: {
    minHeight: 300,
  },
  heroSafeArea: {
    flex: 1,
    paddingHorizontal: ticketSpacing.lg,
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 42,
    justifyContent: 'center',
    marginTop: ticketSpacing.sm,
    width: 42,
  },
  heroContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: ticketSpacing.xl,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: ticketSpacing.sm,
    textAlign: 'center',
  },
  heroButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: ticketRadii.pill,
    justifyContent: 'center',
    marginTop: ticketSpacing.lg,
    minHeight: 62,
    paddingHorizontal: ticketSpacing.xl,
    width: '100%',
  },
  heroButtonText: {
    color: shellColors.lightText,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: ticketSpacing.xxl,
    paddingHorizontal: ticketSpacing.lg,
    paddingTop: ticketSpacing.lg,
  },
  sectionTitle: {
    color: '#2B2B2B',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: ticketSpacing.md,
  },
  helpSectionTitle: {
    marginTop: ticketSpacing.xl,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: shellColors.lightBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: ticketSpacing.sm,
    minHeight: 78,
  },
  rowIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
    paddingVertical: ticketSpacing.sm,
  },
  rowTitle: {
    color: '#2B2B2B',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  rowSubtitle: {
    color: shellColors.lightTextMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  rowValue: {
    color: shellColors.lightTextMuted,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    maxWidth: 156,
    textAlign: 'right',
  },
});
