const maybeClerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!maybeClerkPublishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your local .env file.',
  );
}

export const clerkPublishableKey: string = maybeClerkPublishableKey;
