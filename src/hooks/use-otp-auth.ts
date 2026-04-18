import { useSignIn, useSignUp } from '@clerk/expo/legacy';

import { getAuthErrorMessage } from '@/lib/auth/errors';
import {
  normalizeOtpIdentifier,
  type OtpFlow,
  type OtpMethod,
} from '@/lib/auth/otp';

type EmailCodeFactor = {
  strategy: 'email_code';
  emailAddressId: string;
};

type PhoneCodeFactor = {
  strategy: 'phone_code';
  phoneNumberId: string;
};

function findEmailCodeFactor(factors: unknown): EmailCodeFactor | null {
  if (!Array.isArray(factors)) {
    return null;
  }

  return (
    factors.find(
      (factor): factor is EmailCodeFactor =>
        typeof factor === 'object' &&
        factor !== null &&
        'strategy' in factor &&
        factor.strategy === 'email_code' &&
        'emailAddressId' in factor &&
        typeof factor.emailAddressId === 'string',
    ) ?? null
  );
}

function findPhoneCodeFactor(factors: unknown): PhoneCodeFactor | null {
  if (!Array.isArray(factors)) {
    return null;
  }

  return (
    factors.find(
      (factor): factor is PhoneCodeFactor =>
        typeof factor === 'object' &&
        factor !== null &&
        'strategy' in factor &&
        factor.strategy === 'phone_code' &&
        'phoneNumberId' in factor &&
        typeof factor.phoneNumberId === 'string',
    ) ?? null
  );
}

export function useOtpAuth() {
  const { isLoaded: isSignInLoaded, setActive, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();

  const isLoaded = isSignInLoaded && isSignUpLoaded;

  async function startOtp(flow: OtpFlow, method: OtpMethod, rawIdentifier: string) {
    if (!isLoaded || !signIn || !signUp) {
      throw new Error('Authentication is still loading. Try again in a moment.');
    }

    const identifier = normalizeOtpIdentifier(method, rawIdentifier);

    try {
      if (flow === 'sign-in') {
        await signIn.create({
          identifier,
          strategy: method === 'email' ? 'email_code' : 'phone_code',
        });
        return;
      }

      if (method === 'email') {
        await signUp.create({ emailAddress: identifier });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        return;
      }

      await signUp.create({ phoneNumber: identifier });
      await signUp.preparePhoneNumberVerification({
        channel: 'sms',
        strategy: 'phone_code',
      });
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function resendOtp(flow: OtpFlow, method: OtpMethod, rawIdentifier: string) {
    if (!isLoaded || !signIn || !signUp) {
      throw new Error('Authentication is still loading. Try again in a moment.');
    }

    const identifier = normalizeOtpIdentifier(method, rawIdentifier);

    try {
      if (flow === 'sign-in') {
        if (method === 'email') {
          const factor = findEmailCodeFactor(signIn.supportedFirstFactors);

          if (factor) {
            await signIn.prepareFirstFactor({
              emailAddressId: factor.emailAddressId,
              strategy: 'email_code',
            });
            return;
          }

          await signIn.create({ identifier, strategy: 'email_code' });
          return;
        }

        const factor = findPhoneCodeFactor(signIn.supportedFirstFactors);

        if (factor) {
          await signIn.prepareFirstFactor({
            channel: 'sms',
            phoneNumberId: factor.phoneNumberId,
            strategy: 'phone_code',
          });
          return;
        }

        await signIn.create({ identifier, strategy: 'phone_code' });
        return;
      }

      if (method === 'email') {
        if (signUp.emailAddress !== identifier) {
          await signUp.create({ emailAddress: identifier });
        }

        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        return;
      }

      if (signUp.phoneNumber !== identifier) {
        await signUp.create({ phoneNumber: identifier });
      }

      await signUp.preparePhoneNumberVerification({
        channel: 'sms',
        strategy: 'phone_code',
      });
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  async function verifyOtp(flow: OtpFlow, method: OtpMethod, code: string) {
    if (!isLoaded || !signIn || !signUp) {
      throw new Error('Authentication is still loading. Try again in a moment.');
    }

    try {
      const attempt =
        flow === 'sign-in'
          ? await signIn.attemptFirstFactor({
              code,
              strategy: method === 'email' ? 'email_code' : 'phone_code',
            })
          : method === 'email'
            ? await signUp.attemptEmailAddressVerification({ code })
            : await signUp.attemptPhoneNumberVerification({ code });

      const createdSessionId = attempt.createdSessionId;

      if (!createdSessionId) {
        throw new Error('No session was created. Request a new code and try again.');
      }

      await setActive({ session: createdSessionId });
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }

  return {
    isLoaded,
    resendOtp,
    startOtp,
    verifyOtp,
  };
}
