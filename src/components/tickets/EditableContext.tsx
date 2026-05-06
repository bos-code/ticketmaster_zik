import { createContext, useContext } from 'react';

import type { TicketRecord } from '@/store/ticketStore';

export type EditableContextValue = {
  editable: boolean;
  ticket: TicketRecord;
  onFieldChange: (field: keyof TicketRecord, value: string) => void;
};

const EditableContext = createContext<EditableContextValue | null>(null);

export const EditableProvider = EditableContext.Provider;

export function useEditable() {
  return useContext(EditableContext);
}
