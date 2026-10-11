import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/app-text';
import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import { fanColors as C } from '@/constants/fan-theme';
import { useFanStore } from '@/store/use-fan-store';
import { useAppStore } from '@/store/use-app-store';
import { useFanPermissions } from '@/hooks/use-fan-permissions';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

const titles: Record<string, string> = { inbox: 'My Inbox', location: 'Location', details: 'Edit Details', security: 'Security', payments: 'Saved Payment Methods', help: 'Need Help?', feedback: 'Give Us Feedback', privacy: 'Privacy', legal: 'Legal' };
const locations = ['Los Angeles, CA, US', 'New York, NY, US', 'Chicago, IL, US', 'Lagos, Lagos, NG', 'London, UK'];
const helpTopics = [
  { title: 'Where are my tickets?', body: 'Open My Tickets, choose Upcoming or Past, then select an event. If you do not see your event, use Refresh to check for updated tickets.' },
  { title: 'How do I view a ticket?', body: 'Select your event in My Tickets, then tap View Tickets. Swipe between tickets to see each seat and its barcode.' },
  { title: 'How do I transfer a ticket?', body: 'Open your event and select Transfer. Choose the seats to send, enter the recipient’s details, and continue through confirmation.' },
  { title: 'How do I save an event?', body: 'On Home, tap the three dots on an event and choose Save to Watchlist. Your saved events and favourite artists appear in Watchlist.' },
];

export function AccountDetailScreen({ section }: { section: string }) {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const profile = useFanStore((state) => state.profile);
  const updateProfile = useFanStore((state) => state.updateProfile);
  const location = useAppStore((state) => state.homeLocationLabel);
  const hasChosenLocation = useAppStore((state) => state.hasChosenLocation);
  const setLocation = useAppStore((state) => state.setHomeLocationLabel);
  const { busy, error: permissionError, changePermission } = useFanPermissions();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [city, setCity] = useState(hasChosenLocation ? location : '');
  const [error, setError] = useState('');
  useEffect(() => { setName(profile.name); setEmail(profile.email); }, [profile.name, profile.email]);
  const [expandedHelp, setExpandedHelp] = useState<number | null>(null);
  const filteredLocations = locations.filter((value) => value.toLowerCase().includes(city.toLowerCase().trim()) || city === location);
  async function openLink(url: string) {
    try { await Linking.openURL(url); } catch { setError('Unable to open this page. Please try again.'); }
  }
  function closeDetails() {
    if (router.canGoBack()) router.back();
    else router.replace('/my-account');
  }
  function saveProfile() {
    if (!name.trim()) { setError('Enter your name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    updateProfile({ name: name.trim(), email: email.trim() });
    closeDetails();
  }
  async function handleCurrentLocation() {
    await changePermission('location', true);
    if (useAppStore.getState().locationEnabled && useAppStore.getState().hasChosenLocation) {
      setCity(useAppStore.getState().homeLocationLabel);
    }
  }
  function chooseLocation(value: string) {
    if (!value.trim()) { setError('Enter a city or ZIP code.'); return; }
    setLocation(value.trim()); closeDetails();
  }
  const title = titles[section];
  return <ScreenWrapper backgroundColor={C.background}>
    <Head><meta name="theme-color" content={C.background} /><meta name="color-scheme" content="dark" /></Head><StatusBar style="light" backgroundColor={C.background} />
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={closeDetails} style={styles.back}><Ionicons name="arrow-back" size={23} color="white" /></Pressable><Text style={styles.title}>{title ?? 'Page unavailable'}</Text><View style={{ width: 44 }} /></View>
    <ScrollView onLayout={layout.onLayout} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingHorizontal: layout.padding }]} showsVerticalScrollIndicator={false}>
      {section === 'details' && <><Field label="Name" value={name} onChange={setName} autoComplete="name" /><Field label="Email" value={email} onChange={setEmail} keyboardType="email-address" autoComplete="email" /><Text style={styles.body}>Your profile is saved on this device and appears on the Account screen.</Text><Action label={profile.name ? "Save Details" : "Save Profile"} onPress={saveProfile} /></>}
      {section === 'location' && <><Text style={styles.body}>Choose a location to personalize your experience.</Text><Field label="City or ZIP code" value={city} onChange={setCity} placeholder="Enter your city or ZIP code" />
        <Action label={Platform.OS === 'web' ? 'Enable Location Access' : 'Use Current Location'} secondary disabled={busy !== null} onPress={() => void handleCurrentLocation()} icon="navigate-outline" />{busy === 'location' && <ActivityIndicator color={C.teal} />}
        <Text style={styles.label}>LOCATIONS</Text>{filteredLocations.map((value) => <Pressable key={value} accessibilityRole="button" onPress={() => chooseLocation(value)} style={styles.locationRow}><Ionicons name="location-outline" size={20} color={C.teal} /><Text style={styles.rowText}>{value}</Text>{location === value && <Ionicons name="checkmark" size={18} color={C.teal} />}</Pressable>)}<Action label="Save Location" onPress={() => chooseLocation(city)} />
      </>}
      {section === 'inbox' && <View style={styles.empty}><Ionicons name="mail-outline" color="white" size={48} /><Text style={styles.emptyTitle}>You’re all caught up</Text><Text style={[styles.body, styles.centered]}>Event updates and important ticket information will appear here.</Text><Action label="View My Tickets" onPress={() => router.navigate('/my-tickets')} /></View>}
      {section === 'payments' && <View style={styles.empty}><Ionicons name="card-outline" color="white" size={48} /><Text style={styles.emptyTitle}>No saved payment methods</Text><Text style={[styles.body, styles.centered]}>Manage your payment methods in your Ticketmaster account.</Text><Action label="Manage Payment Methods" onPress={() => void openLink('https://www.ticketmaster.com/member')} /></View>}
      {section === 'security' && <><Ionicons name="shield-checkmark-outline" size={40} color={C.blue} /><Text style={styles.emptyTitle}>Sign-in & Security</Text><Text style={styles.body}>Manage your password and sign-in settings in your Ticketmaster account.</Text><Action label="Open Account Security" onPress={() => void openLink('https://www.ticketmaster.com/member')} /></>}
      {section === 'help' && <><Text style={styles.body}>Find answers to common questions.</Text>{helpTopics.map((topic, index) => <View key={topic.title} style={styles.helpTopic}><Pressable accessibilityRole="button" accessibilityState={{ expanded: expandedHelp === index }} onPress={() => setExpandedHelp(expandedHelp === index ? null : index)} style={styles.helpRow}><Text style={styles.rowText}>{topic.title}</Text><Ionicons name={expandedHelp === index ? 'remove' : 'add'} size={20} color="white" /></Pressable>{expandedHelp === index && <Text style={[styles.body, { padding: 15, paddingTop: 0 }]}>{topic.body}</Text>}</View>)}<Action label="Visit Help Center" secondary onPress={() => void openLink('https://help.ticketmaster.com/')} /></>}
      {section === 'feedback' && <><Text style={styles.emptyTitle}>We’d love to hear from you</Text><Text style={styles.body}>Tell us what’s working and what could be better.</Text><Action label="Open Feedback & Support" onPress={() => void openLink('https://help.ticketmaster.com/')} /><Text style={styles.body}>Support opens in your browser.</Text></>}
      {section === 'privacy' && <><Ionicons name="eye-outline" size={38} color="white" /><Text style={styles.emptyTitle}>Your Privacy</Text><Text style={styles.body}>Saved events, favourites and profile preferences are kept on this device.</Text><Action label="Read Ticketmaster Privacy Policy" secondary onPress={() => void openLink('https://privacy.ticketmaster.com/')} /></>}
      {section === 'legal' && <><Text style={styles.emptyTitle}>Terms & Policies</Text><Action label="Terms of Use" secondary onPress={() => void openLink('https://legal.ticketmaster.com/')} /><Action label="Privacy Policy" secondary onPress={() => void openLink('https://privacy.ticketmaster.com/')} /></>}
      {!title && <><Text style={styles.body}>This page could not be found.</Text><Action label="Back to Account" onPress={() => router.replace('/my-account')} /></>}
      {Boolean(error || permissionError) && <Text accessibilityRole="alert" style={styles.error}>{error || permissionError}</Text>}
    </ScrollView>
  </ScreenWrapper>;
}
function Field({ label, value, onChange, ...props }: { label: string; value: string; onChange: (value: string) => void } & Omit<React.ComponentProps<typeof TextInput>, 'onChange'>) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} accessibilityLabel={label} value={value} onChangeText={onChange} placeholderTextColor="#909090" autoCapitalize={label === 'Email' ? 'none' : 'words'} style={styles.input} /></View>;
}
function Action({ label, onPress, secondary, disabled, icon }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, secondary && styles.secondaryAction, (pressed || disabled) && { opacity: 0.65 }]}>{icon && <Ionicons name={icon} size={19} color="white" />}<Text style={styles.actionLabel}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }, back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, title: { flex: 1, color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' }, content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, paddingTop: 25, gap: 20, paddingBottom: 40 },
  body: { color: C.muted, fontSize: 16, lineHeight: 24 }, label: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }, field: { gap: 9 }, fieldLabel: { color: 'white', fontSize: 14, fontWeight: '600' }, input: { minHeight: 48, paddingHorizontal: 14, paddingVertical: 12, color: 'white', fontSize: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: '#444444' },
  action: { backgroundColor: C.blue, minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 }, secondaryAction: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#737373' }, actionLabel: { color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' }, locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, minHeight: 46, paddingHorizontal: 15 }, rowText: { flex: 1, color: 'white', fontSize: 16 }, empty: { alignItems: 'center', gap: 22, paddingTop: 75 }, emptyTitle: { color: 'white', fontSize: 20, fontWeight: '700' }, centered: { textAlign: 'center' }, helpTopic: { backgroundColor: C.surface }, helpRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', padding: 15, gap: 10 }, error: { color: '#FFD6AA', fontSize: 13, lineHeight: 20 },
});
