import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

// Preserve old deep links while routing app events to their reservation screen.
export default function BrowseEventRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return id && !id.startsWith('reference-') ? <Redirect href={{ pathname: '/events/[id]', params: { id } }} /> : <Redirect href="/discover" />;
}
