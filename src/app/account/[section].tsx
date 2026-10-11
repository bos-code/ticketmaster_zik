import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { AccountDetailScreen } from '@/components/account/account-detail-screen';
export default function AccountDetailRoute() {
  const { section } = useLocalSearchParams<{ section: string }>();
  return <AccountDetailScreen section={section ?? ''} />;
}
