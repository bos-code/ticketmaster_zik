import { useState } from 'react';
import { Platform } from 'react-native';
import { requestNotificationPermission, resolveHomeLocation } from '@/lib/device-permissions';
import { useAppStore } from '@/store/use-app-store';

export function useFanPermissions() {
  const [busy, setBusy] = useState<'location' | 'notifications' | null>(null);
  const [error, setError] = useState('');
  const setLocationEnabled = useAppStore((state) => state.setLocationEnabled);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const setHomeLocationLabel = useAppStore((state) => state.setHomeLocationLabel);

  async function changePermission(kind: 'location' | 'notifications', enabled: boolean) {
    if (busy) return;
    setError('');
    const update = kind === 'location' ? setLocationEnabled : setNotificationsEnabled;
    if (!enabled) { update(false); return; }
    setBusy(kind);
    try {
      if (Platform.OS === 'web') {
        if (kind === 'notifications') {
          if (typeof Notification === 'undefined') throw new Error('This browser does not support notifications.');
          const granted = await Notification.requestPermission() === 'granted';
          update(granted);
          if (!granted) setError('Notifications are blocked. You can enable them in your browser settings.');
        } else {
          if (typeof navigator === 'undefined' || !navigator.geolocation) throw new Error('Location access is not available. You can choose a city manually.');
          await new Promise<void>((resolve, reject) => navigator.geolocation.getCurrentPosition(() => resolve(), () => reject(new Error('Location access was denied. You can still choose a city manually.')), { timeout: 12000 }));
          update(true);
        }
      } else if (kind === 'notifications') {
        const result = await requestNotificationPermission();
        update(result.granted);
        if (!result.granted) setError(result.error ?? 'Unable to enable notifications.');
      } else {
        const result = await resolveHomeLocation({ requestIfNeeded: true });
        update(result.granted);
        if (result.label) setHomeLocationLabel(result.label);
        if (!result.granted) setError(result.error ?? 'Choose a city manually to find events near you.');
      }
    } catch (cause) {
      update(false);
      setError(cause instanceof Error ? cause.message : 'Unable to update this permission. Please try again.');
    } finally { setBusy(null); }
  }
  return { busy, error, changePermission };
}
