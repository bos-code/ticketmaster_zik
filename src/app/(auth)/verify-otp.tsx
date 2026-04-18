import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthErrorMessage } from '@/components/auth/auth-error-message';
import { AuthScreen } from '@/components/auth/auth-screen';
import { OtpCodeInput } from '@/components/auth/otp-code-input';
import { ticketColors, ticketSpacing } from '@/constants/ticket-theme';
import { useOtpVerification } from '@/hooks/use-otp-verification';
import {
  getOtpFlowLabel,
  getOtpMethodLabel,
  isOtpFlow,
  isOtpMethod,
  normalizeOtpIdentifier,
} from '@/lib/auth/otp';
import { AUTH_ROUTES } from '@/lib/auth/routes';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ flow?: string; identifier?: string; method?: string }>();
  const rawFlow = getParam(params.flow);
  const rawIdentifier = getParam(params.identifier);
  const rawMethod = getParam(params.method);
  const flow = isOtpFlow(rawFlow) ? rawFlow : 'sign-in';
  const method = isOtpMethod(rawMethod) ? rawMethod : 'email';
  const identifier = rawIdentifier ? normalizeOtpIdentifier(method, rawIdentifier) : '';
  const hasValidParams = isOtpFlow(rawFlow) && isOtpMethod(rawMethod) && Boolean(identifier);
  const verification = useOtpVerification(flow, method, identifier);

  if (!hasValidParams) {
    return (
      <AuthScreen
        eyebrow="Code expired"
        title="Request a fresh code."
        subtitle="We could not find a valid OTP request for this screen.">
        <AuthButton label="Back to sign in" onPress={() => router.replace(AUTH_ROUTES.signIn)} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      eyebrow={`Verify ${getOtpMethodLabel(method)}`}
      title="Enter the 6-digit code."
      subtitle={`We sent a code to ${identifier}. Use it to ${getOtpFlowLabel(flow)}.`}>
      <View style={styles.form}>
        <OtpCodeInput
          disabled={verification.isBusy}
          onChangeCode={verification.setCode}
          value={verification.code}
        />

        <AuthErrorMessage message={verification.error} />

        <AuthButton
          disabled={!verification.isLoaded || Boolean(verification.codeError)}
          label="Verify code"
          loading={verification.status === 'submitting'}
          onPress={verification.submit}
        />

        <View style={styles.resendWrap}>
          <Text style={styles.resendText}>
            {verification.canResend
              ? 'Did not receive it?'
              : `Resend available in ${verification.secondsRemaining}s`}
          </Text>
          <AuthButton
            disabled={!verification.canResend || verification.isBusy}
            label="Resend code"
            loading={verification.status === 'resending'}
            onPress={verification.resend}
            variant="ghost"
          />
        </View>

        <AuthButton
          label={flow === 'sign-in' ? 'Use another email' : 'Back to signup'}
          onPress={() => router.replace(flow === 'sign-in' ? AUTH_ROUTES.signIn : AUTH_ROUTES.signUp)}
          variant="secondary"
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: ticketSpacing.md,
  },
  resendWrap: {
    alignItems: 'center',
    gap: ticketSpacing.xs,
  },
  resendText: {
    color: ticketColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
