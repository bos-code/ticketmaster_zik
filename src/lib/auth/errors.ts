const FALLBACK_AUTH_ERROR = 'Could not complete authentication. Please try again.';
const FALLBACK_OAUTH_ERROR = 'Could not complete social sign-in. Please try again.';

function readErrorMessage(value: unknown) {
  if (value instanceof Error && value.message.trim().length > 0) {
    return value.message;
  }

  return null;
}

export function getAuthErrorMessage(error: unknown) {
  return readErrorMessage(error) ?? FALLBACK_AUTH_ERROR;
}

export function getOAuthErrorMessage(error: unknown) {
  return readErrorMessage(error) ?? FALLBACK_OAUTH_ERROR;
}
