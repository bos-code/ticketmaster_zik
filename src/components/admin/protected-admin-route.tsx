import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthErrorMessage } from '@/components/auth/auth-error-message';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import {
  requestAdminAccess,
  subscribeToAdminAccess,
  type AdminAccessState,
} from '@/lib/admin-access';
import {
  hasAdminPin,
  isValidAdminPin,
  setAdminPin,
  verifyAdminPin,
} from '@/lib/admin-pin';
import { firebaseAuth, firebaseAuthPersistenceReady } from '@/lib/firebase';

type ProtectedAdminRouteProps = {
  children: ReactNode;
};

type AuthMode = 'sign-in' | 'sign-up';
type PinMode = 'create' | 'unlock';

const EMPTY_ACCESS_STATE: AdminAccessState = {
  isAdmin: false,
  isLoading: true,
  status: 'none',
};

const PIN_DOT_COUNT = 8;

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accessState, setAccessState] = useState<AdminAccessState>(EMPTY_ACCESS_STATE);
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState(firebaseAuth.currentUser?.email ?? '');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinMode, setPinMode] = useState<PinMode>('unlock');
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | undefined;

    void firebaseAuthPersistenceReady.finally(() => {
      if (!isActive) {
        return;
      }

      unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
        setUser(nextUser);
        setIsAuthLoading(false);
        setAccessState(EMPTY_ACCESS_STATE);
        setIsUnlocked(false);
        setPin('');
        setPinConfirm('');

        if (nextUser?.email) {
          setEmail(nextUser.email);
        } else if (!nextUser) {
          setPassword('');
        }
      });
    });

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setAccessState({ ...EMPTY_ACCESS_STATE, isLoading: false });
      return undefined;
    }

    return subscribeToAdminAccess(
      user,
      setAccessState,
      (snapshotError) => setError(getAdminAuthErrorMessage(snapshotError)),
    );
  }, [user]);

  useEffect(() => {
    let isActive = true;

    if (!user || !accessState.isAdmin) {
      return undefined;
    }

    setIsPinLoading(true);

    void hasAdminPin(user.uid)
      .then((hasPin) => {
        if (!isActive) {
          return;
        }

        setPinMode(hasPin ? 'unlock' : 'create');
        setIsUnlocked(false);
      })
      .catch((pinError) => {
        if (isActive) {
          setError(getAdminAuthErrorMessage(pinError));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsPinLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [accessState.isAdmin, user]);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  async function runBusyAction(actionName: string, action: () => Promise<void>) {
    if (busyAction) {
      return;
    }

    setBusyAction(actionName);
    setError(null);
    setMessage(null);

    try {
      await action();
    } catch (actionError) {
      setError(getAdminAuthErrorMessage(actionError));
    } finally {
      setBusyAction(null);
    }
  }

  function handleEmailAuth() {
    void runBusyAction('email-auth', async () => {
      if (!normalizedEmail || password.length < 6) {
        throw new Error('Enter an email and a password with at least 6 characters.');
      }

      await firebaseAuthPersistenceReady;

      if (authMode === 'sign-up') {
        const credential = await createUserWithEmailAndPassword(
          firebaseAuth,
          normalizedEmail,
          password,
        );

        await sendEmailVerification(credential.user);
        setMessage('Account created. Check your email, verify it, then return here.');
        return;
      }

      await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
    });
  }

  function handleSendVerification() {
    void runBusyAction('send-verification', async () => {
      if (!user) {
        return;
      }

      await sendEmailVerification(user);
      setMessage('Verification email sent.');
    });
  }

  function handleRefreshVerification() {
    void runBusyAction('refresh-verification', async () => {
      if (!user) {
        return;
      }

      await reload(user);
      setUser(firebaseAuth.currentUser);
      setMessage(
        firebaseAuth.currentUser?.emailVerified
          ? 'Email verified.'
          : 'Email is not verified yet.',
      );
    });
  }

  function handleRequestAdminAccess() {
    void runBusyAction('request-admin', async () => {
      if (!user) {
        return;
      }

      await requestAdminAccess(user);
      setMessage('Admin request sent. An approved admin can grant access in Security.');
    });
  }

  function handleRefreshAdminStatus() {
    setError(null);
    setMessage('Admin approval refreshes automatically when Firebase changes.');
  }

  function handleSignOut() {
    void runBusyAction('sign-out', async () => {
      await signOut(firebaseAuth);
    });
  }

  function handlePinSubmit() {
    void runBusyAction('pin', async () => {
      if (!user) {
        return;
      }

      if (!isValidAdminPin(pin)) {
        throw new Error('Use a numeric PIN with 4 to 8 digits.');
      }

      if (pinMode === 'create') {
        if (pin !== pinConfirm) {
          throw new Error('PIN confirmation does not match.');
        }

        await setAdminPin(user.uid, pin);
        setIsUnlocked(true);
        setPin('');
        setPinConfirm('');
        return;
      }

      const isValidPin = await verifyAdminPin(user.uid, pin);

      if (!isValidPin) {
        throw new Error('That PIN is not correct.');
      }

      setIsUnlocked(true);
      setPin('');
    });
  }

  if (isAuthLoading) {
    return <AdminLoadingScreen />;
  }

  if (!user) {
    return (
      <AuthScreen
        eyebrow="Admin Access"
        subtitle="Sign in before opening ticket management."
        title={authMode === 'sign-up' ? 'Create Admin Account' : 'Admin Sign In'}
      >
        <AuthTextInput
          autoComplete="email"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="admin@example.com"
          textContentType="emailAddress"
          value={email}
        />
        <AuthTextInput
          label="Password"
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          textContentType={authMode === 'sign-up' ? 'newPassword' : 'password'}
          value={password}
        />
        <AuthErrorMessage message={error} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <AuthButton
          label={authMode === 'sign-up' ? 'Create Account' : 'Sign In'}
          loading={busyAction === 'email-auth'}
          onPress={handleEmailAuth}
        />
        <AuthButton
          label={
            authMode === 'sign-up'
              ? 'Already have access? Sign in'
              : 'Need access? Sign up'
          }
          onPress={() => {
            setAuthMode(authMode === 'sign-up' ? 'sign-in' : 'sign-up');
            setError(null);
            setMessage(null);
          }}
          variant="ghost"
        />
      </AuthScreen>
    );
  }

  if (!user.emailVerified) {
    return (
      <AdminStateScreen
        accountLabel={user.email}
        busyAction={busyAction}
        error={error}
        message={message}
        onPrimary={handleSendVerification}
        onSecondary={handleRefreshVerification}
        onSignOut={handleSignOut}
        primaryBusyName="send-verification"
        primaryLabel="Send Verification Email"
        secondaryBusyName="refresh-verification"
        secondaryLabel="I Verified My Email"
        subtitle="Verify the email address before requesting admin access."
        title="Verify Your Email"
      />
    );
  }

  if (accessState.isLoading) {
    return <AdminLoadingScreen />;
  }

  if (!accessState.isAdmin) {
    const isPending = accessState.status === 'pending';
    const isRejected = accessState.status === 'rejected';

    return (
      <AdminStateScreen
        accountLabel={user.email}
        busyAction={busyAction}
        error={error}
        message={message}
        onPrimary={
          isRejected
            ? handleSignOut
            : isPending
              ? handleRefreshAdminStatus
              : handleRequestAdminAccess
        }
        onSignOut={handleSignOut}
        primaryBusyName={
          isRejected
            ? 'sign-out'
            : isPending
              ? 'refresh-admin-status'
              : 'request-admin'
        }
        primaryLabel={
          isRejected
            ? 'Sign Out'
            : isPending
              ? 'Refresh Status'
              : 'Request Admin Access'
        }
        subtitle={
          isRejected
            ? 'This account is not approved for admin access.'
            : isPending
              ? 'Your request is waiting for approval from an existing admin.'
              : 'Send a request before using ticket management.'
        }
        title={
          isRejected
            ? 'Access Rejected'
            : isPending
              ? 'Approval Pending'
              : 'Admin Approval Required'
        }
      />
    );
  }

  if (isPinLoading) {
    return <AdminLoadingScreen />;
  }

  if (!isUnlocked) {
    return (
      <AdminAppLockScreen
        accountLabel={user.email}
        busyAction={busyAction}
        error={error}
        onPinChange={setPin}
        onPinConfirmChange={setPinConfirm}
        onSignOut={handleSignOut}
        onSubmit={handlePinSubmit}
        pin={pin}
        pinConfirm={pinConfirm}
        pinMode={pinMode}
      />
    );
  }

  return <>{children}</>;
}

function AdminLoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color="#005BD3" size="large" />
      <Text style={styles.loadingText}>Checking admin access...</Text>
    </View>
  );
}

function AdminStateScreen({
  accountLabel,
  busyAction,
  error,
  message,
  onPrimary,
  onSecondary,
  onSignOut,
  primaryBusyName,
  primaryLabel,
  secondaryBusyName,
  secondaryLabel,
  subtitle,
  title,
}: {
  accountLabel?: string | null;
  busyAction: string | null;
  error?: string | null;
  message?: string | null;
  onPrimary: () => void;
  onSecondary?: () => void;
  onSignOut: () => void;
  primaryBusyName: string;
  primaryLabel: string;
  secondaryBusyName?: string;
  secondaryLabel?: string;
  subtitle: string;
  title: string;
}) {
  return (
    <AuthScreen eyebrow="Admin Access" subtitle={subtitle} title={title}>
      {accountLabel ? <Text style={styles.accountText}>{accountLabel}</Text> : null}
      <AuthErrorMessage message={error} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <AuthButton
        label={primaryLabel}
        loading={busyAction === primaryBusyName}
        onPress={onPrimary}
      />
      {onSecondary && secondaryLabel && secondaryBusyName ? (
        <AuthButton
          label={secondaryLabel}
          loading={busyAction === secondaryBusyName}
          onPress={onSecondary}
          variant="secondary"
        />
      ) : null}
      <Pressable onPress={onSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </AuthScreen>
  );
}

function AdminAppLockScreen({
  accountLabel,
  busyAction,
  error,
  onPinChange,
  onPinConfirmChange,
  onSignOut,
  onSubmit,
  pin,
  pinConfirm,
  pinMode,
}: {
  accountLabel?: string | null;
  busyAction: string | null;
  error?: string | null;
  onPinChange: (value: string) => void;
  onPinConfirmChange: (value: string) => void;
  onSignOut: () => void;
  onSubmit: () => void;
  pin: string;
  pinConfirm: string;
  pinMode: PinMode;
}) {
  return (
    <AuthScreen
      eyebrow="Admin App Lock"
      subtitle={
        pinMode === 'create'
          ? 'Create a local PIN before making admin changes.'
          : 'Enter your local PIN to unlock admin changes.'
      }
      title={pinMode === 'create' ? 'Create PIN' : 'Unlock Admin'}
    >
      <View style={styles.lockPanel}>
        <View style={styles.lockBadge}>
          <Text style={styles.lockBadgeText}>PIN</Text>
        </View>
        <View style={styles.lockCopy}>
          <Text style={styles.lockTitle}>Security key required</Text>
          {accountLabel ? <Text style={styles.lockSubtitle}>{accountLabel}</Text> : null}
        </View>
      </View>

      <View style={styles.pinDots}>
        {Array.from({ length: PIN_DOT_COUNT }).map((_, index) => (
          <View
            key={index}
            style={[styles.pinDot, index < pin.length && styles.pinDotActive]}
          />
        ))}
      </View>

      <AuthTextInput
        keyboardType="number-pad"
        label="PIN"
        maxLength={8}
        onChangeText={onPinChange}
        placeholder="4 to 8 digits"
        secureTextEntry
        value={pin}
      />
      {pinMode === 'create' ? (
        <AuthTextInput
          keyboardType="number-pad"
          label="Confirm PIN"
          maxLength={8}
          onChangeText={onPinConfirmChange}
          placeholder="Repeat PIN"
          secureTextEntry
          value={pinConfirm}
        />
      ) : null}
      <AuthErrorMessage message={error} />
      <AuthButton
        label={pinMode === 'create' ? 'Create App Lock' : 'Unlock Admin'}
        loading={busyAction === 'pin'}
        onPress={onSubmit}
      />
      <AuthButton label="Sign Out" onPress={onSignOut} variant="ghost" />
    </AuthScreen>
  );
}

function getAdminAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('auth/email-already-in-use')) {
    return 'That email already has an account. Sign in instead.';
  }

  if (message.includes('auth/invalid-credential')) {
    return 'Email or password is incorrect.';
  }

  if (message.includes('auth/weak-password')) {
    return 'Use a password with at least 6 characters.';
  }

  if (message.includes('auth/too-many-requests')) {
    return 'Too many attempts. Try again later.';
  }

  if (message.includes('permission-denied')) {
    return 'Firebase denied this admin action. Check the admin rules and approval status.';
  }

  return message || 'Could not complete admin authentication.';
}

const styles = StyleSheet.create({
  accountText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  lockBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  lockCopy: {
    flex: 1,
    gap: 2,
  },
  lockPanel: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  lockSubtitle: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  lockTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  message: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  pinDot: {
    backgroundColor: '#CBD5E1',
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  pinDotActive: {
    backgroundColor: '#005BD3',
  },
  pinDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 24,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  signOutText: {
    color: '#005BD3',
    fontSize: 14,
    fontWeight: '800',
  },
});
