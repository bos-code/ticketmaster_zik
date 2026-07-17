export type TicketmasterVenue = { id: string; name: string; address: string; city: string; state: string; country: string; postalCode: string; latitude: number | null; longitude: number | null };
export type TicketmasterEvent = { id: string; name: string; artistName: string; date: string; time: string; status: string; url: string; imageUrl: string; description: string; category: string; genre: string; subgenre: string; salesStart: string; salesEnd: string; venue: TicketmasterVenue | null };
export type TicketmasterSearchResponse = { events: TicketmasterEvent[]; venues: TicketmasterVenue[] };
