export type OtpFlow = 'sign-in' | 'sign-up';
export type OtpMethod = 'email' | 'phone';
export type OtpStrategy = 'email_code' | 'phone_code';

export const OTP_LENGTH = 6;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+[1-9]\d{7,14}$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateEmail(value: string) {
  const email = normalizeEmail(value);

  if (!email) {
    return 'Enter your email address.';
  }

  if (!emailPattern.test(email)) {
    return 'Enter a valid email address.';
  }

  return null;
}

export function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  return `${hasLeadingPlus ? '+' : ''}${digits}`;
}

export function validatePhoneNumber(value: string) {
  const phoneNumber = normalizePhoneNumber(value);

  if (!phoneNumber) {
    return 'Enter your phone number.';
  }

  if (!phonePattern.test(phoneNumber)) {
    return 'Use international format, like +15551234567.';
  }

  return null;
}

export function normalizeOtpIdentifier(method: OtpMethod, value: string) {
  return method === 'email' ? normalizeEmail(value) : normalizePhoneNumber(value);
}

export function validateOtpIdentifier(method: OtpMethod, value: string) {
  return method === 'email' ? validateEmail(value) : validatePhoneNumber(value);
}

export function normalizeOtp(value: string) {
  return value.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export function validateOtp(value: string) {
  if (normalizeOtp(value).length !== OTP_LENGTH) {
    return `Enter the ${OTP_LENGTH}-digit code.`;
  }

  return null;
}

export function isOtpFlow(value: unknown): value is OtpFlow {
  return value === 'sign-in' || value === 'sign-up';
}

export function isOtpMethod(value: unknown): value is OtpMethod {
  return value === 'email' || value === 'phone';
}

export function getOtpStrategy(method: OtpMethod): OtpStrategy {
  return method === 'email' ? 'email_code' : 'phone_code';
}

export function getOtpFlowLabel(flow: OtpFlow) {
  return flow === 'sign-in' ? 'sign in' : 'create your account';
}

export function getOtpMethodLabel(method: OtpMethod) {
  return method === 'email' ? 'email' : 'phone';
}
