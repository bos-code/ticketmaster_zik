# MAP COMPONENT - ISOLATED SPECIFICATION

## MAP CONTAINER DIMENSIONS

```
┌────────────────────────────────────────────┐
│  PADDING: 24px (left & right)              │  ← Card padding
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │  ← Map Container
│  │  MAP ELEMENT                         │  │    Width: calc(100% - 48px)
│  │  Height: 240px (LOCKED)              │  │    Height: 240px (LOCKED)
│  │  Aspect Ratio: 1:1 OR 16:9           │  │    Aspect: 16:9 (240:426)
│  │                                      │  │    Border Radius: 16px
│  │  [MARKER PIN]                        │  │    Shadow: elevation-2
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  MARGIN BOTTOM: 16px                       │
│                                            │
└────────────────────────────────────────────┘
```

### Exact Measurements

| Property | Value | Notes |
|----------|-------|-------|
| **Container Width** | `calc(100% + 48px)` | Breaks card padding to full-bleed |
| **Container Height** | `240px` | Locked, no flex or dynamic sizing |
| **Margin Left** | `-24px` | Negative to extend beyond card |
| **Margin Right** | `-24px` | Negative to extend beyond card |
| **Margin Bottom** | `16px` | Space to next element |
| **Border Radius** | `16px` | Curved corners |
| **Background** | Gradient `#F5F5F5` → `#F0F0F0` | Fallback color |
| **Box Shadow** | `0px 2px 8px rgba(0,0,0,0.1)` | Subtle elevation |
| **Overflow** | `hidden` | Clips content at rounded corners |
| **Position** | `relative` | Establishes stacking context for controls |

---

## MAP BACKGROUND / BASE LAYER

### Color & Texture
```css
background: linear-gradient(45deg, #E5E5E5 0%, #F5F5F5 100%);
/* OR for real map: background-image: url(tile) no-repeat center/cover; */
```

### Street Grid (Visual Reference)
- **Horizontal Lines**: 2px height, gray `#DDD`, positioned at 30% and 60%
- **Vertical Lines**: 2px width, gray `#DDD`, positioned at 25% and 70%
- **Purpose**: Simulate map street grid

### Map Labels
- **Text**: `Graceland Cemetery`, `Lincoln Park`
- **Font Size**: 11px
- **Color**: `#5A5A5A` with `opacity: 0.6`
- **Position**: Absolute, 10-15% from edges
- **Pointer Events**: `none` (click-through)

---

## MAP MARKER (PIN)

### Marker Specs

```
       ┌──────┐
       │  ●   │  ← Marker
       │ PIN  │
       └──────┘
```

| Property | Value | Notes |
|----------|-------|-------|
| **Shape** | Circle | `border-radius: 50%` |
| **Diameter** | 32px | Width & Height both |
| **Fill Color** | `#6B4FBB` | Purple, vibrant |
| **Border** | `3px solid white` | White outline |
| **Box Shadow** | `0px 2px 8px rgba(0,0,0,0.2)` | Depth shadow |
| **Position** | Absolute, centered | `top: 50%; left: 50%; transform: translate(-50%, -50%)` |
| **Z-Index** | `10` | Above all map elements |
| **Animation** | Pulse (2s loop) | Scale 1.0 → 1.1 → 1.0 |

### Marker Animation (Pulse)

```css
@keyframes markerPulse {
    0%   { transform: translate(-50%, -50%) scale(1.0); }
    50%  { transform: translate(-50%, -50%) scale(1.1); }
    100% { transform: translate(-50%, -50%) scale(1.0); }
}

.marker {
    animation: markerPulse 2s ease-in-out infinite;
}
```

**Timing**: 
- Duration: 2 seconds
- Timing Function: `ease-in-out`
- Iteration: Infinite loop
- Max Scale: 1.1 (10% growth)

---

## MAP CONTROLS

### Control Panel Position
```
    TOP: 16px ┐
    RIGHT: 16px │
             ┌─┴─┐
             │ + │ ← Zoom In
             ├───┤
             │ - │ ← Zoom Out
             ├───┤
             │ ⊡ │ ← Fullscreen
             └───┘
```

| Property | Value | Notes |
|----------|-------|-------|
| **Container** | `flex; flex-direction: column; gap: 8px` | Vertical stack |
| **Position** | Absolute | `position: absolute; top: 16px; right: 16px;` |
| **Z-Index** | `20` | Above map elements |
| **Align** | Center | All buttons centered |

### Individual Button Specs

| Property | Value | Notes |
|----------|-------|-------|
| **Width** | 44px | Minimum touch target (44×44) |
| **Height** | 44px | Minimum touch target |
| **Border Radius** | 8px | Subtle corners |
| **Background** | White `#FFFFFF` | Solid background |
| **Border** | `1px solid #E5E5E5` | Thin divider |
| **Font Size** | 18px | Bold numerals |
| **Font Weight** | `700` (bold) | Strong visual weight |
| **Color** | `#1A1A1A` | Dark text |
| **Box Shadow** | `0px 2px 8px rgba(0,0,0,0.1)` | Elevation |
| **Cursor** | `pointer` | Indicates clickable |
| **Transition** | `all 200ms ease` | Smooth state change |
| **Gap Between Buttons** | 8px | Vertical spacing |

### Button States

#### Idle State
```css
.map-btn {
    background: white;
    border: 1px solid #E5E5E5;
    box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
    transform: scale(1);
}
```

#### Hover State (Desktop)
```css
.map-btn:hover {
    background: #F5F5F5;
    border-color: #CCCCCC;
}
```

#### Active/Press State
```css
.map-btn:active {
    background: #EEEEEE;
    transform: scale(0.95);
    transition: all 100ms ease;
}
```

### Button Content
- **Zoom In**: `+` (Plus sign)
- **Zoom Out**: `−` (Minus sign, not hyphen)
- **Fullscreen**: `⊡` (Square/fullscreen symbol)

---

## MAP INTERACTION ZONES

### Clickable Areas

```
┌─────────────────────────────────────────┐
│  [+] [−] [⊡]                            │ ← Controls (Z: 20)
│                                         │
│                                         │
│           [PIN: Click to pop-up]        │ ← Marker (Z: 10)
│                                         │
│                                         │
│                                         │
│  Click to open fullscreen               │ ← Base layer (Z: 1)
│                                         │
└─────────────────────────────────────────┘
```

### Interaction Events

| Element | Event | Behavior |
|---------|-------|----------|
| **Marker** | Click | Show popup/tooltip (optional) |
| **Marker** | Hover | Highlight or tooltip appears |
| **Zoom +** | Click | Zoom in (callback to map API) |
| **Zoom -** | Click | Zoom out (callback to map API) |
| **Fullscreen** | Click | Toggle fullscreen mode |
| **Base Map** | Drag | Pan map (if using real map API) |
| **Base Map** | Pinch | Zoom (mobile touch) |

---

## MAP INTEGRATION OPTIONS

### Option 1: Static Image (Simplest)
```html
<div class="map-container">
    <img src="wrigley-field-static-map.png" alt="Map" />
    <div class="map-marker"></div>
    <div class="map-controls"><!-- ... --></div>
</div>
```

**Pros**: Simple, fast, no API key needed
**Cons**: No interactivity

### Option 2: Google Maps Embed (Recommended)
```html
<div class="map-container">
    <iframe src="https://www.google.com/maps/embed?pb=..." 
            width="100%" height="240"></iframe>
    <div class="map-controls"><!-- ... --></div>
</div>
```

**Pros**: Real interactivity, official solution
**Cons**: Requires API key, iframe limitations

### Option 3: Leaflet + OpenStreetMap (Flexible)
```html
<div class="map-container" id="map"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
    const map = L.map('map').setView([41.9484, -87.6553], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([41.9484, -87.6553]).addTo(map);
</script>
```

**Pros**: Full control, customizable, open source
**Cons**: Requires setup and maintenance

### Option 4: Canvas/SVG (Custom)
```html
<canvas class="map-container"></canvas>

<script>
    const canvas = document.querySelector('.map-container');
    const ctx = canvas.getContext('2d');
    // Draw custom map representation
</script>
```

**Pros**: Maximum control, lightweight
**Cons**: Complex implementation

---

## RESPONSIVE BEHAVIOR

### Mobile-First Dimensions

| Screen Size | Map Height | Map Width | Notes |
|-------------|-----------|----------|-------|
| 320px | 200px | calc(100% + 40px) | Compact viewport |
| 375px | 240px | calc(100% + 48px) | Standard mobile |
| 414px | 240px | calc(100% + 48px) | Large mobile |
| 768px+ | 320px | calc(100% - 48px) | Tablet/desktop |

### CSS Media Queries

```css
/* Mobile (320px - 480px) */
@media (max-width: 480px) {
    .map-container {
        height: 240px;
        margin: 0 -24px 16px -24px;
    }
    
    .map-btn {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }
}

/* Tablet (481px+) */
@media (min-width: 481px) {
    .map-container {
        height: 320px;
        margin: 0 0 16px 0;
        border-radius: 12px;
    }
    
    .map-controls {
        top: 12px;
        right: 12px;
    }
}
```

---

## ACCESSIBILITY CONSIDERATIONS

### ARIA Labels
```html
<div class="map-container" 
     role="region" 
     aria-label="Map of Wrigley Field venue location">
    <!-- map content -->
</div>

<button class="map-btn" aria-label="Zoom in">+</button>
<button class="map-btn" aria-label="Zoom out">−</button>
<button class="map-btn" aria-label="View fullscreen">⊡</button>
```

### Keyboard Navigation
- **Tab**: Focus on buttons in order
- **Enter/Space**: Activate button
- **Arrow Keys**: Pan map (if implemented)
- **Escape**: Exit fullscreen

### Focus States
```css
.map-btn:focus {
    outline: 2px solid #0A84FF;
    outline-offset: 2px;
}
```

### Contrast
- Text on button: WCAG AA (4.5:1)
- Controls shadow: Visible on all backgrounds
- Marker color: High contrast (#6B4FBB on light bg)

---

## CSS VARIABLES REFERENCE

```css
:root {
    /* Map Dimensions */
    --map-height: 240px;
    --map-radius: 16px;
    --map-shadow: 0px 2px 8px rgba(0,0,0,0.1);

    /* Map Colors */
    --map-bg-from: #E5E5E5;
    --map-bg-to: #F5F5F5;
    --map-marker-color: #6B4FBB;
    --map-marker-shadow: 0px 2px 8px rgba(0,0,0,0.2);

    /* Control Styles */
    --control-size: 44px;
    --control-radius: 8px;
    --control-bg: #FFFFFF;
    --control-border: 1px solid #E5E5E5;
    --control-shadow: 0px 2px 8px rgba(0,0,0,0.1);
    --control-gap: 8px;

    /* Spacing */
    --map-margin-bottom: 16px;
    --control-offset-top: 16px;
    --control-offset-right: 16px;

    /* Animation */
    --marker-pulse-duration: 2s;
    --marker-pulse-scale: 1.1;
}
```

---

## DEVELOPMENT CHECKLIST

- [ ] Map container dimensions locked (240px height)
- [ ] Negative margins applied (-24px L/R) for full-bleed
- [ ] Border radius set to 16px
- [ ] Marker positioned absolute, centered
- [ ] Marker animation applied (2s pulse)
- [ ] Controls positioned absolute (top 16px, right 16px)
- [ ] Control buttons are 44×44px minimum
- [ ] Control shadow applied for elevation
- [ ] Active state scale (0.95) implemented
- [ ] Responsive breakpoints tested (320px, 375px, 414px, 768px)
- [ ] ARIA labels added to controls
- [ ] Focus states visible with outline
- [ ] Cross-browser tested (Safari, Chrome, Firefox)
- [ ] Mobile touch interactions tested
- [ ] Performance optimized (minimal repaints during pulse animation)

---

## FULLSCREEN MODE (Optional)

When fullscreen is activated:

```css
.map-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    border-radius: 0;
    margin: 0;
}

.map-controls.fullscreen {
    top: env(safe-area-inset-top, 12px);
    right: env(safe-area-inset-right, 12px);
}

/* Add close button */
.close-fullscreen {
    position: absolute;
    top: 12px;
    left: 12px;
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.9);
    border-radius: 8px;
    border: none;
    font-size: 18px;
    cursor: pointer;
    z-index: 10000;
}
```

---

## PERFORMANCE OPTIMIZATION

### Animation Performance
```css
.map-marker {
    /* Use transform instead of width/height */
    animation: markerPulse 2s ease-in-out infinite;
    /* GPU acceleration */
    transform: translateZ(0);
    will-change: transform;
}

@keyframes markerPulse {
    0%, 100% { 
        transform: translate(-50%, -50%) scale(1) translateZ(0); 
    }
    50% { 
        transform: translate(-50%, -50%) scale(1.1) translateZ(0); 
    }
}
```

### Lazy Loading Map
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadMap(entry.target);
            observer.unobserve(entry.target);
        }
    });
});

observer.observe(document.querySelector('.map-container'));
```

### Image Optimization
If using static map image:
- Format: WebP with PNG fallback
- Size: Optimized for 1x and 2x density
- Lazy load with `loading="lazy"` attribute