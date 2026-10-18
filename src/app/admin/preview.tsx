import React from 'react';

import { AdminTicketPreviewScreen } from '@/components/admin/admin-ticket-preview-screen';
import { ProtectedAdminRoute } from '@/components/admin/protected-admin-route';

export default function AdminPreviewRoute() {
  return (
    <ProtectedAdminRoute>
      <AdminTicketPreviewScreen />
    </ProtectedAdminRoute>
  );
}
