import { useAuth } from '@clerk/expo';

export function useProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  return {
    isLoaded,
    isSignedIn,
  };
}
