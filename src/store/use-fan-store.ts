import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { preferenceStorage } from '@/lib/preference-storage';
import { emptyProfile, migrateFanPreferences, type FanProfile } from '@/lib/fan-profile';

export type WatchlistTab = 'events' | 'favourites';
type FanStore = {
  profile: FanProfile;
  savedEventIds: string[];
  favouriteArtistIds: string[];
  watchlistTab: WatchlistTab;
  updateProfile: (profile: FanStore['profile']) => void;
  toggleSavedEvent: (id: string) => void;
  toggleFavouriteArtist: (id: string) => void;
  setWatchlistTab: (tab: WatchlistTab) => void;
};
const toggleId = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];

export const useFanStore = create<FanStore>()(persist((set) => ({
  profile: { ...emptyProfile },
  savedEventIds: [],
  favouriteArtistIds: [],
  watchlistTab: 'events',
  updateProfile: (profile) => set({ profile }),
  toggleSavedEvent: (id) => set((state) => ({ savedEventIds: toggleId(state.savedEventIds, id) })),
  toggleFavouriteArtist: (id) => set((state) => ({ favouriteArtistIds: toggleId(state.favouriteArtistIds, id) })),
  setWatchlistTab: (watchlistTab) => set({ watchlistTab }),
}), { name: 'ticketmaster-fan-preferences', version: 1, migrate: migrateFanPreferences, storage: createJSONStorage(() => preferenceStorage) }));
