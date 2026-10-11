# Home feed — 11 October 2026

Implements the supplied Home references with responsive, interactive content. The four accepted AI navigation icons and Averta typography remain in use.

## Sections and actions

- For You prioritizes saved/favourite and upcoming listings. Event cards open details; the menu toggles Watchlist membership.
- Explore Events uses three-row horizontal columns, with continuous outlined `01`, `02`, `03` numbering across columns and in View All.
- Last Minute contains events on dates within the next 14 calendar days. Popular This Weekend covers Friday–Sunday, excluding elapsed dates; on Monday–Thursday it uses the next weekend.
- Just Announced uses explicit announcement metadata from the past 30 days. Sponsored Presales requires explicit sponsor/presale metadata. No presale or sponsorship is inferred from an event's title.
- Concerts, Sports, Arts/Theatre/Comedy, Family and Festivals group upcoming records by performer/team and calculate counts from those records. Hearts save/remove the group's events. Tapping a performer opens its upcoming listings.
- Promoted In The United States uses explicitly marked catalog entries and their promotion copy.
- City Guides derive cities from upcoming records and open matching city listings. Browsing a guide does not overwrite the user's saved location.
- View All/search renders a responsive event list. Back to Home restores the feed scroll position.

## Location bubble

Only the outer vertical feed scroll controls the bubble. After 18px of downward travel it fades out while translating down 28px; upward travel reverses the same animation. The transition lasts 220ms and supports interruption. Overscroll is clamped so bottom/top bounce does not trigger a false reversal; returning near the top reveals the bubble. Hidden content cannot receive taps or accessibility focus. Reduced-motion preferences make the transition immediate. Space in the feed remains stable while the bubble animates.

## Content sources

Home continues to consume the shared event store and follow incoming event updates. Optional `EventRecord.discovery` metadata provides categories, performer names, announcements, promotions and presales. Unknown metadata stays unknown.

The user requested additional content for the assignment. A separate **26-event local sample catalog** provides examples across all five categories, including the performers in the reference screenshots. These sample dates, venues, announcements and presales are illustrative and fixed; they are not a live Ticketmaster inventory feed. Home includes a sample-catalog note, event menus identify samples, and sample detail pages explain that no tickets are on sale. Details, saves, favourites and filtered browsing work with the same IDs used by Watchlist. Sample listings have no seats, cannot create real reservations, and are never added to Firebase seed data. Real incoming records take precedence by ID.

Public artwork URLs and source pages are recorded in [home-artwork-sources.json](./home-artwork-sources.json). Performer images come from Ticketmaster, with Escape artwork from its official festival site. City images use Ticketmaster's city-header assets. All 31 images are bundled locally (about 1.53 MB total), so the sample feed does not need an image-server connection. Representative downloaded artwork was visually inspected against the supplied references; live screen rendering remains unverified.

## Verification

- Automated coverage: calendar boundaries, weekday/weekend handling, metadata-driven sections, artist/city counts, sample catalog uniqueness, incoming updates, reservation isolation, scroll direction/jitter/overscroll, and responsive card geometry from 320–1366px.
- Targeted ESLint passes. TypeScript passes with the automatic JSX runtime used by the Expo build (`tsc --noEmit --jsx react-jsx`). The repository's older `jsx: react` setting still reports pre-existing missing React imports in unrelated files.
- Expo development web export and the registered-module/runtime-store check pass. iOS and Android export pass.
- Live visual comparison and real touch/scroll device verification remain unavailable because browser automation was previously denied in this session. Build/data checks do not claim screenshot equivalence.
