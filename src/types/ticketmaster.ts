export type TicketmasterVenue = { id: string; name: string; address: string; city: string; state: string; country: string };
export type TicketmasterEvent = { id: string; name: string; artistName: string; date: string; time: string; status: string; imageUrl: string; category: string; venue: TicketmasterVenue | null };
