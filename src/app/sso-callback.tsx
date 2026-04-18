import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';

import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { AUTH_ROUTES } from '@/lib/auth/routes';

export default function SsoCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingScreen />;
  }

  return <Redirect href={isSignedIn ? AUTH_ROUTES.appHome : AUTH_ROUTES.signIn} />;
}
