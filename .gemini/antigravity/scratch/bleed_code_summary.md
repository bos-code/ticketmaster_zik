# PWA Immersive Hero Bleed Implementation

This document summarizes the core logic used to achieve the edge-to-edge "bleed" effect where the hero image sits behind a transparent status bar on both Native and Web (PWA).

## 1. Global CSS Setup (Web/PWA)
We capture the browser's safe area insets and expose them as CSS variables for the app to consume.

```css
/* global.css */
:root {
  --safe-area-top: 0px;
}

@supports (top: env(safe-area-inset-top)) {
  :root {
    --safe-area-top: env(safe-area-inset-top, 0px);
    --status-bar-height: env(safe-area-inset-top, 0px);
  }
}
```

## 2. Reading Insets Dynamically
A unified hook that reads `safe-area-inset-top` from CSS on Web and `useSafeAreaInsets` on Native.

```typescript
export function useImmersiveSafeAreaInsets() {
  const nativeInsets = useSafeAreaInsets();
  const webInsets = useWebSafeAreaInsets(); // Reads window.getComputedStyle(--safe-area-top)

  return Platform.OS === "web" ? webInsets : nativeInsets;
}
```

## 3. Hero Component Layout
The container uses `paddingTop` to push content down, while the background image remains at `top: 0` to fill the entire status bar area.

```tsx
// src/components/tickets/ticket-transfer-flow-hero.tsx
const insets = useImmersiveSafeAreaInsets();
const statusBarBleed = insets.top; // e.g., 44px or 59px depending on device

return (
  <View style={{ height: 300 + statusBarBleed }}>
    {/* Background Image - Starts at 0 */}
    <EdgeToEdgeHeroMedia height={300 + statusBarBleed} source={image} />

    {/* Content Container - Pushed down by the bleed */}
    <View style={[absoluteFill, { paddingTop: statusBarBleed }]}>
       <View style={{ paddingTop: 16 }}>
         <BackButton />
         <Content />
       </View>
    </View>
  </View>
);
```

## 4. Enabling Transparency
Every screen explicitly declares its status bar style to ensure it never falls back to a system default.

```tsx
// Screen Implementation
<>
  <Head>
    <meta name="theme-color" content="transparent" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  </Head>
  <StatusBar backgroundColor="transparent" style="light" translucent={true} />
</>
```
