import * as Linking from 'expo-linking';

export function getOAuthRedirectUrl() {
  return Linking.createURL('/sso-callback');
}
