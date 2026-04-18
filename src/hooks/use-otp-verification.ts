import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { useOtpAuth } from '@/hooks/use-otp-auth';
import { useResendCountdown } from '@/hooks/use-resend-countdown';
import { normalizeOtp, validateOtp, type OtpFlow, type OtpMethod } from '@/lib/auth/otp';
import { AUTH_ROUTES } from '@/lib/auth/routes';

type VerificationStatus = 'idle' | 'submitting' | 'resending' | 'complete';

export function useOtpVerification(flow: OtpFlow, method: OtpMethod, identifier: string) {
  const router = useRouter();
  const { isLoaded, resendOtp, verifyOtp } = useOtpAuth();
  const { canResend, restart, secondsRemaining } = useResendCountdown();
  const [code, setCodeValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('idle');

  const codeError = useMemo(() => validateOtp(code), [code]);
  const isBusy = status === 'submitting' || status === 'resending';

  function setCode(value: string) {
    setCodeValue(normalizeOtp(value));
    setError(null);
  }

  async function submit() {
    const validationError = validateOtp(code);

    if (validationError) {
      setError(validationError);
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      await verifyOtp(flow, method, code);
      setStatus('complete');
      router.replace(AUTH_ROUTES.appHome);
    } catch (caught) {
      setStatus('idle');
      setError(caught instanceof Error ? caught.message : 'Could not verify that code.');
    }
  }

  async function resend() {
    if (!canResend || isBusy) {
      return;
    }

    setStatus('resending');
    setError(null);

    try {
      await resendOtp(flow, method, identifier);
      restart();
      setCodeValue('');
      setStatus('idle');
    } catch (caught) {
      setStatus('idle');
      setError(caught instanceof Error ? caught.message : 'Could not resend the code.');
    }
  }

  return {
    canResend,
    code,
    codeError,
    error,
    isBusy,
    isLoaded,
    resend,
    secondsRemaining,
    setCode,
    status,
    submit,
  };
}
