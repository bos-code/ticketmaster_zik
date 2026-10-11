# App Sitemap

This document tracks the Expo Router structure for the app and the major route changes across the project history.

Note: names in parentheses such as `(tabs)` are Expo Router route groups, not literal URL segments.

## Current Sitemap

```text
/
-> /(tabs)
-> default visible tab: /discover

/(tabs)
- /discover         (Home)
- /for-you          (Watchlist: Events / Favourites)
- /my-tickets       (My Tickets: Upcoming / Past)
- /my-account       (Account)
- /sell             (hidden from tab bar)
- /add-event        (hidden from tab bar)
- `index`           (hidden tab screen / internal helper route)

/tickets
- ticket order summary / detail screen
- hero image, event info, ticket list, map/extras, and "View Tickets" button

/tickets/[orderId]
- main ticket viewer
- one ticket card at a time with horizontal paging

/admin
/admin/preview

/events/[id]
/event-directions/[id]

/account/[section]  (profile, location, inbox, security, payments, help, policies)
/browse/[id]        (legacy links redirect to app events or Home)

/settings
/settings/app

/nativewind-test
```

## Navigation Flow

```text
/
-> /(tabs)
-> /discover (Home)

/discover
-> search / event menu / favourite artist
-> /for-you (saved Events / Favourites)
-> /events/[id] (app event reservations)

/my-account
-> /account/[section]
-> Favourites opens /for-you with its Favourites tab selected

/my-tickets
-> tap ticket card
-> /tickets

/tickets
-> tap "View Tickets"
-> /tickets/[orderId]
```

The ticket flow is designed so that:

- the app opens into the tab navigator and the default visible tab is `Home`
- tapping a ticket card on `My Tickets` opens `/tickets`
- `/tickets` is the summary/detail screen with the hero and ticket list
- tapping `View Tickets` on that summary screen opens `/tickets/[orderId]`
- the viewer back action returns to `/tickets`

Saved events, favourites, profile fields, selected location, and permission preferences persist on the device. Home uses discoverable app event records, and opens the existing reservation flow. Account profiles start blank and are editable local preferences, not authenticated sessions.

## Route History

### `9977ba9`

First clear premium tab sitemap:

```text
/
-> /(tabs)

/(tabs)
- /discover
- /for-you
- /my-tickets
- /sell
- /my-account

/explore
```

### `50711c6`

Added event and settings routes plus the original ticket screen:

```text
/events/[id]
/event-directions/[id]
/settings
/settings/app
/tickets
```

### `6b4f7f7`

Added internal/admin-style routes and helper tab routes:

```text
/(tabs)/add-event
/(tabs)/index
/admin
/nativewind-test
```

### `35179fd`

Added:

```text
/admin/preview
```

### `fdea4bc`

Replaced the single ticket route with split ticket routes:

```text
/tickets
```

became:

```text
/tickets
/tickets/[orderId]
```

### `c1178ce`

Kept the same route structure as `fdea4bc`. Later changes mostly affected startup behavior, ticket data flow, and screen internals rather than the sitemap itself.
