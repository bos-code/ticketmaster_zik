export type SocialProviderId = 'google';

export type OAuthStrategy = 'oauth_google';

export type SocialProviderConfig = {
  id: SocialProviderId;
  label: string;
  shortLabel: string;
  strategy: OAuthStrategy;
};

export const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  {
    id: 'google',
    label: 'Continue with Google',
    shortLabel: 'Google',
    strategy: 'oauth_google',
  },
];

export const socialProviderById = SOCIAL_PROVIDERS.reduce(
  (result, provider) => {
    result[provider.id] = provider;
    return result;
  },
  {} as Record<SocialProviderId, SocialProviderConfig>,
);
