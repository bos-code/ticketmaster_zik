import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PIN_KEY_PREFIX = 'ticketmaster-zik-admin-pin-v1';
const PIN_HASH_SALT = 'ticketmaster-zik-admin-change-key';

export function isValidAdminPin(pin: string) {
  return /^\d{4,8}$/.test(pin);
}

export async function hasAdminPin(uid: string) {
  return Boolean(await readStoredPinHash(uid));
}

export async function setAdminPin(uid: string, pin: string) {
  await writeStoredPinHash(uid, await hashPin(uid, pin));
}

export async function verifyAdminPin(uid: string, pin: string) {
  const storedHash = await readStoredPinHash(uid);

  if (!storedHash) {
    return false;
  }

  return storedHash === (await hashPin(uid, pin));
}

function getPinStorageKey(uid: string) {
  return `${PIN_KEY_PREFIX}:${uid}`;
}

async function readStoredPinHash(uid: string) {
  const key = getPinStorageKey(uid);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function writeStoredPinHash(uid: string, pinHash: string) {
  const key = getPinStorageKey(uid);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(key, pinHash);
    return;
  }

  await SecureStore.setItemAsync(key, pinHash);
}

async function hashPin(uid: string, pin: string) {
  const value = `${PIN_HASH_SALT}:${uid}:${pin}`;
  const subtle = globalThis.crypto?.subtle;

  if (subtle) {
    const bytes = new TextEncoder().encode(value);
    const hash = await subtle.digest('SHA-256', bytes);

    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  return `fallback:${fallbackHash(value)}`;
}

function fallbackHash(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(16);
}
