# App Sitemap

This document tracks the Expo Router structure for the app and the major route changes across the project history.

Note: names in parentheses such as `(tabs)` are Expo Router route groups, not literal URL segments.

## Current Sitemap

```text
/
-> /(tabs)

/(tabs)
- /discover
- /for-you
- /my-tickets
- /sell
- /my-account
- /add-event        (hidden from tab bar)
- `index`           (hidden tab screen / internal helper route)

/tickets/index
- ticket order summary / ticket detail entry

/tickets/[orderId]
- ticket viewer

/admin
/admin/preview

/events/[id]
/event-directions/[id]

/settings
/settings/app

/nativewind-test
```

## Navigation Flow

```text
/my-tickets
-> /tickets/index
-> /tickets/[orderId]
```

The ticket flow is designed so that:

- tapping a ticket card opens `/tickets/index`
- tapping `View Tickets` opens `/tickets/[orderId]`
- the viewer back action returns to `/tickets/index`

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
/tickets/index
/tickets/[orderId]
```

### `c1178ce`

Kept the same route structure as `fdea4bc`. Later changes mostly affected startup behavior, ticket data flow, and screen internals rather than the sitemap itself.
