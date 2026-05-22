import { useRouter } from 'expo-router';
import React, { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthErrorMessage } from '@/components/auth/auth-error-message';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import {
  getAdminPassKeyLength,
  isAdminSessionUnlocked,
  unlockAdminSession,
  verifyAdminPassKey,
} from '@/lib/admin-pass-key';

type ProtectedAdminRouteProps = {
  children: ReactNode;
};

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(isAdminSessionUnlocked);
  const [passKey, setPassKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const passKeyDotCount = getAdminPassKeyLength();

  function handlePassKeyChange(value: string) {
    setPassKey(value);

    if (error) {
      setError(null);
    }
  }

  function handleUnlock() {
    if (!passKey.trim()) {
      setError('Enter the admin pass key.');
      return;
    }

    if (!verifyAdminPassKey(passKey)) {
      setError('That pass key is not correct.');
      setPassKey('');
      return;
    }

    unlockAdminSession();
    setIsUnlocked(true);
    setError(null);
    setPassKey('');
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/my-tickets');
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <AuthScreen
      eyebrow="Admin Lock"
      subtitle="Enter the shared pass key or PIN to manage tickets."
      title="Admin Locked"
    >
      <View style={styles.lockPanel}>
        <View style={styles.lockBadge}>
          <Text style={styles.lockBadgeText}>KEY</Text>
        </View>
        <View style={styles.lockCopy}>
          <Text style={styles.lockTitle}>Pass key required</Text>
          <Text style={styles.lockSubtitle}>Use the key or numeric PIN provided for admin access.</Text>
        </View>
      </View>

      <View style={styles.passKeyDots}>
        {Array.from({ length: passKeyDotCount }).map((_, index) => (
          <View
            key={index}
            style={[styles.passKeyDot, index < passKey.length && styles.passKeyDotActive]}
          />
        ))}
      </View>

      <AuthTextInput
        autoComplete="off"
        label="Pass Key"
        maxLength={32}
        onChangeText={handlePassKeyChange}
        onSubmitEditing={handleUnlock}
        placeholder="Enter pass key"
        returnKeyType="done"
        secureTextEntry
        textContentType="password"
        value={passKey}
      />
      <AuthErrorMessage message={error} />
      <AuthButton label="Unlock Admin" onPress={handleUnlock} />
      <AuthButton label="Back" onPress={handleBack} variant="ghost" />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  lockBadge: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  lockBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
  },
  lockCopy: {
    flex: 1,
    gap: 2,
  },
  lockPanel: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  lockSubtitle: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  lockTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  passKeyDot: {
    backgroundColor: '#CBD5E1',
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  passKeyDotActive: {
    backgroundColor: '#005BD3',
  },
  passKeyDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 24,
  },
});
