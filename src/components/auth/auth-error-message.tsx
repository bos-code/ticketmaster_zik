import { Text } from '@/components/ui/app-text';
import React from 'react';

import { createAdminStyles } from '@/components/admin/admin-theme';

type AuthErrorMessageProps = {
  message?: string | null;
};

export function AuthErrorMessage({ message }: AuthErrorMessageProps) {
  const styles = useStyles();
  if (!message) {
    return null;
  }

  return <Text style={styles.error}>{message}</Text>;
}

const useStyles = createAdminStyles((c) => ({
  error: {
    color: c.dangerText,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
  },
}));
