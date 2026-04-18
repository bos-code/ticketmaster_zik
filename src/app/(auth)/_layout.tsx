import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { AUTH_ROUTES } from '@/lib/auth/routes';

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useProtectedRoute();

  if (!isLoaded) {
    return <AuthLoadingScreen />;
  }

  if (isSignedIn) {
    return <Redirect href={AUTH_ROUTES.appHome} />;
  }

  return (
    <Stack
      screenOptions={{
        animation: 'fade',
        headerShown: false,
      }}
    />
  );
}
