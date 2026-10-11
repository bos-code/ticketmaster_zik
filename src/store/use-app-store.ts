import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { preferenceStorage } from '@/lib/preference-storage';

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
  hasChosenLocation: boolean;
  finishStartup: () => void;
  resetStartup: () => void;
  setThemePreference: (value: ThemePreference) => void;
  setDistanceUnit: (value: DistanceUnit) => void;
  setLocationEnabled: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setHomeLocationLabel: (value: string) => void;
};

export const useAppStore = create<AppStore>()(persist((set) => ({
  hasFinishedStartup: false,
  themePreference: 'dark',
  distanceUnit: 'mi',
  locationEnabled: false,
  notificationsEnabled: false,
  homeLocationLabel: DEFAULT_HOME_LOCATION,
  hasChosenLocation: false,
  finishStartup: () => set({ hasFinishedStartup: true }),
  resetStartup: () => set({ hasFinishedStartup: false }),
  setThemePreference: (value) => set({ themePreference: value }),
  setDistanceUnit: (value) => set({ distanceUnit: value }),
  setLocationEnabled: (value) => set({ locationEnabled: value }),
  setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
  setHomeLocationLabel: (value) => set({ homeLocationLabel: value, hasChosenLocation: true }),
}), { name: 'ticketmaster-app-preferences', version: 1, migrate: (persisted) => { const state = persisted as Partial<AppStore>; return { ...state, homeLocationLabel: state.hasChosenLocation ? state.homeLocationLabel ?? DEFAULT_HOME_LOCATION : DEFAULT_HOME_LOCATION }; }, storage: createJSONStorage(() => preferenceStorage), partialize: (state) => ({ themePreference: state.themePreference, distanceUnit: state.distanceUnit, locationEnabled: state.locationEnabled, notificationsEnabled: state.notificationsEnabled, homeLocationLabel: state.homeLocationLabel, hasChosenLocation: state.hasChosenLocation }) }));
