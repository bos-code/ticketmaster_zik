import * as Location from 'expo-location';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as NotificationsModule from 'expo-notifications';
import { Platform } from 'react-native';

export type AppPermissionStatus = 'granted' | 'denied' | 'undetermined';

export type PermissionResult = {
  granted: boolean;
  status: AppPermissionStatus;
  error?: string;
};

export type HomeLocationResult = PermissionResult & {
  label?: string;
};

export const DEFAULT_HOME_LOCATION = 'Igbesa, Ogun State, NG';

let notificationsModule: typeof NotificationsModule | null = null;

export async function getLocationPermissionStatus(): Promise<AppPermissionStatus> {
  const permission = await Location.getForegroundPermissionsAsync();
  return normalizePermissionStatus(permission.status);
}

export async function resolveHomeLocation({
  requestIfNeeded = false,
}: {
  requestIfNeeded?: boolean;
} = {}): Promise<HomeLocationResult> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();

    if (!servicesEnabled) {
      return {
        granted: false,
        status: 'denied',
        error: 'Location services are turned off on this device.',
      };
    }

    let permission = await Location.getForegroundPermissionsAsync();

    if (permission.status !== Location.PermissionStatus.GRANTED && requestIfNeeded) {
      permission = await Location.requestForegroundPermissionsAsync();
    }

    const status = normalizePermissionStatus(permission.status);

    if (permission.status !== Location.PermissionStatus.GRANTED) {
      return {
        granted: false,
        status,
        error:
          status === 'denied'
            ? 'Location access was denied. You can enable it again from Settings.'
            : 'Location permission has not been granted yet.',
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const reverse = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    return {
      granted: true,
      status: 'granted',
      label: formatHomeLocation(reverse[0]),
    };
  } catch (caughtError) {
    return {
      granted: false,
      status: 'denied',
      error:
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to determine the current location right now.',
    };
  }
}

export async function getNotificationPermissionStatus(): Promise<AppPermissionStatus> {
  const Notifications = await loadNotificationsModule();

  if (!Notifications) {
    return 'denied';
  }

  const permission = await Notifications.getPermissionsAsync();
  return permission.granted ? 'granted' : permission.canAskAgain ? 'undetermined' : 'denied';
}

export async function requestNotificationPermission(): Promise<PermissionResult> {
  try {
    const Notifications = await loadNotificationsModule();

    if (!Notifications) {
      return {
        granted: false,
        status: 'denied',
        error: 'Push notifications require a development build.',
      };
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    let permission = await Notifications.getPermissionsAsync();

    if (!permission.granted) {
      permission = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
    }

    const granted =
      permission.granted ||
      permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    return {
      granted,
      status: granted ? 'granted' : permission.canAskAgain ? 'undetermined' : 'denied',
      error: granted ? undefined : 'Notifications are currently turned off.',
    };
  } catch (caughtError) {
    return {
      granted: false,
      status: 'denied',
      error:
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update notification access right now.',
    };
  }
}

async function loadNotificationsModule() {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return null;
  }

  notificationsModule ??= await import('expo-notifications');
  return notificationsModule;
}

function normalizePermissionStatus(status: Location.PermissionStatus): AppPermissionStatus {
  if (status === Location.PermissionStatus.GRANTED) {
    return 'granted';
  }

  if (status === Location.PermissionStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
}

function formatHomeLocation(
  entry?: Location.LocationGeocodedAddress | null,
) {
  if (!entry) {
    return DEFAULT_HOME_LOCATION;
  }

  const locality =
    entry.city ?? entry.district ?? entry.subregion ?? entry.name ?? entry.street;
  const region = entry.region ?? entry.subregion;
  const country = entry.isoCountryCode ?? entry.country;
  const parts = [locality, region, country].filter(Boolean);

  if (!parts.length) {
    return DEFAULT_HOME_LOCATION;
  }

  return parts.join(', ');
}
