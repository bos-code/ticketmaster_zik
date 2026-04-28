import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AccountIcon,
  type AccountIconName,
} from '@/components/account/account-icon';

const C = {
  headerBg: '#161616',
  headerTitle: '#FFFFFF',
  bodyBg: '#FFFFFF',
  sectionBg: '#FFFFFF',
  sectionHeader: '#000000',
  rowLabel: '#000000',
  rowIcon: '#000000',
  rowSeparator: '#E5E5E5',
  sectionDivider: '#E5E5E5',
  chevron: '#C7C7CC',
  primary: '#007AFF',
  switchThumb: '#FFFFFF',
  switchTrackOff: '#D1D1D6',
  switchTrackOn: '#34C759',
} as const;

const accountFont = Platform.select({
  ios: 'SF Pro Display',
  android: 'sans-serif',
  web: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  default: undefined,
});

function RowIconSlot({ icon, customElement }: { icon?: AccountIconName; customElement?: React.ReactNode }) {
  if (customElement) {
    return (
      <View style={styles.rowIcon}>
        {customElement}
      </View>
    );
  }
  return (
    <View style={styles.rowIcon}>
      {icon && <AccountIcon color={C.rowIcon} name={icon} size={21} />}
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function ChevronRow({
  icon,
  customIcon,
  label,
  isLast = false,
  onPress,
}: {
  icon?: AccountIconName;
  customIcon?: React.ReactNode;
  label: string;
  isLast?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.55}
      onPress={onPress}
      style={[styles.row, !isLast && styles.rowBorder]}
    >
      <View style={styles.rowLeft}>
        <RowIconSlot customElement={customIcon} icon={icon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.trailingIcon}>
        <AccountIcon color={C.chevron} name="chevron-forward" size={17} />
      </View>
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
  isLast = false,
}: {
  icon: AccountIconName;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <RowIconSlot icon={icon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch
        ios_backgroundColor={C.switchTrackOff}
        onValueChange={onChange}
        thumbColor={C.switchThumb}
        trackColor={{ false: C.switchTrackOff, true: C.switchTrackOn }}
        value={value}
        style={styles.toggle}
      />
    </View>
  );
}

function ValueRow({
  icon,
  customIcon,
  label,
  value,
  isLast = false,
}: {
  icon?: AccountIconName;
  customIcon?: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.55}
      style={[styles.row, !isLast && styles.rowBorder]}
    >
      <View style={styles.rowLeft}>
        <RowIconSlot customElement={customIcon} icon={icon} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.valueRight}>
        <Text style={styles.rowValue}>{value}</Text>
        <View style={styles.editIcon}>
          <AccountIcon color={C.primary} name="edit-outline" size={16} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyAccountScreen() {
  const router = useRouter();
  const [receiveNotifs, setReceiveNotifs] = useState(false);
  const [locationContent, setLocationContent] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />

      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentOffset={{ x: 0, y: 130 }}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.hiddenHeader}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome to <Text style={styles.logoText}>ticketmaster</Text>
            </Text>
            <TouchableOpacity style={styles.signInButton} activeOpacity={0.8}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 24 }} />
        <SectionHeader label="Notifications" />
        <View style={styles.group}>
          <ChevronRow icon="envelope-outline" label="My Notifications" />
          <ToggleRow
            icon="bell-outline"
            isLast
            label="Receive Notifications?"
            onChange={setReceiveNotifs}
            value={receiveNotifs}
          />
        </View>

        <Divider />

        <SectionHeader label="Location Settings" />
        <View style={styles.group}>
          <ValueRow
            icon="location-outline"
            label="My Location"
            value="Los Angeles, CA"
          />
          <ValueRow
            customIcon={
              <View style={styles.usFlagIcon}>
                <Text style={{ fontSize: 13, lineHeight: 18 }}>🇺🇸</Text>
              </View>
            }
            label="My Country"
            value="United States"
          />
          <ToggleRow
            icon="paper-plane-outline"
            isLast
            label="Location Based Content"
            onChange={setLocationContent}
            value={locationContent}
          />
        </View>

        <Divider />

        <SectionHeader label="Preferences" />
        <View style={styles.group}>
          <ChevronRow icon="heart-outline" label="My Favourites" />
          <ChevronRow
            icon="create-outline"
            label="Edit Details"
            onPress={() => router.push('/admin')}
          />
          <ChevronRow icon="shield-checkmark-outline" label="Security" />
          <ChevronRow icon="card-outline" label="Saved Payment Methods" />
          <ChevronRow
            customIcon={
              <View style={styles.appIconWrapper}>
                <Text style={styles.appIconLetter}>t</Text>
              </View>
            }
            isLast
            label="Change App Icon"
          />
        </View>

        <Divider />

        <SectionHeader label="Help & Guidance" />
        <View style={styles.group}>
          <ChevronRow icon="help-circle-outline" label="Help Center" isLast />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bodyBg,
  },
  headerSafe: {
    backgroundColor: C.headerBg,
  },
  header: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.headerBg,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: C.headerTitle,
    fontFamily: accountFont,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
  hiddenHeader: {
    backgroundColor: C.headerBg,
    width: '100%',
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: accountFont,
    marginBottom: 20,
  },
  logoText: {
    fontWeight: '800',
    fontStyle: 'italic',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  signInButton: {
    backgroundColor: '#026CDF',
    width: '100%',
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    backgroundColor: C.bodyBg,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    color: C.sectionHeader,
    fontFamily: accountFont,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  group: {
    backgroundColor: C.sectionBg,
  },
  row: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.sectionBg,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.rowSeparator,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingIcon: {
    width: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'visible',
  },
  rowLabel: {
    flex: 1,
    color: C.rowLabel,
    fontFamily: accountFont,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
  },
  valueRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 2,
  },
  editIcon: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  rowValue: {
    color: C.primary,
    fontFamily: accountFont,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
  },
  toggle: {
    ...Platform.select({ android: { transform: [{ scale: 0.85 }] } }),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.sectionDivider,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  usFlagIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CCCCCC',
  },
  appIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: C.rowIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconLetter: {
    fontFamily: accountFont,
    fontSize: 14,
    fontWeight: '700',
    color: C.rowIcon,
    includeFontPadding: false,
    lineHeight: 16,
  },
});
