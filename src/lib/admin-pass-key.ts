const DEFAULT_ADMIN_PASS_KEY = 'rey2026';
const DEFAULT_ADMIN_NUMERIC_PIN = '2026';

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
  const normalizedPassKey = normalizePassKey(passKey);

  return getValidAdminPassKeys().some(
    (validPassKey) => normalizedPassKey === normalizePassKey(validPassKey),
  );
}

export function getAdminPassKeyLength() {
  return getAdminPassKey().length;
}

function getValidAdminPassKeys() {
  return [getAdminPassKey(), DEFAULT_ADMIN_NUMERIC_PIN];
}

function getAdminPassKey() {
  return process.env.EXPO_PUBLIC_ADMIN_PASS_KEY?.trim() || DEFAULT_ADMIN_PASS_KEY;
}

function normalizePassKey(value: string) {
  return value.trim().toLowerCase();
}
