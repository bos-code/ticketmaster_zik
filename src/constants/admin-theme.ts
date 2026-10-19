// Colours for the admin screens. Components read them through useAdminTheme()
// (src/components/admin/admin-theme.ts) instead of hard-coding hex values.
// The ticket replica screens keep their own reference colours.

export type AdminScheme = 'light' | 'dark';

export type AdminColors = {
  // Screen behind everything.
  background: string;
  // Cards, sheets, toolbars.
  surface: string;
  // Inputs and read-only fields inside a surface.
  surfaceMuted: string;
  // Chips, secondary buttons, pressed rows.
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  // Placeholders, disabled labels.
  textSubtle: string;
  // Filled buttons, active chips, focus rings.
  primary: string;
  // Links, eyebrows and icons drawn in the brand blue on a surface.
  primaryText: string;
  onPrimary: string;
  primarySoft: string;
  primaryBorder: string;
  // Neutral filled pills (secondary floating button, selected chip):
  // near-black in light mode, near-white in dark mode.
  inverse: string;
  onInverse: string;
  // Gold brand accent.
  accent: string;
  success: string;
  // Icons, borders and text for destructive actions.
  danger: string;
  // Filled destructive buttons (with onPrimary text).
  dangerStrong: string;
  dangerSoft: string;
  dangerBorder: string;
  dangerText: string;
  warningSoft: string;
  warningText: string;
  // Dim layer behind sheets and dialogs.
  overlay: string;
  toast: string;
  onToast: string;
  shadow: string;
};

export const adminPalettes: Record<AdminScheme, AdminColors> = {
  light: {
    background: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceMuted: '#F9FAFB',
    surfaceStrong: '#F3F4F6',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textSubtle: '#9CA3AF',
    primary: '#005BD3',
    primaryText: '#005BD3',
    onPrimary: '#FFFFFF',
    primarySoft: '#EFF6FF',
    primaryBorder: '#BFDBFE',
    inverse: '#222222',
    onInverse: '#FFFFFF',
    accent: '#B79E6A',
    success: '#15803D',
    danger: '#EF4444',
    dangerStrong: '#DC2626',
    dangerSoft: '#FEF2F2',
    dangerBorder: '#FECACA',
    dangerText: '#991B1B',
    warningSoft: '#FFF4E5',
    warningText: '#92400E',
    overlay: 'rgba(17, 24, 39, 0.32)',
    toast: 'rgba(17, 24, 39, 0.84)',
    onToast: '#FFFFFF',
    shadow: '#000000',
  },
  dark: {
    background: '#0B0C0E',
    surface: '#16181C',
    surfaceMuted: '#1D2025',
    surfaceStrong: '#262930',
    border: '#2A2E35',
    borderStrong: '#3A3F48',
    text: '#F3F4F6',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textSubtle: '#6B7280',
    primary: '#005BD3',
    primaryText: '#6AA8FF',
    onPrimary: '#FFFFFF',
    primarySoft: 'rgba(106, 168, 255, 0.14)',
    primaryBorder: 'rgba(106, 168, 255, 0.38)',
    inverse: '#F3F4F6',
    onInverse: '#111827',
    accent: '#CDB27A',
    success: '#15803D',
    danger: '#F87171',
    dangerStrong: '#DC2626',
    dangerSoft: 'rgba(248, 113, 113, 0.12)',
    dangerBorder: 'rgba(248, 113, 113, 0.38)',
    dangerText: '#FCA5A5',
    warningSoft: 'rgba(245, 158, 11, 0.14)',
    warningText: '#FCD34D',
    overlay: 'rgba(0, 0, 0, 0.6)',
    toast: 'rgba(243, 244, 246, 0.94)',
    onToast: '#111827',
    shadow: '#000000',
  },
};
