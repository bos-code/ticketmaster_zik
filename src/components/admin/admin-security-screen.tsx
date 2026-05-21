import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper } from '@/components/ui/screen-wrapper';
import {
  approveAdminRequest,
  rejectAdminRequest,
  subscribeToPendingAdminRequests,
  type AdminRequestRecord,
} from '@/lib/admin-access';
import { firebaseAuth } from '@/lib/firebase';

type RequestAction = 'approve' | 'reject';

export function AdminSecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [adminUser, setAdminUser] = useState<User | null>(firebaseAuth.currentUser);
  const [requests, setRequests] = useState<AdminRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyRequest, setBusyRequest] = useState<{
    action: RequestAction;
    uid: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(firebaseAuth, setAdminUser), []);

  useEffect(() => {
    setIsLoading(true);

    return subscribeToPendingAdminRequests(
      (nextRequests) => {
        setRequests(nextRequests);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
        Alert.alert(
          'Admin requests',
          'Unable to load admin requests. Check Firebase rules and admin status.',
        );
      },
    );
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  }

  async function runRequestAction(
    request: AdminRequestRecord,
    action: RequestAction,
  ) {
    if (!adminUser || busyRequest) {
      return;
    }

    try {
      setBusyRequest({ action, uid: request.uid });

      if (action === 'approve') {
        await approveAdminRequest(request, adminUser);
        showToast('Admin access granted');
      } else {
        await rejectAdminRequest(request, adminUser);
        showToast('Admin request rejected');
      }
    } catch {
      Alert.alert(
        'Request update failed',
        'Firebase could not update this admin request right now.',
      );
    } finally {
      setBusyRequest(null);
    }
  }

  function handleReject(request: AdminRequestRecord) {
    Alert.alert(
      'Reject admin request?',
      `${request.email} will not be able to access admin tools.`,
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => {
            void runRequestAction(request, 'reject');
          },
          style: 'destructive',
          text: 'Reject',
        },
      ],
    );
  }

  return (
    <ScreenWrapper backgroundColor="#F5F6F8">
      <Head>
        <meta content="#F5F6F8" name="theme-color" />
        <meta content="light" name="color-scheme" />
      </Head>
      <StatusBar backgroundColor="#F5F6F8" style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons color="#374151" name="chevron-back" size={20} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>SECURITY</Text>
          <Text style={styles.title}>Admin Requests</Text>
          <Text style={styles.subtitle}>Approve email-verified users before they can edit tickets.</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countNumber}>{requests.length}</Text>
          <Text style={styles.countLabel}>Pending</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.notice}>
          <Ionicons
            color={requests.length ? '#005BD3' : '#14885A'}
            name={requests.length ? 'notifications-outline' : 'shield-checkmark-outline'}
            size={22}
          />
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>
              {requests.length
                ? `${requests.length} admin request${requests.length === 1 ? '' : 's'} waiting`
                : 'No pending admin requests'}
            </Text>
            <Text style={styles.noticeBody}>
              {requests.length
                ? 'Grant access only for email addresses you recognize.'
                : 'New admin requests will appear here and in your account notifications.'}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color="#005BD3" />
            <Text style={styles.emptyTitle}>Loading requests...</Text>
          </View>
        ) : requests.length ? (
          <View style={styles.requestList}>
            {requests.map((request) => (
              <AdminRequestCard
                busyAction={busyRequest?.uid === request.uid ? busyRequest.action : null}
                key={request.uid}
                onApprove={() => {
                  void runRequestAction(request, 'approve');
                }}
                onReject={() => handleReject(request)}
                request={request}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons color="#9CA3AF" name="person-add-outline" size={32} />
            <Text style={styles.emptyTitle}>No requests to review</Text>
            <Text style={styles.emptyBody}>
              When an email-verified user asks for admin access, their request will show up here.
            </Text>
          </View>
        )}
      </ScrollView>

      {toast ? (
        <View style={[styles.toast, { bottom: Math.max(insets.bottom, 18) + 12 }]}>
          <Ionicons color="#FFFFFF" name="checkmark-circle" size={16} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </ScreenWrapper>
  );
}

function AdminRequestCard({
  busyAction,
  onApprove,
  onReject,
  request,
}: {
  busyAction: RequestAction | null;
  onApprove: () => void;
  onReject: () => void;
  request: AdminRequestRecord;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons color="#005BD3" name="mail-outline" size={20} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.accountIdentifier}>{request.email}</Text>
          <Text style={styles.requestMeta}>Requested {formatRequestDate(request)}</Text>
        </View>
      </View>

      <View style={styles.uidPanel}>
        <Text style={styles.uidLabel}>User ID</Text>
        <Text numberOfLines={1} style={styles.uidText}>
          {request.uid}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          disabled={Boolean(busyAction)}
          onPress={onReject}
          style={[styles.rejectButton, busyAction && styles.disabledButton]}
        >
          {busyAction === 'reject' ? (
            <ActivityIndicator color="#DC2626" size="small" />
          ) : (
            <Text style={styles.rejectButtonText}>Reject</Text>
          )}
        </Pressable>
        <Pressable
          disabled={Boolean(busyAction)}
          onPress={onApprove}
          style={[styles.approveButton, busyAction && styles.disabledButton]}
        >
          {busyAction === 'approve' ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.approveButtonText}>Grant Access</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function formatRequestDate(request: AdminRequestRecord) {
  const requestedAt = request.requestedAt?.toDate?.();

  if (!requestedAt) {
    return 'recently';
  }

  return requestedAt.toLocaleString([], {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  });
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  approveButton: {
    alignItems: 'center',
    backgroundColor: '#005BD3',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  cardCopy: {
    flex: 1,
    gap: 2,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  countLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  countNumber: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 23,
  },
  disabledButton: {
    opacity: 0.65,
  },
  emptyBody: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    textAlign: 'center',
  },
  eyebrow: {
    color: '#005BD3',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2.2,
    lineHeight: 13,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  notice: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  noticeBody: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  noticeCopy: {
    flex: 1,
    gap: 2,
  },
  noticeTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  accountIdentifier: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  rejectButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FCA5A5',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  requestList: {
    gap: 12,
  },
  requestMeta: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
    marginTop: 3,
  },
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#111827',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  uidLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  uidPanel: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 12,
    padding: 10,
  },
  uidText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
});
