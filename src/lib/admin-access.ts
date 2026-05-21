import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';

import { firestore } from '@/lib/firebase';

export type AdminAccessStatus = 'approved' | 'none' | 'pending' | 'rejected';

export type AdminAccessState = {
  isAdmin: boolean;
  isLoading: boolean;
  status: AdminAccessStatus;
};

export type AdminRequestRecord = {
  approvedAt?: Timestamp | null;
  approvedBy?: string;
  email: string;
  id: string;
  phoneNumber?: string;
  rejectedAt?: Timestamp | null;
  rejectedBy?: string;
  requestedAt?: Timestamp | null;
  status: AdminAccessStatus;
  uid: string;
  updatedAt?: Timestamp | null;
};

type AdminAccessSnapshot = {
  status?: AdminAccessStatus;
};

type AdminRequestSnapshot = {
  approvedAt?: Timestamp | null;
  approvedBy?: string;
  email?: string;
  phoneNumber?: string;
  rejectedAt?: Timestamp | null;
  rejectedBy?: string;
  requestedAt?: Timestamp | null;
  status?: AdminAccessStatus;
  uid?: string;
  updatedAt?: Timestamp | null;
};

const ADMINS_COLLECTION = 'admins';
const ADMIN_REQUESTS_COLLECTION = 'admin_requests';

export function subscribeToAdminAccess(
  user: User,
  onValue: (state: AdminAccessState) => void,
  onError: (error: Error) => void,
) {
  let adminDocLoaded = false;
  let requestDocLoaded = false;
  let hasAdminDoc = false;
  let requestStatus: AdminAccessStatus = 'none';

  function emit() {
    const isLoading = !adminDocLoaded || !requestDocLoaded;

    onValue({
      isAdmin: hasAdminDoc || requestStatus === 'approved',
      isLoading,
      status: hasAdminDoc ? 'approved' : requestStatus,
    });
  }

  const unsubscribers: Unsubscribe[] = [
    onSnapshot(
      doc(firestore, ADMINS_COLLECTION, user.uid),
      (snapshot) => {
        adminDocLoaded = true;
        hasAdminDoc = snapshot.exists();
        emit();
      },
      onError,
    ),
    onSnapshot(
      doc(firestore, ADMIN_REQUESTS_COLLECTION, user.uid),
      (snapshot) => {
        requestDocLoaded = true;
        requestStatus =
          (snapshot.data() as AdminAccessSnapshot | undefined)?.status ?? 'none';
        emit();
      },
      onError,
    ),
  ];

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}

export async function requestAdminAccess(user: User) {
  await setDoc(doc(firestore, ADMIN_REQUESTS_COLLECTION, user.uid), {
    email: user.email ?? '',
    requestedAt: serverTimestamp(),
    status: 'pending',
    uid: user.uid,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToPendingAdminRequests(
  onValue: (requests: AdminRequestRecord[]) => void,
  onError: (error: Error) => void,
) {
  const pendingRequestsQuery = query(
    collection(firestore, ADMIN_REQUESTS_COLLECTION),
    where('status', '==', 'pending'),
  );

  return onSnapshot(
    pendingRequestsQuery,
    (snapshot) => {
      const requests = snapshot.docs
        .map((requestSnapshot) =>
          toAdminRequestRecord(
            requestSnapshot.id,
            requestSnapshot.data() as AdminRequestSnapshot,
          ),
        )
        .sort((left, right) => getRequestMillis(right) - getRequestMillis(left));

      onValue(requests);
    },
    onError,
  );
}

export async function approveAdminRequest(
  request: AdminRequestRecord,
  approver: User,
) {
  const updatedAt = serverTimestamp();

  await Promise.all([
    setDoc(
      doc(firestore, ADMINS_COLLECTION, request.uid),
      {
        email: request.email,
        grantedAt: updatedAt,
        grantedBy: approver.uid,
        uid: request.uid,
      },
      { merge: true },
    ),
    setDoc(
      doc(firestore, ADMIN_REQUESTS_COLLECTION, request.uid),
      {
        approvedAt: updatedAt,
        approvedBy: approver.uid,
        status: 'approved',
        updatedAt,
      },
      { merge: true },
    ),
  ]);
}

export async function rejectAdminRequest(
  request: AdminRequestRecord,
  reviewer: User,
) {
  const updatedAt = serverTimestamp();

  await setDoc(
    doc(firestore, ADMIN_REQUESTS_COLLECTION, request.uid),
    {
      rejectedAt: updatedAt,
      rejectedBy: reviewer.uid,
      status: 'rejected',
      updatedAt,
    },
    { merge: true },
  );
}

function toAdminRequestRecord(id: string, data: AdminRequestSnapshot): AdminRequestRecord {
  return {
    approvedAt: data.approvedAt ?? null,
    approvedBy: data.approvedBy,
    email: data.email ?? 'Unknown email',
    id,
    phoneNumber: data.phoneNumber,
    rejectedAt: data.rejectedAt ?? null,
    rejectedBy: data.rejectedBy,
    requestedAt: data.requestedAt ?? null,
    status: data.status ?? 'none',
    uid: data.uid ?? id,
    updatedAt: data.updatedAt ?? null,
  };
}

function getRequestMillis(request: AdminRequestRecord) {
  return request.requestedAt?.toMillis?.() ?? 0;
}
