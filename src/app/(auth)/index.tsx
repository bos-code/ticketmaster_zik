import { useRouter } from 'expo-router';
import React from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthSection } from '@/components/auth/auth-section';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { useSocialAuth } from '@/hooks/use-social-auth';
import { AUTH_ROUTES } from '@/lib/auth/routes';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const { error, loadingProvider, startSocialAuth } = useSocialAuth();

  return (
    <AuthScreen
      eyebrow="Secure access"
      title="Your tickets, protected."
      subtitle="Use a one-time email or SMS code, or continue with Google. No passwords here.">
      <AuthSection title="Google">
        <SocialAuthButtons
          error={error}
          loadingProvider={loadingProvider}
          onPress={startSocialAuth}
        />
      </AuthSection>

      <AuthSection title="One-time code">
        <AuthButton
          label="Sign in with email or phone"
          onPress={() => router.push(AUTH_ROUTES.signIn)}
        />
        <AuthButton
          label="Create account with email or phone"
          onPress={() => router.push(AUTH_ROUTES.signUp)}
          variant="secondary"
        />
      </AuthSection>

      <AuthLinkRow
        href={AUTH_ROUTES.signIn}
        label="Already started?"
        linkLabel="Sign in"
      />
    </AuthScreen>
  );
}
