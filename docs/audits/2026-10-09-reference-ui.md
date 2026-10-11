# Reference UI audit — 9 October 2026

Source review of the screens introduced for the supplied Ticketmaster references. Live browser visual inspection is unavailable in this session. Findings below are verified from source and runtime bundle checks; they do not claim screenshot equivalence.

## Verdict

The mobile references were reproduced too literally. Whole-app phone sizing, copied identity, tiny text, and sample discovery fixtures made the result behave like a mockup. The appropriate correction is to retain the visual language while making layout and content respond to the viewport and app data.

## Findings and priority

| Severity | Location | Finding and impact | Required correction |
| --- | --- | --- | --- |
| High | `global.css`, `src/app/+html.tsx` | Root capped at 480px and centered, producing side bands even on wider phones. Separate standalone rules translated the root. | Fill the viewport in browser and installed mode; bound individual content only. |
| High | `src/app/(tabs)/_layout.tsx` | 9px labels, fixed 52px height, disabled text scaling, and automatic tablet label placement could compress or misalign navigation. | Four explicit equal-width tabs; adequate touch targets; safe areas; deliberate wide layout. |
| High | `src/store/use-fan-store.ts` | Default account name/email copied from a screenshot and persisted. Users appear to have another person's profile. | Blank profile, user-controlled editing, migration removing only untouched fixture identity. |
| High | `src/components/discovery/use-discovery-events.ts` | Reference listings and invented dates were always mixed into real event data. | Derive discovery from app records, and use explicit empty states for unavailable sections. |
| High | Ticket controller/viewer | Viewer center calculated against 430px rather than available width. Fixed vertical carousel could clip tickets on short screens. | Center against measured container, bound card size, make vertical content scroll. |
| Medium | Account, Watchlist, discovery cards, hero | Many touch controls under 44px, 10–12px supporting text, fixed row heights. | Larger controls and text; wrapping/min-height; reflow columns on wide screens. |
| Medium | Discovery & account layout | No wide-screen layout; trending group grew to 85% of a desktop viewport. | Content-derived card sizes, multi-column lists/groups, readable desktop forms. |
| Medium | Floating prompts and menus | Prompts stretched across a large viewport; menu width assumed a phone. | Full-width backgrounds with bounded, centered interactive panels. |
| High, pre-existing | Transfer controller | Verification/delivery is simulated with a timer and random success, not a delivery service. | Backend integration required; this UI audit must not describe simulated delivery as verified ticket transfer. |
| Medium, pre-existing | Ticket viewer | Apple Wallet button has no action. | Present its unavailable state honestly instead of a dead action. |

## Positive findings

Averta fonts are bundled locally; the ticket detail reads current app records; saved-event toggles, preference persistence, error messages, and actual permission requests exist. The development bundle now has a regression check for syntax and dependency registration.

## Remediation and verification

Use the adaptation workflow for viewport filling, navigation, wide layouts, safe areas, and scrolling. Use data/state corrections for profile migration and discovery. Verify layout invariants at 320, 390, 430, 768, and 1366px; verify profile migration and persistence; run type/lint checks and development-bundle parsing/execution. Visual review on real devices remains necessary and must be reported separately from code/build checks.

## Applied corrections

- Removed root width caps, centering margins and standalone translations. Browser and installed roots use the full dynamic viewport.
- Rebuilt navigation with four equal tabs, minimum 48px controls, readable labels and explicit wide layout. Safe-area padding is included.
- Added measured layouts for Home, Watchlist, Account, ticket lists and the viewer. Wide screens use columns; carousel cards stay bounded and centered against the available container.
- Ticket hero image height responds to width/height. Hero measurement updates the collapse distance. Seat selection wraps; ticket viewing and transfer drawers scroll vertically. Drawer width is bounded independently of the app shell, and iOS keyboard avoidance is enabled.
- Profile defaults are blank. Versioned preferences remove the untouched screenshot identity and reference saves while preserving edited profiles and app saves. Profile edits and selected location update app state and persist locally. No authenticated session is implied.
- Removed reference artist fixtures and their unused images. Discovery uses discoverable app records; Last Minute filters actual event dates. Unknown location no longer defaults to the reference city/country.
- Replaced the nonfunctional Wallet action with its unavailable state. Real transfer delivery remains an existing backend limitation; it was not verified or implemented by this UI correction.

## Verification completed

- 14 automated checks pass: geometry at 320, 390, 430, 768, 844 and 1366px, landscape safe-area reductions, resize restoration, profile migration/edit persistence, discovery field updates and preview cache recovery.
- TypeScript and targeted ESLint checks pass.
- Expo development web export succeeds; all 1,762 registered modules parse as scripts and resolve their dependencies. The exported fan store and persistence middleware execute successfully.
- iOS and Android export succeeds.
- Preview remains listening on port 8082. Live browser/screenshot verification could not be performed because browser automation was denied in this session; no visual comparison is claimed.

Remaining manual verification: resize the browser and rotate a device; exercise all four tabs, save/remove events and favourites, edit/reopen the local profile, and open an order and swipe/page through its seats. Check larger text, keyboard use, and installed safe areas on actual devices. Authentication, recipient delivery and Wallet pass generation require separate integrations.
