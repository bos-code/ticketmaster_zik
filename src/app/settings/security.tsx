import React from 'react';

import { AdminSecurityScreen } from '@/components/admin/admin-security-screen';
import { ProtectedAdminRoute } from '@/components/admin/protected-admin-route';

export default function SecuritySettingsRoute() {
  return (
    <ProtectedAdminRoute>
      <AdminSecurityScreen />
    </ProtectedAdminRoute>
  );
}
