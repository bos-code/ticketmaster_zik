type ClerkError = {
  code?: string;
  longMessage?: string;
  message?: string;
};

type ClerkErrorResponse = {
  errors?: ClerkError[];
  message?: string;
};

const fallbackMessage = 'Something went wrong. Check your connection and try again.';

const friendlyMessages: Record<string, string> = {
  form_code_incorrect: 'That code is not correct. Check the email and try again.',
  form_code_expired: 'That code expired. Request a new one and try again.',
  form_identifier_not_found: 'No account exists for that email address.',
  form_identifier_exists: 'An account already exists for that identifier. Sign in instead.',
  form_param_format_invalid: 'Check the email or phone number and try again.',
  form_phone_number_invalid: 'Check the phone number and include the country code.',
  strategy_for_user_invalid: 'This sign-in method is not available for that account.',
};

export function getAuthErrorMessage(error: unknown) {
  const response = error as ClerkErrorResponse;
  const clerkError = response.errors?.[0];
  const code = clerkError?.code;

  if (code && friendlyMessages[code]) {
    return friendlyMessages[code];
  }

  return clerkError?.longMessage ?? clerkError?.message ?? response.message ?? fallbackMessage;
}

export function getOAuthErrorMessage(error: unknown) {
  const message = getAuthErrorMessage(error);

  if (/cancel/i.test(message)) {
    return 'Sign in was canceled.';
  }

  if (/network|fetch|internet/i.test(message)) {
    return 'Network issue while opening the provider. Try again.';
  }

  return message;
}
