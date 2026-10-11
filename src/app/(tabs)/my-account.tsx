import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { AccountIcon, type AccountIconName } from '@/components/account/account-icon';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { fanColors as C } from '@/constants/fan-theme';
import { useFanStore } from '@/store/use-fan-store';
import { useAppStore } from '@/store/use-app-store';
import { useFanPermissions } from '@/hooks/use-fan-permissions';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

export default function MyAccountScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const profile = useFanStore((state) => state.profile);
  const setWatchlistTab = useFanStore((state) => state.setWatchlistTab);
  const locationEnabled = useAppStore((state) => state.locationEnabled);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const { busy, error, changePermission } = useFanPermissions();
  const initials = profile.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const openSection = (section: string) => router.push({ pathname: '/account/[section]', params: { section } });
  return <ScreenWrapper backgroundColor={C.background}>
    <Head><meta name="theme-color" content={C.background} /><meta name="color-scheme" content="dark" /></Head>
    <StatusBar style="light" backgroundColor={C.background} />
    <ScrollView onLayout={layout.onLayout} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingHorizontal: layout.padding }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Edit your profile" onPress={() => openSection('details')} style={styles.profile}>
        <View style={styles.avatar}>{initials ? <Text style={styles.initials}>{initials}</Text> : <Ionicons name="person-outline" size={25} color="white" />}</View><View style={styles.profileCopy}><Text style={styles.name}>{profile.name || 'Set up your profile'}</Text><Text style={styles.email}>{profile.email || 'Add your name and email'}</Text></View><Ionicons name="chevron-forward" size={20} color="white" />
      </Pressable>
      <View style={styles.sections}>
      <Section title="Personalization" width={layout.columnWidth}>
        <Row icon="envelope-outline" label="My Inbox" onPress={() => openSection('inbox')} />
        <Row icon="heart-outline" label="Favourites" onPress={() => { setWatchlistTab('favourites'); router.navigate('/for-you'); }} />
        <Row icon="location-outline" label="Location" last onPress={() => openSection('location')} />
      </Section>
      <Section title="Permissions" width={layout.columnWidth}>
        <PermissionRow icon="paper-plane-outline" label="Location Content" value={locationEnabled} busy={busy === 'location'} disabled={busy !== null} onChange={(value) => void changePermission('location', value)} />
        <PermissionRow icon="bell-outline" label="Notifications" value={notificationsEnabled} busy={busy === 'notifications'} disabled={busy !== null} last onChange={(value) => void changePermission('notifications', value)} />
      </Section>
      <Section title="Account" width={layout.columnWidth}>
        <Row icon="create-outline" label="Edit Details" onPress={() => openSection('details')} />
        <Row icon="shield-checkmark-outline" label="Security" onPress={() => openSection('security')} />
        <Row icon="card-outline" label="Saved Payment Methods" last onPress={() => openSection('payments')} />
      </Section>
      <Section title="Help & Guidance" width={layout.columnWidth}>
        <Row icon="help-circle-outline" label="Need Help?" onPress={() => openSection('help')} />
        <Row icon="chatbubble-outline" label="Give Us Feedback" onPress={() => openSection('feedback')} />
        <Row customIcon={<Ionicons name="eye-outline" size={21} color="white" />} label="Privacy" onPress={() => openSection('privacy')} />
        <Row icon="document-text-outline" label="Legal" last onPress={() => openSection('legal')} />
      </Section>
      </View>
      {Boolean(error) && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <View style={styles.footer}><Pressable accessibilityRole="button" onPress={() => router.push('/settings/app')}><Text style={styles.footerLink}>App settings</Text></Pressable><Text style={styles.footerLink}>·</Text><Pressable accessibilityRole="button" onPress={() => router.push('/admin')}><Text style={styles.footerLink}>Manage events</Text></Pressable></View>
    </ScrollView>
  </ScreenWrapper>;
}
function Section({ title, children, width }: { title: string; children: React.ReactNode; width: number }) {
  return <View style={[styles.section, { width }]}><Text style={styles.sectionTitle}>{title}</Text><View>{children}</View></View>;
}
function Row({ icon, customIcon, label, last, onPress }: { icon?: AccountIconName; customIcon?: React.ReactNode; label: string; last?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: '#303030' }]}><View style={styles.rowIcon}>{customIcon ?? (icon && <AccountIcon name={icon} size={21} color="white" />)}</View><Text style={styles.rowLabel}>{label}</Text><Ionicons name="chevron-forward" size={18} color="white" /></Pressable>;
}
function PermissionRow({ icon, label, value, busy, disabled, last, onChange }: { icon: AccountIconName; label: string; value: boolean; busy: boolean; disabled: boolean; last?: boolean; onChange: (value: boolean) => void }) {
  return <View style={[styles.row, styles.permissionRow, !last && styles.rowBorder]}><View style={styles.rowIcon}><AccountIcon name={icon} size={21} color="white" /></View><Text style={styles.rowLabel}>{label}</Text>{busy ? <ActivityIndicator color={C.purple} size="small" /> : <Switch accessibilityLabel={label} disabled={disabled} value={value} onValueChange={onChange} thumbColor="white" ios_backgroundColor="#646464" trackColor={{ false: '#646464', true: C.blue }}  />}</View>;
}
const styles = StyleSheet.create({
  content: { paddingHorizontal: 15, paddingTop: 1, paddingBottom: 24 }, profile: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }, avatar: { height: 52, width: 52, borderRadius: 30, borderWidth: 3, borderColor: '#3378F6', alignItems: 'center', justifyContent: 'center' }, initials: { color: 'white', fontSize: 17, fontWeight: '800' }, profileCopy: { flex: 1, minWidth: 0, gap: 4 }, name: { color: 'white', fontSize: 17, fontWeight: '700' }, email: { color: C.muted, fontSize: 14, lineHeight: 20 },
  sections: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 }, section: { minWidth: 0 }, sectionTitle: { color: 'white', fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 14, backgroundColor: C.surface }, rowBorder: { borderBottomWidth: 1, borderBottomColor: C.background }, rowIcon: { width: 24, alignItems: 'center' }, rowLabel: { color: 'white', fontSize: 16, lineHeight: 22, flex: 1, paddingVertical: 14 }, permissionRow: { minHeight: 56 }, error: { color: '#FFD6AA', fontSize: 12, lineHeight: 18, marginBottom: 20 }, footer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 24, justifyContent: 'center', alignItems: 'center', gap: 15, paddingVertical: 8 }, footerLink: { color: C.muted, fontSize: 14, lineHeight: 20, paddingVertical: 12 },
});
