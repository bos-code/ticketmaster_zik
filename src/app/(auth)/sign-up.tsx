import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthSection } from '@/components/auth/auth-section';
import { OtpStartForm } from '@/components/auth/otp-start-form';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { useOtpAuth } from '@/hooks/use-otp-auth';
import { useSocialAuth } from '@/hooks/use-social-auth';
import {
  getOtpMethodLabel,
  normalizeOtpIdentifier,
  validateOtpIdentifier,
  type OtpMethod,
} from '@/lib/auth/otp';
import { AUTH_ROUTES } from '@/lib/auth/routes';

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, startOtp } = useOtpAuth();
  const { error: socialError, loadingProvider, startSocialAuth } = useSocialAuth();
  const [method, setMethod] = useState<OtpMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const validationError = validateOtpIdentifier(method, identifier);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedIdentifier = normalizeOtpIdentifier(method, identifier);
      await startOtp('sign-up', method, normalizedIdentifier);
      router.push({
        pathname: AUTH_ROUTES.verifyOtp,
        params: {
          flow: 'sign-up',
          identifier: normalizedIdentifier,
          method,
        },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send the code.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreen
      eyebrow="Create account"
      title="Start with a code."
      subtitle="Create your account with email or SMS verification. No passwords.">
      <AuthSection title="One-time code">
        <OtpStartForm
          buttonLabel={`Send ${getOtpMethodLabel(method)} code`}
          disabled={!isLoaded}
          identifier={identifier}
          error={error}
          loading={isSubmitting}
          method={method}
          onChangeIdentifier={(value) => {
            setIdentifier(value);
            setError(null);
          }}
          onChangeMethod={(value) => {
            setMethod(value);
            setIdentifier('');
            setError(null);
          }}
          onSubmit={handleSubmit}
        />
      </AuthSection>

      <AuthSection title="Google">
        <SocialAuthButtons
          error={socialError}
          loadingProvider={loadingProvider}
          onPress={startSocialAuth}
        />
      </AuthSection>

      <AuthLinkRow
        href={AUTH_ROUTES.signIn}
        label="Already have an account?"
        linkLabel="Sign in"
      />
    </AuthScreen>
  );
}
