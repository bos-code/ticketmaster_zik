import { useColorScheme } from 'react-native';

import { drawerPalettes, type DrawerScheme } from '@/constants/drawer-theme';

/** Drawer colours for the phone's light/dark setting (light when unknown). */
export function useDrawerTheme() {
  const scheme: DrawerScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { colors: drawerPalettes[scheme], scheme };
}
