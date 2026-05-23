<div align="center">

```
██████╗ ███████╗██╗   ██╗    ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗███████╗
██╔══██╗██╔════╝╚██╗ ██╔╝    ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝
██████╔╝█████╗   ╚████╔╝        ██║   ██║██║     █████╔╝ █████╗     ██║   ███████╗
██╔══██╗██╔══╝    ╚██╔╝         ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ╚════██║
██║  ██║███████╗   ██║          ██║   ██║╚██████╗██║  ██╗███████╗   ██║   ███████║
╚═╝  ╚═╝╚══════╝   ╚═╝          ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝
```

### **The Future of Live Event Ticketing**
*Cross-platform · Real-time · QR-secured · PWA-first*

---

![Version](https://img.shields.io/badge/version-1.0.0-6B4FBB?style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.x-FF6D00?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![Status](https://img.shields.io/badge/status-active_development-22c55e?style=for-the-badge)

</div>

---

## ◈ What Is This?

**Rey Tickets** is a production-grade, full-stack event ticketing platform engineered for the modern era. It is simultaneously a **native mobile app** (Android + iOS), an **installable PWA**, and a **web admin dashboard** — all from a single unified codebase.

Organizers create events. Attendees discover, purchase, and hold their tickets in a beautifully crafted mobile experience. Entry is validated with a cryptographic QR code that cannot be duplicated or reused.

> Built with Expo 54, React 19, Firebase, MapLibre, and a zero-compromise approach to UX.

---

## ◈ Platform Matrix

| Platform | Delivery | Status |
|---|---|---|
| 🤖 Android Native | EAS Build → APK / AAB | ✅ Active |
| 🍎 iOS Native | EAS Build → TestFlight | ✅ Active |
| 🌐 Web PWA (Android) | Firebase Hosting | ✅ Active |
| 🌐 Web PWA (Desktop) | Firebase Hosting | ✅ Active |
| 📦 OTA Updates | Expo Updates / EAS Update | ✅ Active |

---

## ◈ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        REY TICKETS                               │
│                   Single Expo Codebase                           │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────────┐  │
│  │  Mobile App  │   │  Admin PWA   │   │    Shared Core      │  │
│  │  (iOS/Android│   │  (Web/PWA)   │   │  ┌───────────────┐  │  │
│  │              │   │              │   │  │ Zustand Store │  │  │
│  │  • Discover  │   │  • Events    │   │  │ TanStack Query│  │  │
│  │  • Purchase  │   │  • Tickets   │   │  │ Expo Router   │  │  │
│  │  • My Tickets│   │  • Analytics │   │  │ Firebase SDK  │  │  │
│  │  • QR Entry  │   │  • Users     │   │  └───────────────┘  │  │
│  └──────┬───────┘   └──────┬───────┘   └─────────────────────┘  │
│         │                  │                                      │
│  ┌──────▼──────────────────▼────────────────────────────────┐   │
│  │                    Firebase BaaS                          │   │
│  │   Firestore  │  Auth  │  Storage  │  Cloud Functions     │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ◈ Tech Stack

### Core Runtime

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo | `~54.0.33` |
| UI Runtime | React Native | `0.81.5` |
| Language | TypeScript | `~5.9.2` |
| React | React | `19.1.0` |
| Navigation | Expo Router (file-based) | `~6.0.23` |

### State & Data

| Purpose | Library | Version |
|---|---|---|
| Global State | Zustand | `^5.0.12` |
| Server State | TanStack React Query | `^5.99.0` |
| Primary DB/Auth | Firebase | `^12.13.0` |
| Secondary DB | Supabase JS | `^2.103.3` |

### Maps & Location

| Feature | Technology |
|---|---|
| Web/PWA Maps | MapLibre GL (`^5.24.0`) + OpenFreeMap tiles |
| Native iOS Map | WebView + MapLibre (Apple Maps style) |
| Native Android Map | `react-native-maps` 1.20.1 + Google Maps |
| Directions | Google Maps Directions API |
| Geocoding | Google Places API |
| Location | `expo-location` |

### UI / Styling

| Tool | Purpose |
|---|---|
| NativeWind 5 (preview) | Tailwind CSS for React Native |
| TailwindCSS 4 | Web styling engine |
| expo-linear-gradient | Gradient effects |
| expo-glass-effect | Glassmorphism |
| react-native-reanimated 4 | Fluid animations |
| react-native-gesture-handler | Native gestures |
| expo-symbols | SF Symbols (iOS) |

### Media & Assets

| Tool | Purpose |
|---|---|
| expo-image | Optimized image rendering |
| expo-image-picker | Camera roll access |
| Cloudinary | Cloud image hosting + transforms |
| react-easy-crop | In-app image cropping |
| expo-barcode-generator | QR code generation |

### Infrastructure & Deployment

| Service | Purpose |
|---|---|
| EAS Build | Cloud native app builds |
| EAS Update | OTA hot updates |
| Firebase Hosting | Web/PWA deployment |
| Vercel | Alternative web deployment |
| Service Worker | PWA offline shell caching |

---

## ◈ Feature Breakdown

### 🎭 Event Discovery
- Rich event cards with high-res banners (Cloudinary CDN)
- Category filtering, date-based browsing
- Venue map preview (MapLibre + OpenFreeMap)
- Premium events section with exclusive access

### 🎟️ Ticket System
- Multi-type ticket support (General, VIP, Premium)
- Unique QR code per ticket (stored securely)
- Ticket transfer flow — send to contacts
- Ticket wallet with past + upcoming views

### 🗺️ Venue Intelligence
- Interactive embedded MapLibre map (web + iOS WebView)
- Turn-by-turn directions via Google Maps API
- Apple Maps-style UI on iOS, Google Maps on Android
- Static map previews as fallback

### 🔐 QR Validation
- Each ticket carries a unique, opaque `ticketId` in its QR
- Server-side validation via Firebase (no client-side trust)
- Tickets are atomically marked `used = true` on scan
- Re-scan attempts are instantly rejected

### 🛡️ Admin Dashboard (Web PWA)
- Protected admin routes with passkey auth
- Create / edit events with full media upload
- Live ticket management and bulk operations
- Ticket preview & print mode
- User role management (user | organizer | admin)

### 📱 PWA Features
- Installable on Android home screen
- Offline shell via Service Worker (`v10`)
- Portrait-locked standalone display
- Push notifications via `expo-notifications`

---

## ◈ Project Structure

```
ticketmaster_zik/
│
├── src/
│   ├── app/                    # Expo Router file-based routes
│   │   ├── (tabs)/             # Bottom tab navigator
│   │   │   ├── index.tsx       # Discover / Home
│   │   │   ├── my-tickets.tsx  # Ticket wallet
│   │   │   ├── premium.tsx     # Premium events
│   │   │   └── my-account.tsx  # Profile & settings
│   │   ├── event/[id].tsx      # Event detail screen
│   │   ├── event-directions/   # Directions flow
│   │   └── admin/              # Protected admin routes
│   │
│   ├── components/
│   │   ├── events/             # Event cards, map card, directions
│   │   │   ├── venue-map-card.tsx        # Native map card
│   │   │   ├── venue-map-card.web.tsx    # Web MapLibre map card
│   │   │   ├── apple-maps-webview.tsx    # iOS WebView map
│   │   │   └── event-directions-screen.tsx
│   │   ├── tickets/            # QR ticket components + transfer flow
│   │   ├── admin/              # Admin-only screens & tools
│   │   ├── settings/           # App settings
│   │   └── VenueMap.tsx        # Native map entry point
│   │       VenueMap.web.tsx    # Web/PWA iframe map
│   │
│   ├── lib/
│   │   ├── firebase-data.ts    # Firestore data access layer
│   │   ├── map-utils.ts        # Map helpers, coordinate utils
│   │   ├── directions.ts       # Directions API integration
│   │   ├── geocoding.ts        # Places + geocoding
│   │   └── data.ts             # General data helpers
│   │
│   ├── store/
│   │   ├── use-event-store.ts  # Zustand event state
│   │   └── ticketStore.ts      # Zustand ticket state
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── constants/              # Theme tokens, map styles
│   ├── providers/              # Context providers
│   └── types/                  # Shared TypeScript types
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── service-worker.js       # Offline cache strategy (v10)
│
├── plugins/                    # Custom Expo config plugins
├── assets/                     # Static icons, images
├── app.json                    # Expo app configuration
├── eas.json                    # EAS build profiles
└── firebase.json               # Firebase project config
```

---

## ◈ Data Model

```typescript
// Users
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'organizer' | 'admin';
  createdAt: Timestamp;
}

// Events
interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Timestamp;
  venue: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  bannerUrl: string;
  organizerId: string;
  ticketTypes: TicketType[];
  isPremium: boolean;
}

// Tickets
interface Ticket {
  id: string;           // The value encoded in the QR code
  eventId: string;
  userId: string;
  type: string;
  price: number;
  used: boolean;        // Atomically set to true on scan
  usedAt?: Timestamp;
  transferredFrom?: string;
  createdAt: Timestamp;
}

// Orders
interface Order {
  id: string;
  userId: string;
  eventId: string;
  tickets: string[];    // Array of ticket IDs
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  createdAt: Timestamp;
}
```

---

## ◈ Map Architecture (Platform-Specific)

The app uses a **platform-split map strategy** to deliver the best possible experience on each platform without bloating any single bundle:

```
VenueMapCard
    ├── venue-map-card.web.tsx   ← Web/PWA: MapLibre GL (npm), renders directly in DOM
    └── venue-map-card.tsx       ← Native: delegates to VenueMap

VenueMap
    ├── VenueMap.web.tsx         ← Web: MapLibre in sandboxed <iframe srcDoc>
    └── VenueMap.tsx             ← Native: delegates to AppleMapsWebView

AppleMapsWebView
    ├── apple-maps-webview.web.tsx  ← Web no-op: re-uses VenueMap.web
    └── apple-maps-webview.tsx      ← Native: react-native-webview + MapLibre HTML
                                       + Google Places search + draggable pin
```

**Map tile source:** [OpenFreeMap](https://openfreemap.org) — free, fast, no API key required.  
**Renderer:** MapLibre GL JS `^5.24.0` — WebGL-powered, runs in both browser and WebView.

---

## ◈ Getting Started

### Prerequisites

```bash
node >= 20
pnpm >= 9
expo-cli (installed globally or via pnpm dlx)
```

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-org/rey-tickets.git
cd rey-tickets

# Install dependencies
pnpm install

# Start Expo dev server (choose your platform)
pnpm web          # Web / PWA in browser
pnpm android      # Android native (requires emulator or device)
pnpm ios          # iOS native (requires Xcode)
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Android native | Google Maps + Places + Directions |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | ✅ Yes | Firebase SDK init |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ Yes | Firebase Auth |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ✅ Yes | Firestore + Storage |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ Yes | Image CDN |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ✅ Yes | Unsigned upload preset |
| `EXPO_PUBLIC_ADMIN_PASS_KEY` | Admin only | Admin route access |

> ⚠️ The Google Maps API key is **only required for Android native**. Web/PWA maps use MapLibre + OpenFreeMap (free, no key).

---

## ◈ Build & Deploy

### Native Builds (EAS)

```bash
# Development build (installable APK with dev tools)
pnpm eas:build:dev

# Preview build (production-like, shareable)
pnpm eas:build:preview

# Production build (app store ready)
pnpm eas:build:production
```

### OTA Updates

```bash
# Push a JavaScript-only update to all active users
eas update --branch production --message "fix: map on Android PWA"
```

### Web / PWA Deployment

```bash
# Build static web output
npx expo export --platform web

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy to Vercel
vercel --prod
```

> The Service Worker (`public/service-worker.js`) uses a versioned cache (`ticketmaster-rey-v10`). Bump the version on every deploy to force a clean reinstall on all devices.

---

## ◈ Security Model

| Threat | Mitigation |
|---|---|
| Ticket forgery | QR encodes only `ticketId` — no ticket data. Server validates. |
| Replay attack | `used` flag set atomically via Firestore transaction on first scan |
| Admin access | Passkey-gated routes + role field checked server-side via Firestore Rules |
| Image abuse | Cloudinary signed upload presets with size + format restrictions |
| Data leakage | Firestore Security Rules enforce per-user data isolation |
| API key exposure | All `EXPO_PUBLIC_` keys are intentionally client-safe (scoped, restricted) |

---

## ◈ Firestore Security Rules

Rules live in [`firestore.rules`](firestore.rules). Key principles:

- Users can only read/write **their own** user document
- Tickets can only be read by the **owning user** or an **admin**
- Events are readable by all; writable only by **organizers/admins**
- The `used` field on tickets is **append-only** (can go `false → true`, never back)

---

## ◈ Roadmap

```
Phase 1 — Foundation          ████████████████████  100% ✅
  Core auth, events, tickets, QR, maps, admin

Phase 2 — Monetization        ████████░░░░░░░░░░░░   40% 🚧
  Paystack payment integration
  Ticket pricing tiers
  Revenue dashboard for organizers

Phase 3 — Social Layer        ░░░░░░░░░░░░░░░░░░░░    0% 📋
  Ticket transfer marketplace
  Friend invites & group bookings
  Social event sharing

Phase 4 — Intelligence        ░░░░░░░░░░░░░░░░░░░░    0% 📋
  Personalized event recommendations
  Attendance analytics for organizers
  Fraud detection on QR scan patterns
  AI-generated event descriptions

Phase 5 — Offline Power       ░░░░░░░░░░░░░░░░░░░░    0% 📋
  Full offline QR scanning (cached validation)
  Offline ticket storage with sync
  Background sync for ticket updates
```

---

## ◈ Performance Notes

- **Images**: All event banners served via Cloudinary CDN with auto-format + auto-quality transforms
- **Maps**: MapLibre WebGL renderer — GPU-accelerated, 60fps pan/zoom
- **Tiles**: OpenFreeMap serves vector tiles — tiny payloads vs. raster tiles
- **Queries**: TanStack Query handles caching, background refetch, and stale-while-revalidate
- **Bundles**: Platform-split files (`.web.tsx` / `.tsx`) ensure native bundles never include browser-only code
- **PWA Cache**: Service Worker v10 caches app shell; CDN map assets explicitly bypassed to prevent opaque response quota pressure on Android

---

## ◈ Developer Notes

- **File-size budget**: Keep individual screen files under **500 lines**. Extract sub-flows into focused components (e.g., `ticket-transfer-flow-*.tsx` pattern).
- **Platform splits**: Use `.web.tsx` suffix for any component that imports browser APIs or `maplibre-gl`. Never import `react-native-maps` in a `.web.tsx` file.
- **Map API key**: Only `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` gates Android native map rendering. Web/PWA maps are always rendered regardless.
- **QR reliability**: Never store ticket metadata in the QR payload. The `ticketId` is the only value — everything else is resolved server-side.
- **Service Worker**: Bump `CACHE_NAME` version on **every production deploy**. Android PWA caches aggressively.
- **Secrets**: `EXPO_PUBLIC_ADMIN_PASS_KEY` is a UX gate, not a security boundary. Admin Firestore Rules are the real enforcement layer.

---

## ◈ App Sitemap

Full route map lives in [docs/sitemap.md](docs/sitemap.md), including:
- Complete Expo Router route tree
- Ticket purchase and transfer navigation flows
- Admin route structure and access guards
- Historical route changes across major commits

---

<div align="center">

---

```
Built with  ♥  by John Dera
Powered by Expo · Firebase · MapLibre · React 19
```

*Rey Tickets — Every seat has a story.*

</div>
