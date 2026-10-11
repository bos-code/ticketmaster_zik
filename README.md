# 🎟️ Ticketing App (Mobile + Web)

A full-featured event ticketing platform that allows organizers to create events and users to discover, purchase, and validate tickets using QR codes.

---

## 🚀 Overview

This application is a **Ticketmaster-inspired system** built for modern mobile-first usage. It focuses on:

* Simple event creation
* Seamless ticket purchasing
* Secure QR-based entry validation
* Lightweight admin control via web dashboard

---

## 🧱 Architecture

The system is composed of two main applications:

### 📱 Mobile App (User App)

* Browse and discover events
* View event details
* Purchase tickets
* Store and display QR tickets
* Share tickets (e.g., WhatsApp)
* View past and upcoming tickets

---

### 🌐 Web App (Admin Dashboard)

* Create and manage events
* Upload event banners
* Define ticket types and pricing
* Monitor ticket sales
* Manage users and roles

---

## 🗺️ App Sitemap

The maintained route map now lives in [docs/sitemap.md](docs/sitemap.md).

It includes:

* the current Expo Router sitemap
* the ticket navigation flow
* the major sitemap changes across previous commits

---

### ☁️ Backend (BaaS)

* Authentication (users, admins, organizers)
* Database (events, tickets, users)
* Storage (images, QR codes)
* Server-side validation (ticket verification)

---

## ⚙️ Tech Stack

### Frontend

* React Native (Expo) – Mobile app
* Next.js – Web dashboard
* Tailwind / NativeWind – Styling

### Backend / Services

* Firebase or Supabase (BaaS)
* Cloud Functions / Edge Functions

### Payments

* Paystack (planned integration)

### Utilities

* QR Code generation & scanning
* Image upload & storage
* Notifications (optional)

---

## 🎯 Core Features

### 1. Event Discovery

* Browse available events
* Filter by category, date, or location

### 2. Event Creation

* Add event title, description, date, venue
* Upload banner image
* Set ticket types and pricing

### 3. Ticket System

* Unique ticket per purchase
* QR code generation
* Ticket stored in user account

### 4. QR Validation

* Scan QR code at entry
* Verify ticket status
* Prevent duplicate use

### 5. Admin Dashboard

* Manage events and tickets
* Track sales and activity

---

## 🧩 Data Model (Simplified)

### Users

* id
* name
* email
* role (user | organizer | admin)

### Events

* id
* title
* description
* date
* venue
* banner
* organizerId

### Tickets

* id
* eventId
* userId
* type
* used (boolean)

### Orders

* id
* userId
* eventId
* status

---

## 🔐 Security Considerations

* QR codes store only `ticketId`
* All validation happens on backend
* Tickets are marked as used after scan
* Role-based access control enforced

---

## 📂 Project Structure (Example)

```
/mobile-app
  /src
    /screens
    /components
    /services
    /store

/web-app
  /app
  /components
  /lib

/backend
  /functions
  /config
```

---

## 🧪 Testing Focus

* Ticket generation & uniqueness
* QR scan validation
* Duplicate scan prevention
* Image upload reliability
* Role access enforcement

---

## 📦 Deployment

### Mobile

* Built with Expo
* Deployed via EAS (Android/iOS)

### Web

* Deployed on Vercel

### Backend

* Firebase / Supabase hosting

---

## 🛠️ Future Improvements

* Payment integration (Paystack)
* Push notifications
* Ticket resale marketplace
* Analytics dashboard
* Offline scanning mode
* Event recommendation system

---

## 💡 Design Philosophy

* Keep MVP simple and functional
* Prioritize security over complexity
* Build modular systems for scaling
* Optimize for low-cost infrastructure

---

## Typography

The interface uses **Averta**, matching the font family and five weights in
[Ticketmaster's public website](https://www.ticketmaster.com/) as checked on
8 October 2026. Original web assets come from
`https://uk.tmconst.com/rc-984d0766/fonts/averta-{regular,semibold,bold,extrabold,black}.woff`.

Web fonts live in `public/fonts/`. The equivalent decompressed OpenType/TrueType
files in `assets/fonts/` load through Expo for native screens. These preserve the
original font tables and outlines. Weight 500 uses Regular, matching the nearest
available face on Ticketmaster. UI text and inputs use `src/components/ui/app-text.tsx`
to share the family and resolve NativeWind/inline weights on native platforms.
Use that module for new UI text; icon fonts and intentional monospace text keep
their own families. The wordmark remains an SVG.

## AI-generated navigation artwork

The four main tabs now use eight AI-generated PNG assets, with an active and
inactive icon for each tab. Route selection switches visibility between loaded
states. The My Tickets symbol uses the reference’s straight, tilted document
cards, with a blue front/white rear in the active state and white outlines in the
inactive state. Artwork size is balanced from measured visible bounds, while
labels, touch targets and responsive navigation remain native UI components.

Final assets are in `assets/tabicon/ai-v1/`. The exact built-in generation prompts,
reference images and implementation notes are in
[docs/design/ai-navigation-icons.md](docs/design/ai-navigation-icons.md); the asset
manifest includes image dimensions and SHA-256 checksums. Generated pixels are
preserved. Six icons use black canvases matching the tab bar to avoid damaged
white outlines from transparent-background generation.

## Reference screens and flow

The four main tabs follow the supplied Ticketmaster mobile screenshots: Home,
Watchlist, My Tickets, and Account. Account subpages support local profile edits,
location selection, device permissions, and help. Saved events and favourites
persist on the device. Security and payment management open Ticketmaster's
account site; this app does not create a Ticketmaster login session. Resale
remains unavailable, and the existing ticket viewer and transfer flow are retained.

Home and Watchlist use discoverable app event records. Search, saved-event menus,
favourites, ticket counts, seats and orders derive from app state. Sections with
no records show empty states. The root fills the viewport; larger displays use
columns and bounded cards, and the ticket viewer scrolls vertically on short
screens. The account starts without a copied identity and offers local profile
editing. Untouched old screenshot identity and saved reference fixtures are
removed when preferences migrate; edited user profiles are preserved.

Authentication and real ticket-transfer delivery are not integrated. The current
transfer confirmation remains a prototype and must not be described as successful
recipient delivery. Apple Wallet is shown as unavailable.

## 🧠 Developer Notes

Local previews do not register the offline service worker. Development HTML
unregisters old app workers and clears only `ticketmaster-zik-*` caches before
reloading once, so Metro module IDs are not mixed across server restarts.
The web resolver uses Zustand middleware's CommonJS entry because its ESM entry
retains `import.meta` inside Metro development script factories.

Check responsive geometry, profile migration and persistence with
`node --test scripts/test-responsive-ui.cjs`.

Check preview recovery with `node --test scripts/test-preview-recovery.cjs`.
After `expo export --platform web --dev --no-minify --output-dir <directory>`,
run `node scripts/check-web-development-bundle.cjs <directory>` to check script
syntax, module dependencies, and execution of the bundled persistence middleware.

* Avoid over-engineering early
* Focus on QR validation reliability
* Use cloud services to reduce backend overhead
* Optimize images before upload
* Maintain clean database relationships
* Keep `src/components/tickets/ticket-transfer-flow.tsx` under 500 lines. Split ticket detail UI, transfer steps, viewer cards, shared context, helpers, and modal flows into focused files instead of growing this file.

---

## 📌 Status

🚧 In Development – Core features being implemented

---

## 👨‍💻 Author

Built as a scalable ticketing solution inspired by modern event platforms.

---
