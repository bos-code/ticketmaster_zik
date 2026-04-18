import { DefaultTheme, type Theme } from '@react-navigation/native';

export const ticketColors = {
  background: '#F8FAFC',
  backgroundDeep: '#EEF4FA',
  chrome: '#FFFFFF',
  chromeElevated: '#F1F5F9',
  chromeSoft: '#E2E8F0',
  border: 'rgba(15, 23, 42, 0.10)',
  borderStrong: 'rgba(15, 23, 42, 0.16)',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#64748B',
  primary: '#1277FF',
  primaryBright: '#005BD3',
  primarySoft: 'rgba(18, 119, 255, 0.12)',
  glow: 'rgba(18, 119, 255, 0.18)',
  success: '#14885A',
  warning: '#9A6700',
} as const;

export const ticketSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const ticketRadii = {
  xs: 4,
  sm: 6,
  md: 8,
  pill: 999,
} as const;

export const ticketTypography = {
  labelSize: 10,
  letterSpacing: 0,
} as const;

export const ticketNavigationTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: ticketColors.primary,
    background: ticketColors.background,
    card: ticketColors.chrome,
    text: ticketColors.text,
    border: ticketColors.border,
    notification: ticketColors.primaryBright,
  },
};
