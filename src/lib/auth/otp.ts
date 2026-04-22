export const OTP_LENGTH = 6;

export type OtpFlow = 'sign-in' | 'sign-up';
export type OtpMethod = 'email' | 'phone';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function normalizeOtp(value: string) {
  return digitsOnly(value).slice(0, OTP_LENGTH);
}

export function validateOtp(value: string) {
  if (value.length !== OTP_LENGTH) {
    return `Enter the ${OTP_LENGTH}-digit code.`;
  }

  return null;
}

export function normalizeOtpIdentifier(method: OtpMethod, value: string) {
  const normalized = value.trim();
  if (method === 'email') {
    return normalized.toLowerCase();
  }

  return normalized.replace(/\s+/g, '');
}
