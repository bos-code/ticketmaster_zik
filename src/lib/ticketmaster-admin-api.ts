import type { TicketmasterEvent } from '@/types/ticketmaster';

export async function searchTicketmasterEvents(query: string, signal?: AbortSignal) {
  const response = await fetch(`/api/ticketmaster?q=${encodeURIComponent(query.trim())}`, { signal });
  const payload = (await response.json()) as { events?: TicketmasterEvent[]; error?: string };
  if (!response.ok) throw new Error(payload.error || 'Ticketmaster lookup failed.');
  return payload.events ?? [];
}
