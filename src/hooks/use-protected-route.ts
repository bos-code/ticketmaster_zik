import { useAuth } from '@clerk/expo';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AUTH_ROUTES } from '@/lib/auth/routes';

export function useProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const routeGroup = segments[0];
    const isAuthRoute = routeGroup === '(auth)';
    const isProtectedRoute = routeGroup === '(tabs)';

    if (!isSignedIn && isProtectedRoute) {
      router.replace(AUTH_ROUTES.signIn);
      return;
    }

    if (isSignedIn && isAuthRoute) {
      router.replace(AUTH_ROUTES.appHome);
    }
  }, [isLoaded, isSignedIn, router, segments]);

  return {
    isLoaded,
    isSignedIn,
  };
}
