# Album Burst — Design & Typography Spec

Version 1.0 · For implementation reference

-----

## 1. Typography

### Font Stack

Three fonts, all from Google Fonts — load in a single `<link>` block.

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

|Role               |Font            |Fallback                |
|-------------------|----------------|------------------------|
|Display / editorial|Instrument Serif|Georgia, serif          |
|Data / labels      |DM Mono         |'Courier New', monospace|
|Body / UI          |DM Sans         |system-ui, sans-serif   |

**Pairing rationale:** Instrument Serif for anything human and contextual (album names, artist names, overlay titles). DM Mono for anything that reads as data (BPM, duration, key, track number). DM Sans for everything functional (buttons, instructions, descriptions). The serif/mono split reinforces the app's core idea — musical data made visual.

-----

### Type Scale

|Token    |Size          |Line Height|Weight|Font            |Usage                                                |
|---------|--------------|-----------|------|----------------|-----------------------------------------------------|
|`display`|32px / 2rem   |1.2        |400   |Instrument Serif|Album title, visualization screen                    |
|`title`  |22px / 1.375rem|1.3       |400   |Instrument Serif|Artist name, overlay titles, song card song name     |
|`body`   |16px / 1rem   |1.6        |400   |DM Sans         |Instructional text, legend descriptions, overlay copy|
|`ui`     |15px / 0.9375rem|1.4      |700   |DM Sans         |Buttons (bold); nav labels, bottom bar               |
|`label`  |14px / 0.875rem|1.4       |500   |DM Mono         |Key, BPM, mode — data field values                   |
|`caption`|12px / 0.75rem |1.4       |400   |DM Mono         |Track number, secondary metadata                     |

**Usage notes:**

- Song name in the Song Card uses `title` in Instrument Serif — the most editorial moment in the UI.
- All BPM, duration (m:ss), key, and mode values use `label` in DM Mono.
- Field labels ("BPM", "KEY", "MODE") may use `caption` in DM Mono, uppercased.

-----

## 2. UI Color Palette

The app shell is dark and cool-neutral. The visualization artwork is always the warmest, most saturated thing on screen.

### Base Tokens

|Token           |Hex      |Usage                                            |
|----------------|---------|-------------------------------------------------|
|`surface-0`     |`#0E1117`|App background, deepest layer                    |
|`surface-1`     |`#161B24`|Bottom sheets, overlays, cards                   |
|`surface-2`     |`#1F2633`|Elevated surfaces, active/hover states           |
|`border`        |`#2A3140`|Dividers, input outlines, thumbnail borders      |
|`text-primary`  |`#F0F2F5`|Headings, song names, primary content            |
|`text-secondary`|`#8B93A1`|Metadata, secondary labels, descriptions         |
|`text-tertiary` |`#525A68`|Placeholders, disabled, hint text                |
|`accent`        |`#7B9FD4`|CTAs, active palette ring, interactive highlights|

The entire stack has a slight blue-cool undertone — not visibly "blue," but not dead neutral gray either. Think overcast sky.

### Accent Usage

- CREATE button background
- Active palette selection ring
- Links and interactive text elements
- Focus states

-----

## 3. Visualization Screen — Light Background Override

Some palettes use light backgrounds (`bg` values that are near-white or light-colored). When the visualization fills the screen on the Visualization Screen, the bottom bar and top labels float directly over this bg color. The standard dark shell text/icons become unreadable.

### Light Background Palettes (current set)

These four palettes trigger the override:

|Palette         |bg       |
|----------------|---------|
|Terracotta Punch|`#DAD2C3`|
|Glacier Punch   |`#EEF6FF`|
|Mint Condition  |`#EAFBF5`|
|Prism Bloom     |`#FFF6E0`|

### Implementation

Add a `lightBg: true` flag to each light palette object in `palettes.js`:

```js
{
  id: "glacier-punch",
  name: "Glacier Punch",
  bg: "#EEF6FF",
  colorStart: "#A9D3E5",
  colorEnd: "#4361EE",
  lightBg: true,  // triggers dark UI override on Visualization Screen
},
```

Alternatively, compute luminance at runtime:

```js
function isLightBg(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4;
}
```

### Override Tokens (Visualization Screen only)

|Token               |Dark bg (default) |Light bg override       |
|--------------------|------------------|------------------------|
|`viz-text-primary`  |`#F0F2F5`         |`#0E1117`               |
|`viz-text-secondary`|`#8B93A1`         |`#3A3F4A`               |
|`viz-icon`          |`#F0F2F5`         |`#0E1117`               |
|`viz-bar-bg`        |`rgba(0,0,0,0.30)`|`rgba(255,255,255,0.55)`|
|`viz-bar-border`    |`transparent`     |`rgba(0,0,0,0.08)`      |

**Affected elements:** top-left album/artist label, top-right ⓘ button, bottom bar (back arrow, palette icon, download icon). Everything else is inside an overlay and unaffected.

-----

## 4. Visualization Thumbnails — Home Screen

On the Home Screen, album visualizations are displayed as thumbnail squares in a scrolling feed. Many palettes have dark backgrounds, which can cause thumbnails to bleed into the dark app background (`surface-0`).

Apply to each thumbnail square:

- **Shadow:** `box-shadow: 0 2px 12px rgba(0,0,0,0.5)` — enough lift to separate dark-bg thumbnails from the page without looking heavy on light-bg ones
- **Hairline border:** `outline: 1px solid rgba(255,255,255,0.06)` — a near-invisible rim that catches the edge of dark thumbnails against the dark background

These two together handle the full palette range — the shadow does the work for dark bgs, the border adds just enough definition for light bgs without looking like a frame.

-----

## 5. Overlays & Bottom Sheets

Two distinct overlay patterns are used in the app:

**Standard bottom sheets** (Upload, Palette Picker, Legend) — anchored to the bottom edge, full width:

- Background: `surface-1` (`#161B24`)
- Border radius top: `20px`
- Top handle pill: 40 × 4px, `border` color (`#2A3140`), centered, `space-3` margin above and below

**Floating card carousel** (Song Card) — inset from screen edges, not anchored to the bottom, sitting above the visualization with previous/next cards partially visible to either side. Specific sizing and positioning TBD at component design stage.

Both patterns use `surface-1` as their base surface color.

-----

## 6. Tailwind Config Reference

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0E1117',
          1: '#161B24',
          2: '#1F2633',
        },
        border: '#2A3140',
        accent: '#7B9FD4',
        text: {
          primary: '#F0F2F5',
          secondary: '#8B93A1',
          tertiary: '#525A68',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['DM Mono', 'Courier New', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['2rem',      { lineHeight: '1.2' }],
        'title':   ['1.375rem',  { lineHeight: '1.3' }],
        'body':    ['1rem',      { lineHeight: '1.6' }],
        'ui':      ['0.9375rem', { lineHeight: '1.4' }],
        'label':   ['0.875rem',  { lineHeight: '1.4', fontWeight: '500' }],
        'caption': ['0.75rem',   { lineHeight: '1.4' }],
      },
    },
  },
}
```

-----

## 7. Spacing

Built on a 4px base unit. Maps cleanly onto Tailwind's default spacing scale — no custom config required, just documented canonical values for this project.

|Token    |Value|Tailwind         |Typical usage                          |
|---------|-----|-----------------|---------------------------------------|
|`space-1`|4px  |`p-1` / `gap-1`  |Icon nudges, hairline gaps             |
|`space-2`|8px  |`p-2` / `gap-2`  |Tight internal padding, caption spacing|
|`space-3`|12px |`p-3` / `gap-3`  |Compact component padding              |
|`space-4`|16px |`p-4` / `gap-4`  |Standard padding, card internals       |
|`space-5`|24px |`p-6` / `gap-6`  |Section spacing, generous padding      |
|`space-6`|32px |`p-8` / `gap-8`  |Between major UI zones                 |
|`space-7`|48px |`p-12` / `gap-12`|Large breathing room                   |
|`space-8`|64px |`p-16` / `gap-16`|Bottom bar clearance, safe area buffer |

### App-Wide Anchors

These specific values should be applied consistently across all screens and components:

|Element                                     |Value   |Token    |
|--------------------------------------------|--------|---------|
|Bottom bar height                           |64px    |`space-8`|
|Bottom sheet horizontal padding             |24px    |`space-5`|
|Visualization breathing room (above + below)|48px    |`space-7`|
|Bottom sheet handle pill — vertical margin  |12px    |`space-3`|
|Bottom sheet handle pill — size             |40 × 4px|—        |
|Overlay content top padding (below handle)  |16px    |`space-4`|
|Standard section gap inside overlays        |24px    |`space-5`|

-----

## 8. Border Radius

Radii are friendly and rounded, complementing the organic hand-drawn quality of the visualization artwork — without being bubbly or toy-like.

|Token        |Value |Tailwind        |Usage                                      |
|-------------|------|----------------|-------------------------------------------|
|`radius-sm`  |6px   |`rounded-sm`    |Buttons, chips, small tags                 |
|`radius-md`  |12px  |`rounded-md`    |Thumbnail squares, inline cards, copy block|
|`radius-lg`  |20px  |`rounded-lg`    |Bottom sheets, floating song card          |
|`radius-full`|9999px|`rounded-full`  |Handle pill, icon buttons                  |

### Application

**Thumbnails** — `radius-md` (12px). Rounded enough to feel intentional without fighting the square geometry of the artwork inside.

**Bottom sheets** — `radius-lg` (20px) on top corners only. Anchored sheets are flat at the bottom edge.

**Floating song card** — `radius-lg` (20px) on all four corners. Fully detached from screen edges so all corners are visible.

**Buttons** — `radius-sm` (6px). Crisp and functional — pill-shaped buttons would feel too casual for the primary CREATE and UPLOAD actions.

**Handle pill** — `radius-full`. Small enough that full rounding is always correct.

### Tailwind Config Addition

```js
borderRadius: {
  'sm':   '6px',
  'md':   '12px',
  'lg':   '20px',
  'full': '9999px',
},
```

-----

## 9. Open Design Items (not in this spec)

- Key/Legend overlay — visual redesign (v1 is text-only placeholder)
- Song Card — visual redesign (v1 is plain list placeholder)
- Download overlay — format options, high-res PNG export
- Desktop layout — mobile-first only in v1
