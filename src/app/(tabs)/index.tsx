import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { ticketColors, ticketRadii, ticketSpacing } from '@/constants/ticket-theme';
import { AUTH_ROUTES } from '@/lib/auth/routes';

export default function ProtectedHomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace(AUTH_ROUTES.welcome);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Protected Home</Text>
          <Text style={styles.title}>You are signed in.</Text>
          <Text style={styles.body}>
            Clerk is the source of truth for this session. Supabase is available for data, but not
            for login.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Current user</Text>
          <Text style={styles.email}>
            {user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'Signed in'}
          </Text>
        </View>

        <AuthButton
          label="Sign out"
          loading={isSigningOut}
          onPress={handleSignOut}
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: ticketColors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: ticketSpacing.lg,
    justifyContent: 'center',
    padding: ticketSpacing.lg,
  },
  header: {
    gap: ticketSpacing.sm,
  },
  eyebrow: {
    color: ticketColors.primaryBright,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: ticketColors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 40,
  },
  body: {
    color: ticketColors.textMuted,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  panel: {
    backgroundColor: ticketColors.chrome,
    borderColor: ticketColors.borderStrong,
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    gap: ticketSpacing.xs,
    padding: ticketSpacing.lg,
  },
  panelLabel: {
    color: ticketColors.textSubtle,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  email: {
    color: ticketColors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
});
