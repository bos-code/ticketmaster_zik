import React from 'react';

import { AddEventAdminScreen } from '@/components/admin/add-event-admin-screen';
import { ProtectedAdminRoute } from '@/components/admin/protected-admin-route';

export default function AddEventScreen() {
  return (
    <ProtectedAdminRoute>
      <AddEventAdminScreen />
    </ProtectedAdminRoute>
  );
}
