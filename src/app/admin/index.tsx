import React from 'react';

import { AdminTicketManagementScreen } from '@/components/admin/admin-ticket-management-screen';
import { ProtectedAdminRoute } from '@/components/admin/protected-admin-route';

export default function AdminIndexScreen() {
  return (
    <ProtectedAdminRoute>
      <AdminTicketManagementScreen platform="v2" />
    </ProtectedAdminRoute>
  );
}
