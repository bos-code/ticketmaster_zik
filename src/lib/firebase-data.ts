import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  uploadString,
} from 'firebase/storage';

import { mockTickets, type TicketRecord } from '../../data/tickets';
import {
  eventCatalog,
  initialReservations,
  type EventRecord,
  type ReservationRecord,
} from '@/lib/data';
import { firebaseConfig, firestore, storage } from '@/lib/firebase';

const EVENTS_COLLECTION = 'events';
const RESERVATIONS_COLLECTION = 'reservations';
const SEED_STATE_COLLECTION = 'app_meta';
const SEED_STATE_DOCUMENT = 'seed_state';
const TICKETS_COLLECTION = 'tickets';
const SEED_VERSION = 1;

let seedPromise: Promise<void> | null = null;

export function subscribeToTickets(onValue: (tickets: TicketRecord[]) => void) {
  return onSnapshot(collection(firestore, TICKETS_COLLECTION), (snapshot) => {
    const tickets = snapshot.docs
      .map((documentSnapshot) => documentSnapshot.data() as TicketRecord)
      .sort((left, right) => compareDescending(left.updatedAt, right.updatedAt));

    onValue(tickets);
  });
}

export function subscribeToEvents(onValue: (events: EventRecord[]) => void) {
  return onSnapshot(collection(firestore, EVENTS_COLLECTION), (snapshot) => {
    const events = snapshot.docs
      .map((documentSnapshot) => documentSnapshot.data() as EventRecord)
      .sort((left, right) => compareAscending(left.startsAt, right.startsAt));

    onValue(events);
  });
}

export function subscribeToReservations(
  onValue: (reservations: ReservationRecord[]) => void,
) {
  return onSnapshot(collection(firestore, RESERVATIONS_COLLECTION), (snapshot) => {
    const reservations = snapshot.docs
      .map((documentSnapshot) => documentSnapshot.data() as ReservationRecord)
      .sort((left, right) => compareDescending(left.reservedAt, right.reservedAt));

    onValue(reservations);
  });
}

export async function createTicketDocument(ticket: TicketRecord) {
  await writeTicketDocumentWithRest(ticket.id, ticket);
}

export async function updateTicketDocument(
  ticketId: string,
  updates: Partial<TicketRecord>,
) {
  await writeTicketDocumentWithRest(ticketId, updates);
}

export async function deleteTicketDocument(ticketId: string) {
  await deleteTicketDocumentWithRest(ticketId);
}

export async function persistTicketImage(ticketId: string, imageValue: string) {
  const normalizedImageValue = imageValue.trim();

  if (!normalizedImageValue || isRemoteUrl(normalizedImageValue)) {
    return normalizedImageValue;
  }

  const imageRef = storageRef(
    storage,
    `tickets/${ticketId}/${Date.now()}-${buildStorageSafeId(ticketId)}`,
  );

  if (normalizedImageValue.startsWith('data:')) {
    await uploadString(imageRef, normalizedImageValue, 'data_url');
    return getDownloadURL(imageRef);
  }

  const response = await fetch(normalizedImageValue);
  const blob = await response.blob();

  await uploadBytes(imageRef, blob, {
    contentType: blob.type || 'image/jpeg',
  });

  return getDownloadURL(imageRef);
}

export async function createEventDocument(event: EventRecord) {
  await setDoc(doc(firestore, EVENTS_COLLECTION, event.id), event);
}

export async function upsertReservationDocument(reservation: ReservationRecord) {
  await setDoc(
    doc(firestore, RESERVATIONS_COLLECTION, reservation.id),
    reservation,
  );
}

export function ensureFirebaseSeedData() {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = runSeedTransaction().catch((error) => {
    seedPromise = null;
    throw error;
  });

  return seedPromise;
}

async function runSeedTransaction() {
  await runTransaction(firestore, async (transaction) => {
    const seedStateRef = doc(
      firestore,
      SEED_STATE_COLLECTION,
      SEED_STATE_DOCUMENT,
    );
    const seedStateSnapshot = await transaction.get(seedStateRef);
    const currentSeedVersion = seedStateSnapshot.data()?.version as
      | number
      | undefined;

    if ((currentSeedVersion ?? 0) >= SEED_VERSION) {
      return;
    }

    for (const event of eventCatalog) {
      const eventRef = doc(firestore, EVENTS_COLLECTION, event.id);
      const eventSnapshot = await transaction.get(eventRef);

      if (!eventSnapshot.exists()) {
        transaction.set(eventRef, event);
      }
    }

    for (const reservation of initialReservations) {
      const reservationRef = doc(
        firestore,
        RESERVATIONS_COLLECTION,
        reservation.id,
      );
      const reservationSnapshot = await transaction.get(reservationRef);

      if (!reservationSnapshot.exists()) {
        transaction.set(reservationRef, reservation);
      }
    }

    for (const ticket of mockTickets) {
      const ticketRef = doc(firestore, TICKETS_COLLECTION, ticket.id);
      const ticketSnapshot = await transaction.get(ticketRef);

      if (!ticketSnapshot.exists()) {
        transaction.set(ticketRef, ticket);
      }
    }

    transaction.set(seedStateRef, {
      seededAt: new Date().toISOString(),
      version: SEED_VERSION,
    });
  });
}

function compareAscending(left: string, right: string) {
  return left.localeCompare(right);
}

function compareDescending(left: string, right: string) {
  return right.localeCompare(left);
}

function buildStorageSafeId(value: string) {
  return value.replace(/[^a-z0-9-]/gi, '-').replace(/-{2,}/g, '-');
}

function isRemoteUrl(value: string) {
  return /^(https?:\/\/|gs:\/\/)/i.test(value);
}

function buildTicketDocumentUrl(ticketId: string) {
  return (
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}` +
    `/databases/(default)/documents/${TICKETS_COLLECTION}/${encodeURIComponent(ticketId)}` +
    `?key=${firebaseConfig.apiKey}`
  );
}

async function writeTicketDocumentWithRest(
  ticketId: string,
  fields: Partial<TicketRecord>,
) {
  const fieldNames = Object.keys(fields);
  const updateMask = fieldNames
    .map((fieldName) => `updateMask.fieldPaths=${encodeURIComponent(fieldName)}`)
    .join('&');
  const separator = updateMask ? '&' : '';
  const response = await fetch(`${buildTicketDocumentUrl(ticketId)}${separator}${updateMask}`, {
    body: JSON.stringify({ fields: toFirestoreRestFields(fields) }),
    headers: { 'content-type': 'application/json' },
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error(await buildFirestoreRestErrorMessage(response));
  }
}

async function deleteTicketDocumentWithRest(ticketId: string) {
  const response = await fetch(buildTicketDocumentUrl(ticketId), {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await buildFirestoreRestErrorMessage(response));
  }
}

function toFirestoreRestFields(fields: Partial<TicketRecord>) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      toFirestoreRestValue(value),
    ]),
  );
}

function toFirestoreRestValue(value: unknown) {
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (value === null || typeof value === 'undefined') {
    return { nullValue: null };
  }

  return { stringValue: String(value) };
}

async function buildFirestoreRestErrorMessage(response: Response) {
  const body = await response.text();

  return `Firestore request failed (${response.status}): ${body}`;
}
