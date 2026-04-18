import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthErrorMessage } from '@/components/auth/auth-error-message';
import { SOCIAL_PROVIDERS, type SocialProviderId } from '@/lib/auth/social-providers';

type SocialAuthButtonsProps = {
  error?: string | null;
  loadingProvider?: SocialProviderId | null;
  onPress: (providerId: SocialProviderId) => void;
};

export function SocialAuthButtons({ error, loadingProvider, onPress }: SocialAuthButtonsProps) {
  return (
    <View style={styles.wrap}>
      {SOCIAL_PROVIDERS.map((provider) => (
        <AuthButton
          disabled={loadingProvider !== null}
          key={provider.id}
          label={provider.label}
          loading={loadingProvider === provider.id}
          onPress={() => onPress(provider.id)}
          variant="secondary"
        />
      ))}
      <Text style={styles.note}>Production sign-in uses Google plus one-time codes.</Text>
      <AuthErrorMessage message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  note: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
});
