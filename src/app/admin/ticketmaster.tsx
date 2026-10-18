import React from 'react';

import { ProtectedAdminRoute } from '@/components/admin/protected-admin-route';
import { TicketmasterSearchScreen } from '@/components/admin/ticketmaster-search-screen';

export default function AdminTicketmasterRoute() {
  return (
    <ProtectedAdminRoute>
      <TicketmasterSearchScreen />
    </ProtectedAdminRoute>
  );
}
