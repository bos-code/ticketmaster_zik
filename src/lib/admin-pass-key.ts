const DEFAULT_ADMIN_PASS_KEY = 'rey2026';

let adminSessionUnlocked = false;

export function isAdminSessionUnlocked() {
  return adminSessionUnlocked;
}

export function unlockAdminSession() {
  adminSessionUnlocked = true;
}

export function lockAdminSession() {
  adminSessionUnlocked = false;
}

export function verifyAdminPassKey(passKey: string) {
  return normalizePassKey(passKey) === normalizePassKey(getAdminPassKey());
}

function getAdminPassKey() {
  return process.env.EXPO_PUBLIC_ADMIN_PASS_KEY?.trim() || DEFAULT_ADMIN_PASS_KEY;
}

function normalizePassKey(value: string) {
  return value.trim().toLowerCase();
}
