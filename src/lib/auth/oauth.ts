import * as AuthSession from 'expo-auth-session';

export const OAUTH_CALLBACK_PATH = 'sso-callback';

export function getOAuthRedirectUrl() {
  return AuthSession.makeRedirectUri({
    path: OAUTH_CALLBACK_PATH,
  });
}
