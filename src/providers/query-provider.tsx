import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import React, { ReactNode, useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { queryClient } from '@/lib/query-client';

export function QueryProvider({ children }: React.PropsWithChildren) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
