import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { type MapCoordinate } from '@/lib/map-utils';

type LocationAccessState = {
  permissionStatus: Location.PermissionStatus | 'unavailable';
  currentLocation: MapCoordinate | null;
  isCheckingPermission: boolean;
  isLoadingLocation: boolean;
  error: string | null;
  ensureCurrentLocation: (requestIfNeeded?: boolean) => Promise<MapCoordinate | null>;
  refreshLocation: () => Promise<MapCoordinate | null>;
};

const LOCATION_TIMEOUT_MS = 12000;

export function useCurrentLocation(): LocationAccessState {
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | 'unavailable'>(
    'unavailable',
  );
  const [currentLocation, setCurrentLocation] = useState<MapCoordinate | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCurrentLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setError(null);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        throw new Error('Location services are turned off on this device.');
      }

      const position = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
      ).catch(async () => {
        return Location.getLastKnownPositionAsync({
          maxAge: 5 * 60 * 1000,
          requiredAccuracy: 200,
        });
      });

      if (!position?.coords) {
        throw new Error('Current location is unavailable right now.');
      }

      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      if (isMountedRef.current) {
        setCurrentLocation(nextLocation);
      }

      return nextLocation;
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to determine the current location.';

      if (isMountedRef.current) {
        setError(nextError);
      }

      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoadingLocation(false);
      }
    }
  }, []);

  const ensureCurrentLocation = useCallback(
    async (requestIfNeeded = true) => {
      if (currentLocation) {
        return currentLocation;
      }

      let nextStatus = permissionStatus;

      if (permissionStatus === 'unavailable') {
        const permissions = await Location.getForegroundPermissionsAsync();
        nextStatus = permissions.status;
        if (isMountedRef.current) {
          setPermissionStatus(permissions.status);
        }
      }

      if (nextStatus !== Location.PermissionStatus.GRANTED && requestIfNeeded) {
        const requested = await Location.requestForegroundPermissionsAsync();
        nextStatus = requested.status;
        if (isMountedRef.current) {
          setPermissionStatus(requested.status);
        }
      }

      if (nextStatus !== Location.PermissionStatus.GRANTED) {
        const nextError =
          nextStatus === Location.PermissionStatus.DENIED
            ? 'Location access was denied. You can still open directions in your maps app.'
            : 'Enable location access to preview your route on the map.';

        if (isMountedRef.current) {
          setError(nextError);
        }

        return null;
      }

      return loadCurrentLocation();
    },
    [currentLocation, loadCurrentLocation, permissionStatus],
  );

  const refreshLocation = useCallback(async () => {
    return ensureCurrentLocation(false);
  }, [ensureCurrentLocation]);

  useEffect(() => {
    let isActive = true;

    async function checkExistingPermission() {
      setIsCheckingPermission(true);

      try {
        const permissions = await Location.getForegroundPermissionsAsync();

        if (!isMountedRef.current || !isActive) {
          return;
        }

        setPermissionStatus(permissions.status);

        if (permissions.status === Location.PermissionStatus.GRANTED) {
          await loadCurrentLocation();
        }
      } finally {
        if (isMountedRef.current && isActive) {
          setIsCheckingPermission(false);
        }
      }
    }

    void checkExistingPermission();

    return () => {
      isActive = false;
    };
  }, [loadCurrentLocation]);

  return {
    permissionStatus,
    currentLocation,
    isCheckingPermission,
    isLoadingLocation,
    error,
    ensureCurrentLocation,
    refreshLocation,
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = LOCATION_TIMEOUT_MS) {
  return await Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Location request timed out.'));
      }, timeoutMs);
    }),
  ]);
}
