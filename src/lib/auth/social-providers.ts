export type SocialProviderId = 'google';

type SocialProvider = {
  id: SocialProviderId;
  label: string;
  strategy: 'oauth_google';
};

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    id: 'google',
    label: 'Continue with Google',
    strategy: 'oauth_google',
  },
];

export const socialProviderById: Record<SocialProviderId, SocialProvider> = {
  google: SOCIAL_PROVIDERS[0],
};
