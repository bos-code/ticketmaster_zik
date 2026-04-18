import { useSSO } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { getAuthErrorMessage, getOAuthErrorMessage } from '@/lib/auth/errors';
import { getOAuthRedirectUrl } from '@/lib/auth/oauth';
import { AUTH_ROUTES } from '@/lib/auth/routes';
import { socialProviderById, type SocialProviderId } from '@/lib/auth/social-providers';

export function useSocialAuth() {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<SocialProviderId | null>(null);

  async function startSocialAuth(providerId: SocialProviderId) {
    const provider = socialProviderById[providerId];
    setError(null);
    setLoadingProvider(providerId);

    try {
      const { authSessionResult, createdSessionId, setActive } = await startSSOFlow({
        redirectUrl: getOAuthRedirectUrl(),
        strategy: provider.strategy,
      });

      if (authSessionResult?.type && authSessionResult.type !== 'success') {
        throw new Error('Sign in was canceled.');
      }

      if (!createdSessionId) {
        throw new Error('Provider returned without a session. Please try again.');
      }

      if (!setActive) {
        throw new Error('Could not activate the session. Please try again.');
      }

      await setActive({ session: createdSessionId });
      router.replace(AUTH_ROUTES.appHome);
    } catch (caught) {
      const message =
        caught instanceof Error ? getOAuthErrorMessage(caught) : getAuthErrorMessage(caught);
      setError(message);
    } finally {
      setLoadingProvider(null);
    }
  }

  return {
    error,
    loadingProvider,
    startSocialAuth,
  };
}
