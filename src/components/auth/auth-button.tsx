import { Text } from '@/components/ui/app-text';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { createAdminStyles, useAdminTheme } from '@/components/admin/admin-theme';
import { ticketRadii, ticketSpacing } from '@/constants/ticket-theme';

type AuthButtonVariant = 'primary' | 'secondary' | 'ghost';

type AuthButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: AuthButtonVariant;
};

export function AuthButton({
  disabled,
  label,
  loading = false,
  style,
  variant = 'primary',
  ...props
}: AuthButtonProps) {
  const isDisabled = disabled || loading;
  const styles = useStyles();
  const { colors } = useAdminTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.primaryText} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const useStyles = createAdminStyles((c) => ({
  base: {
    alignItems: 'center',
    borderRadius: ticketRadii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: ticketSpacing.md,
  },
  primary: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  secondary: {
    backgroundColor: c.surface,
    borderColor: c.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.84,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 20,
  },
  primaryLabel: {
    color: c.onPrimary,
  },
  secondaryLabel: {
    color: c.text,
  },
  ghostLabel: {
    color: c.primaryText,
  },
}));
