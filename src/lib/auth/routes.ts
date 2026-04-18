import type { Href } from 'expo-router';

export const AUTH_ROUTES = {
  welcome: '/(auth)',
  signIn: '/(auth)/sign-in',
  signUp: '/(auth)/sign-up',
  verifyOtp: '/(auth)/verify-otp',
  appHome: '/(tabs)',
} as const satisfies Record<string, Href>;

export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];
