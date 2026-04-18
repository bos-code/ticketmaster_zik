import { create } from 'zustand';

type AppStore = {
  hasFinishedStartup: boolean;
  finishStartup: () => void;
  resetStartup: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  hasFinishedStartup: false,
  finishStartup: () => set({ hasFinishedStartup: true }),
  resetStartup: () => set({ hasFinishedStartup: false }),
}));
