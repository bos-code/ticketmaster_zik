import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { create } from 'zustand';

import { adminPalettes, type AdminColors, type AdminScheme } from '@/constants/admin-theme';

export type AdminThemePreference = 'system' | AdminScheme;

const STORAGE_KEY = 'admin-theme';
const PREFERENCES: AdminThemePreference[] = ['system', 'dark', 'light'];

const DEFAULT_PREFERENCE: AdminThemePreference = 'dark';

function readStoredPreference(): AdminThemePreference {
  if (Platform.OS !== 'web') return DEFAULT_PREFERENCE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return PREFERENCES.includes(stored as AdminThemePreference) ? (stored as AdminThemePreference) : DEFAULT_PREFERENCE;
  } catch {
    return DEFAULT_PREFERENCE;
  }
}

const useAdminThemeStore = create<{
  preference: AdminThemePreference;
  setPreference: (preference: AdminThemePreference) => void;
}>((set) => ({
  preference: readStoredPreference(),
  setPreference: (preference) => {
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(STORAGE_KEY, preference);
      } catch {}
    }
    set({ preference });
  },
}));

/**
 * The admin colour scheme: dark by default; the header toggle switches between
 * Dark, Light and Auto (the phone's setting), remembered on this device.
 */
export function useAdminTheme() {
  const preference = useAdminThemeStore((state) => state.preference);
  const setPreference = useAdminThemeStore((state) => state.setPreference);
  const system = useColorScheme();
  const scheme: AdminScheme = preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;

  return {
    colors: adminPalettes[scheme],
    scheme,
    preference,
    setPreference,
    // System -> Dark -> Light -> System.
    cyclePreference: () => setPreference(PREFERENCES[(PREFERENCES.indexOf(preference) + 1) % PREFERENCES.length]),
  };
}

/**
 * Like StyleSheet.create, but built from the admin colours. Returns a hook that
 * gives the styles for the current scheme (each scheme is created once).
 */
export function createAdminStyles<T extends StyleSheet.NamedStyles<T>>(factory: (colors: AdminColors) => T) {
  const cache: Partial<Record<AdminScheme, T>> = {};

  return function useAdminStyles(): T {
    const { colors, scheme } = useAdminTheme();
    return (cache[scheme] ??= StyleSheet.create(factory(colors)));
  };
}
