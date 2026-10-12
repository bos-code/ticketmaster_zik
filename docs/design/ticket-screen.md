# Ticket overview and viewer

The October 11 ticket references guide the dark overview, image-backed collapsed
header, pinned Tickets/Extras tabs, seat cards, directions panel, social card,
three-action dock, and ticket carousel. Event artwork, event/date/venue text,
order number, seat values and transfer eligibility come from TicketFlowContext.
No artist, order or seat from the reference screenshots is hard-coded here.

The overview has one tab strip. It moves up with the overview and stops below
the compact header; its measured height reserves space in the scroll content.
Seat cards use one column on phones and two columns on larger screens. The
viewer measures its available width, keeps each seat centered after resizing,
and permits vertical scrolling on short screens. Its Ticket Info drawer reads
the currently selected seat. Previous/next controls supplement horizontal swipe.
The barcode sweep respects reduced motion and stops when its card unmounts.
Its artwork viewport trims the source SVG's empty margins so the code spans
the white panel, with proportional height. The sweep measures that displayed
width instead of using a fixed travel distance. The social card keeps its
foreground artwork sharp and softly blurs the same event image behind it.

Directions use the selected venue's coordinates or an address search when those
coordinates are absent. The map preview has a dark palette and a fixed venue
pin. It does not display a fallback map in an unrelated city or invent nearby
points of interest. The full location picker retains its existing appearance.

Sharing opens the platform share dialog with the current event's public details;
web browsers without sharing support copy those details for a post. It never
includes the private order number, seat information or barcode.

The barcode artwork is a preview, not a Ticketmaster admission credential.
Wallet passes, upgrades and resale are not integrated. The corresponding
controls explain availability or remain disabled; they do not simulate success.
The existing transfer flow has not gained a delivery backend in this change.

Validation: TypeScript with Expo's automatic JSX runtime, targeted ESLint,
responsive/preview/Home regression checks and embedded-map script tests.
Development web module validation and iOS/Android exports also pass. Live
browser visual verification remains unavailable, so the screenshots have not
been certified as a pixel-for-pixel match.
