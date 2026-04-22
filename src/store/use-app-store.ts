import { create } from 'zustand';

import { DEFAULT_HOME_LOCATION } from '@/lib/device-permissions';

export type ThemePreference = 'system' | 'light' | 'dark';
export type DistanceUnit = 'mi' | 'km';

type AppStore = {
  hasFinishedStartup: boolean;
  themePreference: ThemePreference;
  distanceUnit: DistanceUnit;
  locationEnabled: boolean;
  notificationsEnabled: boolean;
  homeLocationLabel: string;
  finishStartup: () => void;
  resetStartup: () => void;
  setThemePreference: (value: ThemePreference) => void;
  setDistanceUnit: (value: DistanceUnit) => void;
  setLocationEnabled: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setHomeLocationLabel: (value: string) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  hasFinishedStartup: false,
  themePreference: 'dark',
  distanceUnit: 'mi',
  locationEnabled: true,
  notificationsEnabled: false,
  homeLocationLabel: DEFAULT_HOME_LOCATION,
  finishStartup: () => set({ hasFinishedStartup: true }),
  resetStartup: () => set({ hasFinishedStartup: false }),
  setThemePreference: (value) => set({ themePreference: value }),
  setDistanceUnit: (value) => set({ distanceUnit: value }),
  setLocationEnabled: (value) => set({ locationEnabled: value }),
  setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
  setHomeLocationLabel: (value) => set({ homeLocationLabel: value }),
}));
