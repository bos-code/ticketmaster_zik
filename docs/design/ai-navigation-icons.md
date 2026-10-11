# AI-generated navigation icons

Eight final PNG icons were generated with the built-in image-generation tool for Home, Watchlist, My Tickets and Account, each with active and inactive states. These are reference-inspired generated artwork, not downloaded official Ticketmaster icons.

## Reference images

The user supplied these visual references:

- [Home selected](references/tabs-home.png)
- [Watchlist selected](references/tabs-watchlist.png)
- [My Tickets selected](references/tabs-tickets.png)
- [Account selected](references/tabs-account.png)
- [Tickets inactive close-up](references/tickets-inactive-closeup.png)
- [Tickets active close-up](references/tickets-active-closeup.png)

## Final assets and integration

The eight PNGs live in `assets/tabicon/ai-v1/`. Generated pixels are copied unchanged. Home-active and Watchlist-active retain generated transparency. The other six use black canvases matching the navigation bar; this avoids the damaged white lines produced by transparency processing in discarded drafts.

`src/constants/generated-tab-icons.ts` maps both states to bundled files and records visible-artwork bounds. `src/components/ticketmaster-tab-icon.tsx` balances their optical size, using a consistent per-icon aspect ratio for both states. Both images stay mounted; route selection changes their visibility with no crossfade or asset swap. Existing labels, accessible tab names, responsive layout and touch targets remain UI components. The shared ticket stack in event details remains an SVG.

My Tickets uses two plain rectangular cards with uninterrupted edges, opposing tilts and the small outlined rectangle/rules inside the front card. Active shows a blue front card and white rear card; inactive shows white outlines. Ticket-stub notches and perforations were rejected.

## Exact final generation prompts

### home-active.png

Use case: logo-brand. Asset type: production mobile bottom-navigation icon, transparent PNG. The attached four images are reference images showing the same navigation bar in its four selected states. Recreate ONLY the specified icon as a clean, flat, high fidelity isolated asset, matching the screenshot icon's silhouette, proportions and optical line weight. Output one square image containing one centered icon, occupying 88% of canvas height, with consistent transparent padding. Actual alpha transparency outside strokes and shapes is mandatory. No background, labels, extra icons, mockup, texture, shadows, gradient, bevel or decorative embellishments. White strokes/fills #FFFFFF, active blue #0452E8, active purple #BF61F5. Crisp antialiased geometric edges, readable at 26px. Preserve the reference shape rather than redesigning it.
Specified icon: HOME ACTIVE, reference image 1. A solid royal-blue circular disc, white italic lowercase t centered, and tiny white four-point sparkle at the disc's upper-right edge. The t has the familiar short curved foot. No surrounding outline.

### home-inactive.png

Use case: logo-brand. Generate one clean flat vector-style mobile navigation icon. Subject: A thin perfect white circular outline enclosing a white italic lowercase t with its short curved foot. The t is 56% of the circle height. Circle is unfilled black. No sparkle, no blue. Outer circle stroke is 3% of circle diameter. Solid pure BLACK #000000 square canvas matching the app navigation bar, no transparency processing. White is #FFFFFF. Perfectly uniform mechanically smooth shapes and edges. No texture, no speckles, no distressing, no glow, no gradient, no shadow, no labels or extra marks. Make the icon 880 pixels tall, centered within a 1024x1024 square with even padding. Keep a thin lightweight line style suitable for a 26px mobile tab icon.

### watchlist-active.png

Use case: logo-brand. Asset type: production mobile bottom-navigation icon, transparent PNG. The attached four images are reference images showing the same navigation bar in its four selected states. Recreate ONLY the specified icon as a clean, flat, high fidelity isolated asset, matching the screenshot icon's silhouette, proportions and optical line weight. Output one square image containing one centered icon, occupying 88% of canvas height, with consistent transparent padding. Actual alpha transparency outside strokes and shapes is mandatory. No background, labels, extra icons, mockup, texture, shadows, gradient, bevel or decorative embellishments. White strokes/fills #FFFFFF, active blue #0452E8, active purple #BF61F5. Crisp antialiased geometric edges, readable at 26px. Preserve the reference shape rather than redesigning it.
Specified icon: WATCHLIST ACTIVE, reference image 2. A narrow upright bookmark ribbon filled solid purple, small rounded top corners, straight vertical sides and a symmetric inward V-shaped notch at its bottom. Transparent outside the purple silhouette. No border, circle or additional mark.

### watchlist-inactive.png

Use case: logo-brand. Generate one clean flat vector-style mobile navigation icon. Subject: A narrow vertical bookmark ribbon outlined in smooth thin white strokes, with black interior. Height to width ratio 1.7:1. Slightly rounded top corners; straight vertical sides; two diagonal bottom edges forming a symmetric inward V notch. Stroke is 3% of the bookmark height. No circle, no fill. Solid pure BLACK #000000 square canvas matching the app navigation bar, no transparency processing. White is #FFFFFF. Perfectly uniform mechanically smooth shapes and edges. No texture, no speckles, no distressing, no glow, no gradient, no shadow, no labels or extra marks. Make the icon 880 pixels tall, centered within a 1024x1024 square with even padding. Keep a thin lightweight line style suitable for a 26px mobile tab icon.

### tickets-active.png

Use case: logo-brand. Generate one single mobile MY TICKETS navigation icon faithfully matching the provided close-up reference. Input images are shape/style references, not an image to enlarge or a background to remove. Active state as in reference image 2: front card a flat blue plain rectangle tilted counterclockwise around 12 degrees. A second flat solid WHITE plain rectangular card behind it is tilted clockwise around 12 degrees, showing at the right and bottom. Front blue card contains a small thin white outlined horizontal rectangle in upper-middle, a short horizontal white stroke inside it, and two short thin white horizontal rules below. Corners nearly square. Critical silhouette: FOUR STRAIGHT UNINTERRUPTED SIDES on each card. Absolutely NO notches, NO perforation, NO semicircular cutouts, NO scallops, NO ticket-stub edge details. This icon is stacked paper rectangles, not an admission-ticket silhouette. Blue #0452E8, white #FFFFFF. Solid pure BLACK #000000 square background matching the app's navigation bar, with all interior unfilled regions pure black. Ultra-clean flat vector-style edges. No speckling, texture, gradients, shadows, photorealism, labels, text or extra symbols. Center the icon, make its total height 880px in a 1024px square canvas with even padding. Reproduce the small internal marks, thin stroke weight, proportions and tilt from the close-up.

### tickets-inactive.png

Use case: logo-brand. Generate one single mobile MY TICKETS navigation icon faithfully matching the provided close-up reference. Input images are shape/style references, not an image to enlarge or a background to remove. Inactive state as in reference image 1: two plain rectangular cards in thin smooth white outline, black interiors. Front card counterclockwise tilted by around 12 degrees. Rear card behind it tilted clockwise by around 12 degrees, visible at the right and bottom. Front rectangle contains a small thin outlined horizontal rectangle in upper-middle with short white horizontal stroke inside it, then two short thin parallel white horizontal rules below. Strokes are delicate and consistent, outer corners nearly square. Critical silhouette: FOUR STRAIGHT UNINTERRUPTED SIDES on each card. Absolutely NO notches, NO perforation, NO semicircular cutouts, NO scallops, NO ticket-stub edge details. This icon is stacked paper rectangles, not an admission-ticket silhouette. Blue #0452E8, white #FFFFFF. Solid pure BLACK #000000 square background matching the app's navigation bar, with all interior unfilled regions pure black. Ultra-clean flat vector-style edges. No speckling, texture, gradients, shadows, photorealism, labels, text or extra symbols. Center the icon, make its total height 880px in a 1024px square canvas with even padding. Reproduce the small internal marks, thin stroke weight, proportions and tilt from the close-up.

### account-active.png

Use case: logo-brand. Generate one clean flat vector-style mobile navigation icon. Subject: A solid flat BLUE #0452E8 circular disc. Inside, a solid white circular head, diameter 27% of the blue disc diameter, centered horizontally with its center at 35% of disc height. Below, a detached broad white shoulder-and-torso silhouette spanning 78% of disc width, with rounded dome shoulders, cropped by the disc's lower boundary so the white silhouette touches the bottom edge. No enclosing white stroke, no facial features. Solid pure BLACK #000000 square canvas matching the app navigation bar, no transparency processing. White is #FFFFFF. Perfectly uniform mechanically smooth shapes and edges. No texture, no speckles, no distressing, no glow, no gradient, no shadow, no labels or extra marks. Make the icon 880 pixels tall, centered within a 1024x1024 square with even padding. Keep a thin lightweight line style suitable for a 26px mobile tab icon.

### account-inactive.png

Use case: logo-brand. Generate one clean flat vector-style mobile navigation icon. Subject: A thin perfect white circular outline. Inside, a small white outlined circle for the head, 27% of the outer circle diameter, center at 36% of the disc height. Below, one thin white smooth curved shoulder arc meeting the outer circle near its lower-left and lower-right sides at 76% of its height. All interiors black, no blue and no solid profile fill. Stroke is 3% of the outer-circle diameter. Solid pure BLACK #000000 square canvas matching the app navigation bar, no transparency processing. White is #FFFFFF. Perfectly uniform mechanically smooth shapes and edges. No texture, no speckles, no distressing, no glow, no gradient, no shadow, no labels or extra marks. Make the icon 880 pixels tall, centered within a 1024x1024 square with even padding. Keep a thin lightweight line style suitable for a 26px mobile tab icon.



## Verification

All eight PNGs were decoded and their visible bounds measured before integration. TypeScript and targeted ESLint checks pass. Web, iOS and Android exports pass; the native asset inventory includes all eight files. All 1,771 registered development-web modules parse and resolve, including the generated asset imports. Preview-cache recovery checks also pass. The final generated artwork was visually inspected against the supplied references; live browser screenshot verification remains unavailable under this session's browser automation policy.
